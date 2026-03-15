import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useRequireAuth } from "../lib/useUser";
import { apiFetch } from "../lib/api";
import BallotForm from "../components/BallotForm";

export default function BallotPage() {
  const { user, loading } = useRequireAuth(["JUDGE"]);
  const { pairingId } = useParams();
  const [pairing, setPairing] = useState(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user || !pairingId) return;
    apiFetch(`/api/pairings?judgeId=${user.id}`)
      .then((r) => r.json())
      .then((pairings) => {
        const match = pairings.find((p) => p.id === parseInt(pairingId));
        if (!match) setError("Pairing not found or you are not assigned to it.");
        else if (match.ballot) setError("Ballot already submitted for this pairing.");
        else setPairing(match);
      });
  }, [user, pairingId]);

  if (loading || !user) return <div className="p-8 text-center">Loading…</div>;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Ballot Submitted!</h1>
        <p className="text-gray-600 mb-6">Your ballot has been recorded successfully.</p>
        <Link to="/judge" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Back to Dashboard</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        <Link to="/judge" className="text-indigo-600 hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  if (!pairing) return <div className="p-8 text-center">Loading pairing…</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link to="/judge" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">← Back to Dashboard</Link>
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {pairing.round?.tournament?.name} — Round {pairing.round?.roundNumber}
        </div>
        <div className="text-sm text-gray-500 italic mb-2">{pairing.round?.tournament?.resolution}</div>
        <div className="text-sm text-gray-500">{pairing.room}</div>
      </div>
      <h1 className="text-xl font-bold mb-6">Submit Ballot</h1>
      <BallotForm pairing={pairing} onSubmitted={() => setSubmitted(true)} />
    </div>
  );
}
