import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function BallotForm({ pairing, onSubmitted }) {
  const [winner, setWinner] = useState("");
  const [affPts, setAffPts] = useState("27");
  const [negPts, setNegPts] = useState("27");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const resolution = pairing.round?.tournament?.resolution;

  const handleGenerateFeedback = async () => {
    if (!winner) {
      setError("Please select a winner before generating feedback");
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/ai/ballot-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution,
          affName: pairing.affirmative.name,
          negName: pairing.negative.name,
          winner,
          affPts: parseFloat(affPts),
          negPts: parseFloat(negPts),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments(data.feedback);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!winner) {
      setError("Please select a winner");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/ballots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairingId: pairing.id,
          winner,
          affSpeakerPts: parseFloat(affPts),
          negSpeakerPts: parseFloat(negPts),
          comments,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (onSubmitted) onSubmitted(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <fieldset>
        <legend className="text-lg font-semibold mb-3">Winner</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setWinner("AFFIRMATIVE")}
            className={`p-4 rounded-lg border-2 text-center font-medium transition ${
              winner === "AFFIRMATIVE"
                ? "border-green-500 bg-green-50 text-green-800"
                : "border-gray-200 hover:border-green-300"
            }`}
          >
            <div className="text-xs uppercase tracking-wider mb-1 text-gray-500">Affirmative</div>
            <div className="text-lg">{pairing.affirmative.name}</div>
          </button>
          <button
            type="button"
            onClick={() => setWinner("NEGATIVE")}
            className={`p-4 rounded-lg border-2 text-center font-medium transition ${
              winner === "NEGATIVE"
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="text-xs uppercase tracking-wider mb-1 text-gray-500">Negative</div>
            <div className="text-lg">{pairing.negative.name}</div>
          </button>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {pairing.affirmative.name} - Speaker Points
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="30"
            value={affPts}
            onChange={(e) => setAffPts(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {pairing.negative.name} - Speaker Points
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="30"
            value={negPts}
            onChange={(e) => setNegPts(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium">Comments / Feedback</label>
          {resolution && (
            <button
              type="button"
              onClick={handleGenerateFeedback}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 transition"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  Generate AI Feedback
                </>
              )}
            </button>
          )}
        </div>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Provide feedback on argumentation, delivery, cross-examination…"
        />
        {resolution && (
          <p className="text-xs text-gray-400 mt-1">AI-generated feedback is a draft - edit freely before submitting.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-indigo-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {submitting ? "Submitting…" : "Submit Ballot"}
      </button>
    </form>
  );
}
