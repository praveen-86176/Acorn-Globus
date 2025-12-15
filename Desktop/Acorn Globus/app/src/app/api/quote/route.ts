import { NextResponse } from "next/server";
import { calculatePricing } from "@/lib/pricing";

type IncomingEquipment = { id: number; quantity: number };

export async function POST(request: Request) {
  const body = await request.json();
  const { courtId, coachId, equipment = [], startTime, durationHrs = 1 } = body;

  if (!courtId || !startTime) {
    return NextResponse.json({ error: "courtId and startTime are required" }, { status: 400 });
  }

  try {
    const pricing = await calculatePricing({
      courtId: Number(courtId),
      coachId: coachId ? Number(coachId) : undefined,
      equipment: (equipment as IncomingEquipment[]).map((e) => ({
        id: Number(e.id),
        quantity: Number(e.quantity) || 0,
      })),
      startTime: new Date(startTime),
      durationHrs: Number(durationHrs) || 1,
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to compute pricing" }, { status: 500 });
  }
}

