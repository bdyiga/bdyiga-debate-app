import OpenAI from "openai";

const MODEL = "gpt-4o-mini";

let _openai;
function getClient() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
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

  const completion = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content: [
          "You are an experienced Lincoln-Douglas debate judge writing constructive feedback on a ballot.",
          "Write in second person, addressing both debaters directly.",
          "Be specific, actionable, and encouraging. Cover argumentation, delivery, and strategy.",
          "Keep it to roughly 150 words. Do not use markdown formatting.",
        ].join(" "),
      },
      {
        role: "user",
        content: [
          `Resolution: "${resolution}"`,
          `Affirmative: ${affName} (${affPts} speaker points)`,
          `Negative: ${negName} (${negPts} speaker points)`,
          `Winner: ${winnerName} (${winner.toLowerCase()})`,
          "",
          `Write ballot feedback. Explain why ${winnerName} won, what ${loserName} could improve,`,
          `and give both debaters specific advice. A score of ${winnerPts} for the winner`,
          `and ${loserPts} for the loser should be reflected in the tone.`,
        ].join("\n"),
      },
    ],
  });

  return completion.choices[0].message.content.trim();
}

export async function generateDebatePrep({ resolution, side }) {
  const completion = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 1200,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are an expert Lincoln-Douglas debate coach helping a student prepare a case.",
          "Given a resolution and side (affirmative or negative), produce a structured prep brief.",
          "Respond with valid JSON matching this schema exactly:",
          '{',
          '  "definitions": ["key term 1: definition", ...],',
          '  "value": "the core value (e.g. Justice, Morality, Liberty)",',
          '  "criterion": "the standard to measure the value (e.g. Utilitarianism, Categorical Imperative)",',
          '  "contentions": [',
          '    { "tagline": "short label", "warrant": "2-3 sentence explanation", "evidence": "type of evidence to look for" }',
          '  ],',
          '  "counterarguments": [',
          '    { "opponentArg": "what the other side will likely argue", "response": "how to refute it" }',
          '  ]',
          '}',
          "Include 2-3 contentions and 2-3 counterarguments. Be specific to the resolution.",
        ].join("\n"),
      },
      {
        role: "user",
        content: `Resolution: "${resolution}"\nSide: ${side}\n\nGenerate a prep brief for the ${side} side.`,
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content);
}
