import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AvailabilityInput = { dayOfWeek: number; startHour: number; endHour: number };

export async function GET() {
  const coaches = await prisma.coach.findMany({
    include: { availability: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ coaches });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, bio, city, ratePerHour, availability = [], isActive = true } = body;
  if (!name || !bio || !city || ratePerHour === undefined) {
    return NextResponse.json({ error: "name, bio, city, ratePerHour required" }, { status: 400 });
  }

  const coach = await prisma.$transaction(async (tx) => {
    const created = await tx.coach.create({
      data: {
        name,
        bio,
        city,
        ratePerHour: Number(ratePerHour),
        isActive: Boolean(isActive),
      },
    });

    if (availability.length) {
      await tx.coachAvailability.createMany({
        data: (availability as AvailabilityInput[]).map((slot) => ({
          coachId: created.id,
          dayOfWeek: Number(slot.dayOfWeek),
          startHour: Number(slot.startHour),
          endHour: Number(slot.endHour),
        })),
      });
    }

    return created;
  });

  return NextResponse.json({ coach });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, availability = [], ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const coach = await prisma.$transaction(async (tx) => {
    const updated = await tx.coach.update({
      where: { id: Number(id) },
      data: {
        name: updates.name,
        bio: updates.bio,
        city: updates.city,
        ratePerHour: updates.ratePerHour !== undefined ? Number(updates.ratePerHour) : undefined,
        isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : undefined,
      },
    });

    await tx.coachAvailability.deleteMany({ where: { coachId: updated.id } });
    if (availability.length) {
      await tx.coachAvailability.createMany({
        data: (availability as AvailabilityInput[]).map((slot) => ({
          coachId: updated.id,
          dayOfWeek: Number(slot.dayOfWeek),
          startHour: Number(slot.startHour),
          endHour: Number(slot.endHour),
        })),
      });
    }

    return updated;
  });

  return NextResponse.json({ coach });
}

