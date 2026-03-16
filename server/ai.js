import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

let _genAI;
function getGenAI() {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

async function generateWithFallback(prompt) {
  let lastError;
  for (const modelName of MODELS) {
    try {
      const model = getGenAI().getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      lastError = err;
      if (err.status === 429) {
        console.warn(`Model ${modelName} quota exceeded, trying next model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function generateBallotFeedback({
  resolution,
  affName,
  negName,
  winner,
  affPts,
  negPts,
}) {
  const winnerName = winner === "AFFIRMATIVE" ? affName : negName;
  const loserName = winner === "AFFIRMATIVE" ? negName : affName;
  const winnerPts = winner === "AFFIRMATIVE" ? affPts : negPts;
  const loserPts = winner === "AFFIRMATIVE" ? negPts : affPts;

  const prompt = [
    "You are an experienced Lincoln-Douglas debate judge writing constructive feedback on a ballot.",
    "Write in second person, addressing both debaters directly.",
    "Be specific, actionable, and encouraging. Cover argumentation, delivery, and strategy.",
    "Keep it to roughly 150 words. Do not use markdown formatting.",
    "",
    `Resolution: "${resolution}"`,
    `Affirmative: ${affName} (${affPts} speaker points)`,
    `Negative: ${negName} (${negPts} speaker points)`,
    `Winner: ${winnerName} (${winner.toLowerCase()})`,
    "",
    `Write ballot feedback. Explain why ${winnerName} won, what ${loserName} could improve,`,
    `and give both debaters specific advice. A score of ${winnerPts} for the winner`,
    `and ${loserPts} for the loser should be reflected in the tone.`,
  ].join("\n");

  return generateWithFallback(prompt);
}

export async function generateDebatePrep({ resolution, side }) {
  const prompt = [
    "You are an expert Lincoln-Douglas debate coach helping a student prepare a case.",
    "Given a resolution and side (affirmative or negative), produce a structured prep brief.",
    "Respond with valid JSON only - no markdown fences, no extra text. Match this schema exactly:",
    "{",
    '  "definitions": ["key term 1: definition", ...],',
    '  "value": "the core value (e.g. Justice, Morality, Liberty)",',
    '  "criterion": "the standard to measure the value (e.g. Utilitarianism, Categorical Imperative)",',
    '  "contentions": [',
    '    { "tagline": "short label", "warrant": "2-3 sentence explanation", "evidence": "type of evidence to look for" }',
    "  ],",
    '  "counterarguments": [',
    '    { "opponentArg": "what the other side will likely argue", "response": "how to refute it" }',
    "  ]",
    "}",
    "Include 2-3 contentions and 2-3 counterarguments. Be specific to the resolution.",
    "",
    `Resolution: "${resolution}"`,
    `Side: ${side}`,
    "",
    `Generate a prep brief for the ${side} side.`,
  ].join("\n");

  const text = await generateWithFallback(prompt);
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}
