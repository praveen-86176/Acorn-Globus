import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.bookingEquipment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.coachAvailability.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.court.deleteMany();

  const courts = await prisma.court.createMany({
    data: [
      {
        name: "Indiranagar Indoor 1",
        location: "Bengaluru - Indiranagar",
        type: "INDOOR",
        baseRate: 450,
      },
      {
        name: "Indiranagar Indoor 2",
        location: "Bengaluru - Indiranagar",
        type: "INDOOR",
        baseRate: 430,
      },
      {
        name: "Koramangala Outdoor 1",
        location: "Bengaluru - Koramangala",
        type: "OUTDOOR",
        baseRate: 320,
      },
      {
        name: "Koramangala Outdoor 2",
        location: "Bengaluru - Koramangala",
        type: "OUTDOOR",
        baseRate: 300,
      },
    ],
  });

  console.info(`Seeded ${courts.count} courts`);

  const equipment = await prisma.equipment.createMany({
    data: [
      { name: "Yonex Voltric Racket", quantity: 12, baseFee: 120 },
      { name: "Non-marking Shoes", quantity: 8, baseFee: 90 },
      { name: "Feather Shuttle Tube", quantity: 10, baseFee: 70 },
    ],
  });

  console.info(`Seeded ${equipment.count} equipment items`);

  const coaches = await prisma.coach.createMany({
    data: [
      {
        name: "Ayesha Khan",
        bio: "Former Karnataka state player; focuses on footwork and defense.",
        city: "Bengaluru",
        ratePerHour: 900,
      },
      {
        name: "Rahul Menon",
        bio: "Morning coach; emphasizes stamina and consistency drills.",
        city: "Bengaluru",
        ratePerHour: 750,
      },
      {
        name: "Arjun Iyer",
        bio: "Weekend specialist with match-play strategy sessions.",
        city: "Bengaluru",
        ratePerHour: 1050,
      },
    ],
  });

  console.info(`Seeded ${coaches.count} coaches`);

  const [ayesha, rahul, arjun] = await prisma.coach.findMany({ orderBy: { id: "asc" } });

  await prisma.coachAvailability.createMany({
    data: [
      // Ayesha - weekday evenings
      { coachId: ayesha.id, dayOfWeek: 1, startHour: 18, endHour: 22 }, // Monday
      { coachId: ayesha.id, dayOfWeek: 3, startHour: 18, endHour: 22 }, // Wednesday
      { coachId: ayesha.id, dayOfWeek: 5, startHour: 16, endHour: 21 }, // Friday
      // Rahul - early mornings
      { coachId: rahul.id, dayOfWeek: 1, startHour: 6, endHour: 10 }, // Monday
      { coachId: rahul.id, dayOfWeek: 2, startHour: 6, endHour: 10 }, // Tuesday
      { coachId: rahul.id, dayOfWeek: 4, startHour: 6, endHour: 10 }, // Thursday
      // Arjun - weekends
      { coachId: arjun.id, dayOfWeek: 6, startHour: 8, endHour: 14 }, // Saturday
      { coachId: arjun.id, dayOfWeek: 0, startHour: 8, endHour: 14 }, // Sunday
    ],
  });

  await prisma.pricingRule.createMany({
    data: [
      {
        name: "Peak hours (6-9 PM)",
        description: "Early evening surge for office-goers",
        ruleType: "PEAK_HOUR",
        adjustment: "FIXED",
        amount: 150,
        startHour: 18,
        endHour: 21,
      },
      {
        name: "Weekend premium",
        description: "Applies on Saturday and Sunday",
        ruleType: "WEEKEND",
        adjustment: "FIXED",
        amount: 120,
      },
      {
        name: "Indoor premium",
        description: "Better lighting and wood floor maintenance",
        ruleType: "INDOOR_PREMIUM",
        adjustment: "FIXED",
        amount: 80,
      },
    ],
  });

  console.info("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

