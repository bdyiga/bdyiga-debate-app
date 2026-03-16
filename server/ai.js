import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-2.0-flash";

let _model;
function getModel() {
  if (!_model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    _model = genAI.getGenerativeModel({ model: MODEL });
  }
  return _model;
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

  const result = await getModel().generateContent(prompt);
  return result.response.text().trim();
}

export async function generateDebatePrep({ resolution, side }) {
  const prompt = [
    "You are an expert Lincoln-Douglas debate coach helping a student prepare a case.",
    "Given a resolution and side (affirmative or negative), produce a structured prep brief.",
    "Respond with valid JSON only — no markdown fences, no extra text. Match this schema exactly:",
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

  const result = await getModel().generateContent(prompt);
  const text = result.response.text().trim();

  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}
