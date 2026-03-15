import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useRequireAuth } from "../lib/useUser";
import TournamentForm from "../components/TournamentForm";

export default function ManagerDashboard() {
  const { user, loading } = useRequireAuth(["MANAGER"]);
  const [tournaments, setTournaments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchTournaments = useCallback(async () => {
    const res = await fetch("/api/tournaments");
    if (res.ok) setTournaments(await res.json());
  }, []);

  useEffect(() => {
    if (user) fetchTournaments();
  }, [user, fetchTournaments]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchTournaments, 10000);
    return () => clearInterval(interval);
  }, [user, fetchTournaments]);

  if (loading || !user) return <div className="p-8 text-center">Loading…</div>;

  const totalBallots = tournaments.reduce((sum, t) => sum + t.rounds.reduce((s, r) => s + r.pairings.filter((p) => p.ballot).length, 0), 0);
  const totalPairings = tournaments.reduce((sum, t) => sum + t.rounds.reduce((s, r) => s + r.pairings.length, 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
          {showForm ? "Cancel" : "+ New Tournament"}
        </button>
      </div>
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Create Tournament</h2>
          <TournamentForm onCreated={() => { setShowForm(false); fetchTournaments(); }} />
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-indigo-600">{tournaments.length}</div>
          <div className="text-sm text-gray-500">Tournaments</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-indigo-600">{tournaments.reduce((s, t) => s + t.rounds.length, 0)}</div>
          <div className="text-sm text-gray-500">Rounds</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-indigo-600">{totalPairings}</div>
          <div className="text-sm text-gray-500">Pairings</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">{totalBallots}/{totalPairings}</div>
          <div className="text-sm text-gray-500">Ballots</div>
        </div>
      </div>
      <div className="space-y-4">
        {tournaments.map((t) => (
          <Link key={t.id} to={`/manager/tournaments/${t.id}`} className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{t.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{t.resolution}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{t.rounds.length} rounds</div>
                <div>{new Date(t.date).toLocaleDateString()}</div>
              </div>
            </div>
          </Link>
        ))}
        {tournaments.length === 0 && <p className="text-gray-500 text-center py-8">No tournaments yet. Create one above.</p>}
      </div>
    </div>
  );
}
