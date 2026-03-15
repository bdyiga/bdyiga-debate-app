import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import prisma from "./prisma.js";
import { getSession, requireAuth } from "./session.js";

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));
app.use(express.json());

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  const validRoles = ["MANAGER", "JUDGE", "STUDENT"];
  const userRole = validRoles.includes(role) ? role : "STUDENT";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: userRole },
  });

  const session = await getSession(req, res);
  session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  await session.save();

  res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const session = await getSession(req, res);
  session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  await session.save();

  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

app.post("/api/auth/logout", async (req, res) => {
  const session = await getSession(req, res);
  session.destroy();
  res.json({ ok: true });
});

app.get("/api/auth/me", async (req, res) => {
  const session = await getSession(req, res);
  if (!session.user) return res.status(401).json({ user: null });
  res.json({ user: session.user });
});

// ─── Users ───────────────────────────────────────────────────────────────────

app.get("/api/users", requireAuth(), async (req, res) => {
  const { role } = req.query;
  const where = role ? { role: role.toUpperCase() } : {};
  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
  res.json(users);
});

// ─── Tournaments ─────────────────────────────────────────────────────────────

app.get("/api/tournaments", requireAuth(), async (req, res) => {
  const tournaments = await prisma.tournament.findMany({
    include: {
      rounds: { include: { pairings: { include: { ballot: true } } } },
    },
    orderBy: { date: "desc" },
  });
  res.json(tournaments);
});

app.post("/api/tournaments", requireAuth("MANAGER"), async (req, res) => {
  const { name, description, resolution, date } = req.body;
  if (!name || !resolution) {
    return res.status(400).json({ error: "Name and resolution are required" });
  }
  const tournament = await prisma.tournament.create({
    data: {
      name,
      description: description || "",
      resolution,
      date: date ? new Date(date) : new Date(),
    },
  });
  res.status(201).json(tournament);
});

app.get("/api/tournaments/:id", requireAuth(), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid tournament ID" });

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: {
          pairings: {
            include: {
              affirmative: { select: { id: true, name: true, email: true } },
              negative: { select: { id: true, name: true, email: true } },
              judge: { select: { id: true, name: true, email: true } },
              ballot: true,
            },
          },
        },
      },
    },
  });
  if (!tournament) return res.status(404).json({ error: "Tournament not found" });
  res.json(tournament);
});

app.delete("/api/tournaments/:id", requireAuth("MANAGER"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid tournament ID" });
  await prisma.tournament.delete({ where: { id } });
  res.json({ ok: true });
});

// ─── Tournament CSV Export ───────────────────────────────────────────────────

app.get("/api/tournaments/:id/export", requireAuth("MANAGER"), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid tournament ID" });

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      rounds: {
        include: {
          pairings: {
            include: {
              affirmative: { select: { name: true, email: true } },
              negative: { select: { name: true, email: true } },
              judge: { select: { name: true, email: true } },
              ballot: true,
            },
          },
        },
      },
    },
  });
  if (!tournament) return res.status(404).json({ error: "Tournament not found" });

  const headers = [
    "Round", "Room", "Affirmative", "Negative", "Judge",
    "Winner", "Aff Speaker Pts", "Neg Speaker Pts", "Comments", "Submitted At",
  ];

  const rows = [];
  for (const round of tournament.rounds) {
    for (const p of round.pairings) {
      const b = p.ballot;
      rows.push([
        round.roundNumber,
        `"${p.room}"`,
        `"${p.affirmative.name}"`,
        `"${p.negative.name}"`,
        `"${p.judge.name}"`,
        b ? b.winner : "",
        b ? b.affSpeakerPts : "",
        b ? b.negSpeakerPts : "",
        b ? `"${(b.comments || "").replace(/"/g, '""')}"` : "",
        b ? b.createdAt : "",
      ]);
    }
  }

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${tournament.name}-ballots.csv"`);
  res.send(csv);
});

// ─── Rounds ──────────────────────────────────────────────────────────────────

app.get("/api/rounds", requireAuth(), async (req, res) => {
  const { tournamentId } = req.query;
  const where = tournamentId ? { tournamentId: parseInt(tournamentId) } : {};
  const rounds = await prisma.round.findMany({
    where,
    include: {
      tournament: { select: { name: true, resolution: true } },
      pairings: {
        include: {
          affirmative: { select: { id: true, name: true } },
          negative: { select: { id: true, name: true } },
          judge: { select: { id: true, name: true } },
          ballot: true,
        },
      },
    },
    orderBy: { roundNumber: "asc" },
  });
  res.json(rounds);
});

app.post("/api/rounds", requireAuth("MANAGER"), async (req, res) => {
  const { tournamentId, roundNumber } = req.body;
  if (!tournamentId || !roundNumber) {
    return res.status(400).json({ error: "tournamentId and roundNumber are required" });
  }
  const round = await prisma.round.create({
    data: { tournamentId: parseInt(tournamentId), roundNumber: parseInt(roundNumber) },
  });
  res.status(201).json(round);
});

// ─── Pairings ────────────────────────────────────────────────────────────────

app.get("/api/pairings", requireAuth(), async (req, res) => {
  const { roundId, judgeId, studentId } = req.query;
  const where = {};
  if (roundId) where.roundId = parseInt(roundId);
  if (judgeId) where.judgeId = parseInt(judgeId);
  if (studentId) {
    const sid = parseInt(studentId);
    where.OR = [{ affirmativeId: sid }, { negativeId: sid }];
  }

  const pairings = await prisma.pairing.findMany({
    where,
    include: {
      round: { include: { tournament: { select: { name: true, resolution: true } } } },
      affirmative: { select: { id: true, name: true } },
      negative: { select: { id: true, name: true } },
      judge: { select: { id: true, name: true } },
      ballot: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(pairings);
});

app.post("/api/pairings", requireAuth("MANAGER"), async (req, res) => {
  const { roundId, affirmativeId, negativeId, judgeId, room } = req.body;
  if (!roundId || !affirmativeId || !negativeId || !judgeId) {
    return res.status(400).json({
      error: "roundId, affirmativeId, negativeId, and judgeId are required",
    });
  }
  const pairing = await prisma.pairing.create({
    data: {
      roundId: parseInt(roundId),
      affirmativeId: parseInt(affirmativeId),
      negativeId: parseInt(negativeId),
      judgeId: parseInt(judgeId),
      room: room || "",
    },
    include: {
      affirmative: { select: { id: true, name: true } },
      negative: { select: { id: true, name: true } },
      judge: { select: { id: true, name: true } },
    },
  });
  res.status(201).json(pairing);
});

// ─── Ballots ─────────────────────────────────────────────────────────────────

app.get("/api/ballots", requireAuth(), async (req, res) => {
  const where = {};
  if (req.user.role === "JUDGE") {
    where.judgeId = req.user.id;
  } else if (req.user.role === "STUDENT") {
    where.pairing = {
      OR: [{ affirmativeId: req.user.id }, { negativeId: req.user.id }],
    };
  }

  const ballots = await prisma.ballot.findMany({
    where,
    include: {
      pairing: {
        include: {
          round: { include: { tournament: { select: { name: true } } } },
          affirmative: { select: { id: true, name: true } },
          negative: { select: { id: true, name: true } },
          judge: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(ballots);
});

app.post("/api/ballots", requireAuth("JUDGE"), async (req, res) => {
  const { pairingId, winner, affSpeakerPts, negSpeakerPts, comments } = req.body;

  if (!pairingId || !winner || affSpeakerPts == null || negSpeakerPts == null) {
    return res.status(400).json({
      error: "pairingId, winner, affSpeakerPts, and negSpeakerPts are required",
    });
  }
  if (!["AFFIRMATIVE", "NEGATIVE"].includes(winner)) {
    return res.status(400).json({ error: "Winner must be AFFIRMATIVE or NEGATIVE" });
  }

  const affPts = parseFloat(affSpeakerPts);
  const negPts = parseFloat(negSpeakerPts);
  if (isNaN(affPts) || isNaN(negPts) || affPts < 0 || negPts < 0 || affPts > 30 || negPts > 30) {
    return res.status(400).json({ error: "Speaker points must be between 0 and 30" });
  }

  const pairing = await prisma.pairing.findUnique({ where: { id: parseInt(pairingId) } });
  if (!pairing) return res.status(404).json({ error: "Pairing not found" });
  if (pairing.judgeId !== req.user.id) {
    return res.status(403).json({ error: "You are not assigned to judge this pairing" });
  }

  const existing = await prisma.ballot.findUnique({ where: { pairingId: parseInt(pairingId) } });
  if (existing) return res.status(409).json({ error: "Ballot already submitted for this pairing" });

  const ballot = await prisma.ballot.create({
    data: {
      pairingId: parseInt(pairingId),
      judgeId: req.user.id,
      winner,
      affSpeakerPts: affPts,
      negSpeakerPts: negPts,
      comments: comments || "",
    },
  });
  res.status(201).json(ballot);
});

export default app;
