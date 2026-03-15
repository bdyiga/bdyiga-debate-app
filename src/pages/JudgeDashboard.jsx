import { useState, useEffect } from "react";
import { useRequireAuth } from "../lib/useUser";
import PairingCard from "../components/PairingCard";

export default function JudgeDashboard() {
  const { user, loading } = useRequireAuth(["JUDGE"]);
  const [pairings, setPairings] = useState([]);

  const fetchPairings = async () => {
    const res = await fetch(`/api/pairings?judgeId=${user.id}`);
    if (res.ok) setPairings(await res.json());
  };

  useEffect(() => {
    if (!user) return;
    fetchPairings();
    const interval = setInterval(fetchPairings, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading || !user) return <div className="p-8 text-center">Loading…</div>;

  const pending = pairings.filter((p) => !p.ballot);
  const completed = pairings.filter((p) => p.ballot);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Judge Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user.name}. Submit ballots for your assigned pairings below.</p>
      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block"></span>
            Pending Ballots ({pending.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((p) => (<PairingCard key={p.id} pairing={p} showBallotLink userRole="JUDGE" />))}
          </div>
        </section>
      )}
      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-400 rounded-full inline-block"></span>
            Completed ({completed.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completed.map((p) => (<PairingCard key={p.id} pairing={p} userRole="JUDGE" />))}
          </div>
        </section>
      )}
      {pairings.length === 0 && (
        <p className="text-gray-500 text-center py-8">No pairings assigned to you yet.</p>
      )}
    </div>
  );
}
