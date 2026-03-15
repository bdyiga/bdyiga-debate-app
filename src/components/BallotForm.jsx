import { useState } from "react";

export default function BallotForm({ pairing, onSubmitted }) {
  const [winner, setWinner] = useState("");
  const [affPts, setAffPts] = useState("27");
  const [negPts, setNegPts] = useState("27");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!winner) {
      setError("Please select a winner");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ballots", {
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
            {pairing.affirmative.name} — Speaker Points
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
            {pairing.negative.name} — Speaker Points
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
        <label className="block text-sm font-medium mb-1">Comments / Feedback</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Provide feedback on argumentation, delivery, cross-examination…"
        />
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
