import { NextResponse } from "next/server";
import { getRecentBookings } from "@/lib/bookings";

export async function GET() {
  try {
    const bookings = await getRecentBookings(15);
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not fetch bookings" }, { status: 500 });
  }
}

