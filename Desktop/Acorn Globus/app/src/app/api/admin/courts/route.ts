import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courts = await prisma.court.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ courts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, location, type, baseRate, isActive = true } = body;

  if (!name || !location || !type || !baseRate) {
    return NextResponse.json({ error: "name, location, type, baseRate required" }, { status: 400 });
  }

  const court = await prisma.court.create({
    data: { name, location, type, baseRate: Number(baseRate), isActive: Boolean(isActive) },
  });

  return NextResponse.json({ court });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const court = await prisma.court.update({
    where: { id: Number(id) },
    data: {
      name: updates.name,
      location: updates.location,
      type: updates.type,
      baseRate: updates.baseRate !== undefined ? Number(updates.baseRate) : undefined,
      isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : undefined,
    },
  });

  return NextResponse.json({ court });
}

