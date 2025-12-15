import { getHours, getDay } from "date-fns";
import { prisma } from "./prisma";

export type PricingInput = {
  courtId: number;
  coachId?: number;
  equipment: { id: number; quantity: number }[];
  startTime: Date;
  durationHrs: number;
};

export type PricingBreakdown = {
  baseCourt: number;
  adjustments: { label: string; amount: number }[];
  equipmentTotal: number;
  coachTotal: number;
  total: number;
};

const isWeekend = (d: Date) => {
  const day = getDay(d);
  return day === 0 || day === 6;
};

export async function calculatePricing(input: PricingInput): Promise<PricingBreakdown> {
  const court = await prisma.court.findUniqueOrThrow({ where: { id: input.courtId } });
  const rules = await prisma.pricingRule.findMany({ where: { isActive: true } });

  let baseCourt = court.baseRate * input.durationHrs;
  const adjustments: { label: string; amount: number }[] = [];

  const startHour = getHours(input.startTime);

  for (const rule of rules) {
    if (rule.ruleType === "PEAK_HOUR") {
      if (rule.startHour !== null && rule.endHour !== null && startHour >= rule.startHour && startHour < rule.endHour) {
        const amount = rule.amount * input.durationHrs;
        baseCourt += amount;
        adjustments.push({ label: rule.name, amount });
      }
    }

    if (rule.ruleType === "WEEKEND" && isWeekend(input.startTime)) {
      const amount = rule.amount * input.durationHrs;
      baseCourt += amount;
      adjustments.push({ label: rule.name, amount });
    }

    if (rule.ruleType === "INDOOR_PREMIUM" && court.type === "INDOOR") {
      const amount = rule.amount * input.durationHrs;
      baseCourt += amount;
      adjustments.push({ label: rule.name, amount });
    }
  }

  const equipmentRecords = await prisma.equipment.findMany({
    where: { id: { in: input.equipment.map((e) => e.id) } },
  });

  let equipmentTotal = 0;
  for (const choice of input.equipment) {
    const record = equipmentRecords.find((e) => e.id === choice.id);
    if (!record) continue;
    equipmentTotal += record.baseFee * choice.quantity * input.durationHrs;
  }

  let coachTotal = 0;
  if (input.coachId) {
    const coach = await prisma.coach.findUniqueOrThrow({ where: { id: input.coachId } });
    coachTotal = coach.ratePerHour * input.durationHrs;
  }

  const total = baseCourt + equipmentTotal + coachTotal;

  return {
    baseCourt,
    adjustments,
    equipmentTotal,
    coachTotal,
    total,
  };
}

