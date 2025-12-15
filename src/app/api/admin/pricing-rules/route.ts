import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rules = await prisma.pricingRule.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ rules: [] });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, description, ruleType, adjustment, amount, startHour = null, endHour = null, isActive = true } = body;

  if (!name || !ruleType || !adjustment || amount === undefined) {
    return NextResponse.json({ error: "name, ruleType, adjustment, amount required" }, { status: 400 });
  }

  const rule = await prisma.pricingRule.create({
    data: {
      name,
      description,
      ruleType,
      adjustment,
      amount: Number(amount),
      startHour: startHour !== null ? Number(startHour) : null,
      endHour: endHour !== null ? Number(endHour) : null,
      isActive: Boolean(isActive),
    },
  });

  return NextResponse.json({ rule });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const rule = await prisma.pricingRule.update({
    where: { id: Number(id) },
    data: {
      name: updates.name,
      description: updates.description,
      ruleType: updates.ruleType,
      adjustment: updates.adjustment,
      amount: updates.amount !== undefined ? Number(updates.amount) : undefined,
      startHour: updates.startHour !== undefined ? Number(updates.startHour) : undefined,
      endHour: updates.endHour !== undefined ? Number(updates.endHour) : undefined,
      isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : undefined,
    },
  });

  return NextResponse.json({ rule });
}

