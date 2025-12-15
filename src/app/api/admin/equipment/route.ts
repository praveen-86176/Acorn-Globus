import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const equipment = await prisma.equipment.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ equipment });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, quantity, baseFee, isActive = true } = body;
  if (!name || quantity === undefined || baseFee === undefined) {
    return NextResponse.json({ error: "name, quantity, baseFee required" }, { status: 400 });
  }

  const equipment = await prisma.equipment.create({
    data: {
      name,
      quantity: Number(quantity),
      baseFee: Number(baseFee),
      isActive: Boolean(isActive),
    },
  });

  return NextResponse.json({ equipment });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const equipment = await prisma.equipment.update({
    where: { id: Number(id) },
    data: {
      name: updates.name,
      quantity: updates.quantity !== undefined ? Number(updates.quantity) : undefined,
      baseFee: updates.baseFee !== undefined ? Number(updates.baseFee) : undefined,
      isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : undefined,
    },
  });

  return NextResponse.json({ equipment });
}

