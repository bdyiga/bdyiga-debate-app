import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (pw) => bcrypt.hashSync(pw, 10);

async function main() {
  const manager1 = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: { email: "manager@example.com", password: hash("password"), name: "Alice Manager", role: "MANAGER" },
  });
  const manager2 = await prisma.user.upsert({
    where: { email: "manager2@example.com" },
    update: {},
    create: { email: "manager2@example.com", password: hash("password"), name: "Bob Manager", role: "MANAGER" },
  });

  const judge1 = await prisma.user.upsert({
    where: { email: "judge1@example.com" },
    update: {},
    create: { email: "judge1@example.com", password: hash("password"), name: "Carol Judge", role: "JUDGE" },
  });
  const judge2 = await prisma.user.upsert({
    where: { email: "judge2@example.com" },
    update: {},
    create: { email: "judge2@example.com", password: hash("password"), name: "Dave Judge", role: "JUDGE" },
  });
  const judge3 = await prisma.user.upsert({
    where: { email: "judge3@example.com" },
    update: {},
    create: { email: "judge3@example.com", password: hash("password"), name: "Eve Judge", role: "JUDGE" },
  });

  const student1 = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: {},
    create: { email: "student1@example.com", password: hash("password"), name: "Frank Student", role: "STUDENT" },
  });
  const student2 = await prisma.user.upsert({
    where: { email: "student2@example.com" },
    update: {},
    create: { email: "student2@example.com", password: hash("password"), name: "Grace Student", role: "STUDENT" },
  });
  const student3 = await prisma.user.upsert({
    where: { email: "student3@example.com" },
    update: {},
    create: { email: "student3@example.com", password: hash("password"), name: "Hank Student", role: "STUDENT" },
  });
  const student4 = await prisma.user.upsert({
    where: { email: "student4@example.com" },
    update: {},
    create: { email: "student4@example.com", password: hash("password"), name: "Ivy Student", role: "STUDENT" },
  });
  const student5 = await prisma.user.upsert({
    where: { email: "student5@example.com" },
    update: {},
    create: { email: "student5@example.com", password: hash("password"), name: "Jake Student", role: "STUDENT" },
  });
  const student6 = await prisma.user.upsert({
    where: { email: "student6@example.com" },
    update: {},
    create: { email: "student6@example.com", password: hash("password"), name: "Kim Student", role: "STUDENT" },
  });

  const tournament = await prisma.tournament.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Fall Invitational 2026",
      description: "Annual Lincoln-Douglas debate invitational",
      resolution: "Resolved: Civil disobedience in a democracy is morally justified.",
      date: new Date("2026-04-15"),
    },
  });

  const round1 = await prisma.round.upsert({ where: { id: 1 }, update: {}, create: { roundNumber: 1, tournamentId: tournament.id } });
  const round2 = await prisma.round.upsert({ where: { id: 2 }, update: {}, create: { roundNumber: 2, tournamentId: tournament.id } });
  const round3 = await prisma.round.upsert({ where: { id: 3 }, update: {}, create: { roundNumber: 3, tournamentId: tournament.id } });

  const p1 = await prisma.pairing.upsert({ where: { id: 1 }, update: {}, create: { roundId: round1.id, affirmativeId: student1.id, negativeId: student2.id, judgeId: judge1.id, room: "Room 101" } });
  const p2 = await prisma.pairing.upsert({ where: { id: 2 }, update: {}, create: { roundId: round1.id, affirmativeId: student3.id, negativeId: student4.id, judgeId: judge2.id, room: "Room 102" } });
  await prisma.pairing.upsert({ where: { id: 3 }, update: {}, create: { roundId: round1.id, affirmativeId: student5.id, negativeId: student6.id, judgeId: judge3.id, room: "Room 103" } });

  await prisma.pairing.upsert({ where: { id: 4 }, update: {}, create: { roundId: round2.id, affirmativeId: student1.id, negativeId: student3.id, judgeId: judge2.id, room: "Room 201" } });
  await prisma.pairing.upsert({ where: { id: 5 }, update: {}, create: { roundId: round2.id, affirmativeId: student2.id, negativeId: student5.id, judgeId: judge1.id, room: "Room 202" } });
  await prisma.pairing.upsert({ where: { id: 6 }, update: {}, create: { roundId: round2.id, affirmativeId: student4.id, negativeId: student6.id, judgeId: judge3.id, room: "Room 203" } });

  await prisma.pairing.upsert({ where: { id: 7 }, update: {}, create: { roundId: round3.id, affirmativeId: student1.id, negativeId: student4.id, judgeId: judge3.id, room: "Room 301" } });
  await prisma.pairing.upsert({ where: { id: 8 }, update: {}, create: { roundId: round3.id, affirmativeId: student3.id, negativeId: student6.id, judgeId: judge1.id, room: "Room 302" } });
  await prisma.pairing.upsert({ where: { id: 9 }, update: {}, create: { roundId: round3.id, affirmativeId: student5.id, negativeId: student2.id, judgeId: judge2.id, room: "Room 303" } });

  await prisma.ballot.upsert({
    where: { pairingId: p1.id },
    update: {},
    create: {
      pairingId: p1.id, judgeId: judge1.id, winner: "AFFIRMATIVE",
      affSpeakerPts: 28.5, negSpeakerPts: 27.0,
      comments: "Strong value framework from the affirmative. Negative needed better refutation of the criterion.",
    },
  });
  await prisma.ballot.upsert({
    where: { pairingId: p2.id },
    update: {},
    create: {
      pairingId: p2.id, judgeId: judge2.id, winner: "NEGATIVE",
      affSpeakerPts: 26.5, negSpeakerPts: 29.0,
      comments: "Excellent cross-examination by the negative. Affirmative dropped key arguments in the 1AR.",
    },
  });

  console.log("Seed data inserted successfully!");
  console.log("\nTest credentials (all passwords: 'password'):");
  console.log("  Manager:  manager@example.com");
  console.log("  Judge:    judge1@example.com");
  console.log("  Student:  student1@example.com");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
