import { NextResponse } from "next/server";
import { computeAvailability } from "@/lib/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date query param (YYYY-MM-DD) is required" }, { status: 400 });
  }

  try {
    const slots = await computeAvailability(date);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }
}

