import { addHours, startOfDay, endOfDay } from "date-fns";
import { prisma } from "./prisma";
import { calculatePricing } from "./pricing";

type BookingInput = {
  userName: string;
  contact?: string;
  courtId: number;
  coachId?: number;
  equipment: { id: number; quantity: number }[];
  startTime: Date;
  durationHrs: number;
  notes?: string;
};

const overlaps = (startA: Date, durationA: number, startB: Date, durationB: number) => {
  const endA = addHours(startA, durationA);
  const endB = addHours(startB, durationB);
  return startA < endB && startB < endA;
};

function bookingRef() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BLR-${stamp}-${rand}`;
}

async function assertCourtAvailability(courtId: number, start: Date, duration: number) {
  const conflicts = await prisma.booking.findMany({
    where: {
      courtId,
      status: "CONFIRMED",
      startTime: {
        gte: startOfDay(start),
        lt: endOfDay(start),
      },
    },
  });

  conflicts.forEach((booking) => {
    if (overlaps(start, duration, booking.startTime, booking.durationHrs)) {
      throw new Error("Court has a conflicting booking for that slot.");
    }
  });
}

async function assertCoachAvailability(coachId: number, start: Date, duration: number) {
  const conflicts = await prisma.booking.findMany({
    where: {
      coachId,
      status: "CONFIRMED",
      startTime: {
        gte: startOfDay(start),
        lt: endOfDay(start),
      },
    },
  });
  conflicts.forEach((booking) => {
    if (overlaps(start, duration, booking.startTime, booking.durationHrs)) {
      throw new Error("Coach is already booked for that slot.");
    }
  });
}

async function assertEquipmentAvailability(equipment: { id: number; quantity: number }[], start: Date, duration: number) {
  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      startTime: {
        gte: startOfDay(start),
        lt: endOfDay(start),
      },
    },
    include: { equipment: true },
  });

  for (const item of equipment) {
    const used = bookings.reduce((sum, b) => {
      if (!overlaps(start, duration, b.startTime, b.durationHrs)) return sum;
      const line = b.equipment.find((e) => e.equipmentId === item.id);
      return sum + (line?.quantity ?? 0);
    }, 0);

    const record = await prisma.equipment.findUniqueOrThrow({ where: { id: item.id } });
    if (used + item.quantity > record.quantity) {
      throw new Error(`Only ${Math.max(record.quantity - used, 0)} of ${record.name} left for that slot.`);
    }
  }
}

export async function createBooking(input: BookingInput) {
  await assertCourtAvailability(input.courtId, input.startTime, input.durationHrs);
  if (input.coachId) {
    await assertCoachAvailability(input.coachId, input.startTime, input.durationHrs);
  }
  await assertEquipmentAvailability(input.equipment, input.startTime, input.durationHrs);

  const pricing = await calculatePricing({
    courtId: input.courtId,
    coachId: input.coachId,
    equipment: input.equipment,
    startTime: input.startTime,
    durationHrs: input.durationHrs,
  });

  const created = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        reference: bookingRef(),
        userName: input.userName,
        contact: input.contact,
        courtId: input.courtId,
        coachId: input.coachId,
        startTime: input.startTime,
        durationHrs: input.durationHrs,
        totalPrice: pricing.total,
        status: "CONFIRMED",
        notes: input.notes,
      },
    });

    if (input.equipment.length) {
      await tx.bookingEquipment.createMany({
        data: input.equipment.map((e) => ({
          bookingId: booking.id,
          equipmentId: e.id,
          quantity: e.quantity,
        })),
      });
    }

    return booking;
  });

  return { booking: created, pricing };
}

export async function getRecentBookings(limit = 10) {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      court: true,
      coach: true,
      equipment: {
        include: {
          equipment: true,
        },
      },
    },
  });
}

