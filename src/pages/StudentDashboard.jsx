import { useState, useEffect } from "react";
import { useRequireAuth } from "../lib/useUser";
import { apiFetch } from "../lib/api";

export default function StudentDashboard() {
  const { user, loading } = useRequireAuth(["STUDENT"]);
  const [pairings, setPairings] = useState([]);

  useEffect(() => {
    if (!user) return;
    apiFetch(`/api/pairings?studentId=${user.id}`)
      .then((r) => r.json())
      .then(setPairings);
  }, [user]);

  if (loading || !user) return <div className="p-8 text-center">Loading…</div>;

  const wins = pairings.filter((p) => {
    if (!p.ballot) return false;
    return (
      (p.ballot.winner === "AFFIRMATIVE" && p.affirmative.id === user.id) ||
      (p.ballot.winner === "NEGATIVE" && p.negative.id === user.id)
    );
  }).length;

  const totalJudged = pairings.filter((p) => p.ballot).length;
  const speakerPts = pairings
    .filter((p) => p.ballot)
    .map((p) => (p.affirmative.id === user.id ? p.ballot.affSpeakerPts : p.ballot.negSpeakerPts));
  const avgPts = speakerPts.length
    ? (speakerPts.reduce((a, b) => a + b, 0) / speakerPts.length).toFixed(1)
    : "—";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">My Rounds</h1>
      <p className="text-gray-600 mb-8">Welcome, {user.name}. Here are your debate rounds and feedback.</p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-indigo-600">{pairings.length}</div>
          <div className="text-sm text-gray-500">Total Rounds</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">{wins}/{totalJudged}</div>
          <div className="text-sm text-gray-500">Wins</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-indigo-600">{avgPts}</div>
          <div className="text-sm text-gray-500">Avg Speaker Pts</div>
        </div>
      </div>
      <div className="space-y-4">
        {pairings.map((p) => {
          const isAff = p.affirmative.id === user.id;
          const side = isAff ? "Affirmative" : "Negative";
          const opponent = isAff ? p.negative : p.affirmative;
          const ballot = p.ballot;
          const myPts = ballot ? (isAff ? ballot.affSpeakerPts : ballot.negSpeakerPts) : null;
          const won = ballot
            ? (ballot.winner === "AFFIRMATIVE" && isAff) || (ballot.winner === "NEGATIVE" && !isAff)
            : null;

          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {p.round?.tournament?.name} — Round {p.round?.roundNumber}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{p.room}</span>
                </div>
                {ballot && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${won ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {won ? "Win" : "Loss"}
                  </span>
                )}
              </div>
              <div className="mb-2">
                <span className={`text-sm font-medium ${isAff ? "text-green-700" : "text-blue-700"}`}>{side}</span>
                <span className="text-gray-500 text-sm"> vs {opponent.name}</span>
              </div>
              <div className="text-sm text-gray-500 mb-1">Judge: {p.judge?.name}</div>
              {ballot ? (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-4 text-sm mb-2">
                    <span className="font-medium">Speaker Points: {myPts}</span>
                  </div>
                  {ballot.comments && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <div className="text-xs text-gray-500 mb-1">Judge Comments</div>
                      <p className="text-sm text-gray-700 italic">&ldquo;{ballot.comments}&rdquo;</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">{new Date(ballot.createdAt).toLocaleString()}</div>
                </div>
              ) : (
                <p className="text-sm text-yellow-600 mt-2">Ballot pending</p>
              )}
            </div>
          );
        })}
        {pairings.length === 0 && (
          <p className="text-gray-500 text-center py-8">You don&apos;t have any rounds yet.</p>
        )}
      </div>
    </div>
  );
}
