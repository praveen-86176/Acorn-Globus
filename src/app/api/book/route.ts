import { NextResponse } from "next/server";
import { createBooking } from "@/lib/bookings";

type IncomingEquipment = { id: number; quantity: number };

export async function POST(request: Request) {
  const body = await request.json();
  const { userName, contact, courtId, coachId, equipment = [], startTime, durationHrs = 1, notes } = body;

  if (!userName || !courtId || !startTime) {
    return NextResponse.json({ error: "userName, courtId, and startTime are required" }, { status: 400 });
  }

  try {
    const result = await createBooking({
      userName,
      contact,
      courtId: Number(courtId),
      coachId: coachId ? Number(coachId) : undefined,
      equipment: (equipment as IncomingEquipment[]).map((e) => ({
        id: Number(e.id),
        quantity: Number(e.quantity) || 0,
      })),
      startTime: new Date(startTime),
      durationHrs: Number(durationHrs) || 1,
      notes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Booking failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

