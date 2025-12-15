import { addHours, startOfDay, endOfDay, getDay, setHours, setMinutes } from "date-fns";
import { prisma } from "./prisma";

export const FACILITY_START_HOUR = 6;
export const FACILITY_END_HOUR = 22;
export const SLOT_DURATION_HRS = 1;

export type SlotAvailability = {
  startTime: Date;
  availableCourts: { id: number; name: string; type: string; baseRate: number }[];
  availableCoaches: { id: number; name: string }[];
  equipmentAvailability: { id: number; name: string; available: number }[];
};

const overlaps = (startA: Date, durationA: number, startB: Date, durationB: number) => {
  const endA = addHours(startA, durationA);
  const endB = addHours(startB, durationB);
  return startA < endB && startB < endA;
};

export async function computeAvailability(date: string): Promise<SlotAvailability[]> {
  const targetDate = new Date(`${date}T00:00:00`);
  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      startTime: {
        gte: startOfDay(targetDate),
        lt: endOfDay(targetDate),
      },
    },
    include: {
      equipment: true,
    },
  });

  const courts = await prisma.court.findMany({ where: { isActive: true } });
  const coaches = await prisma.coach.findMany({
    where: { isActive: true },
    include: { availability: true },
  });
  const equipment = await prisma.equipment.findMany({ where: { isActive: true } });

  const slots: SlotAvailability[] = [];
  const dayOfWeek = getDay(targetDate);

  for (let hour = FACILITY_START_HOUR; hour < FACILITY_END_HOUR; hour += SLOT_DURATION_HRS) {
    const slotStart = setMinutes(setHours(targetDate, hour), 0);
    const slotEnd = addHours(slotStart, SLOT_DURATION_HRS);

    const availableCourts = courts.filter((court) => {
      const conflicts = bookings.some(
        (b) => b.courtId === court.id && overlaps(slotStart, SLOT_DURATION_HRS, b.startTime, b.durationHrs),
      );
      return !conflicts;
    });

    const availableCoaches = coaches
      .filter((coach) =>
        coach.availability.some((a) => a.dayOfWeek === dayOfWeek && hour >= a.startHour && slotEnd.getHours() <= a.endHour),
      )
      .filter((coach) => {
        const conflicts = bookings.some(
          (b) => b.coachId === coach.id && overlaps(slotStart, SLOT_DURATION_HRS, b.startTime, b.durationHrs),
        );
        return !conflicts;
      })
      .map((coach) => ({ id: coach.id, name: coach.name }));

    const equipmentAvailability = equipment.map((item) => {
      const used = bookings.reduce((sum, b) => {
        if (!overlaps(slotStart, SLOT_DURATION_HRS, b.startTime, b.durationHrs)) return sum;
        const match = b.equipment.find((e) => e.equipmentId === item.id);
        return sum + (match?.quantity ?? 0);
      }, 0);
      return {
        id: item.id,
        name: item.name,
        available: Math.max(item.quantity - used, 0),
      };
    });

    slots.push({
      startTime: slotStart,
      availableCourts: availableCourts.map((c) => ({ id: c.id, name: c.name, type: c.type, baseRate: c.baseRate })),
      availableCoaches,
      equipmentAvailability,
    });
  }

  return slots;
}

