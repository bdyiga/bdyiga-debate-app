import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useRequireAuth } from "../lib/useUser";
import { api, apiFetch } from "../lib/api";
import PairingCard from "../components/PairingCard";

export default function TournamentDetail() {
  const { user, loading } = useRequireAuth(["MANAGER"]);
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [judges, setJudges] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddPairing, setShowAddPairing] = useState(false);
  const [error, setError] = useState("");
  const [pairingForm, setPairingForm] = useState({ roundId: "", affirmativeId: "", negativeId: "", judgeId: "", room: "" });

  const fetchTournament = useCallback(async () => {
    if (!id) return;
    const res = await apiFetch(`/api/tournaments/${id}`);
    if (res.ok) setTournament(await res.json());
  }, [id]);

  useEffect(() => {
    if (user && id) {
      fetchTournament();
      apiFetch("/api/users?role=judge").then((r) => r.json()).then(setJudges);
      apiFetch("/api/users?role=student").then((r) => r.json()).then(setStudents);
    }
  }, [user, id, fetchTournament]);

  useEffect(() => {
    if (!user || !id) return;
    const interval = setInterval(fetchTournament, 10000);
    return () => clearInterval(interval);
  }, [user, id, fetchTournament]);

  const addRound = async () => {
    setError("");
    const nextNum = tournament.rounds.length + 1;
    const res = await apiFetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournamentId: parseInt(id), roundNumber: nextNum }),
    });
    if (res.ok) fetchTournament();
    else { const data = await res.json(); setError(data.error); }
  };

  const addPairing = async (e) => {
    e.preventDefault();
    setError("");
    if (pairingForm.affirmativeId === pairingForm.negativeId) {
      setError("Affirmative and negative debater must be different");
      return;
    }
    const res = await apiFetch("/api/pairings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pairingForm),
    });
    if (res.ok) {
      setShowAddPairing(false);
      setPairingForm({ roundId: "", affirmativeId: "", negativeId: "", judgeId: "", room: "" });
      fetchTournament();
    } else { const data = await res.json(); setError(data.error); }
  };

  if (loading || !user) return <div className="p-8 text-center">Loading…</div>;
  if (!tournament) return <div className="p-8 text-center">Loading tournament…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/manager" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">← Back to Dashboard</Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          <p className="text-gray-600 mt-1 text-sm italic">{tournament.resolution}</p>
          <p className="text-gray-400 text-xs mt-1">{new Date(tournament.date).toLocaleDateString()}</p>
        </div>
        <a href={api(`/api/tournaments/${id}/export`)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">Export CSV</a>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <div className="flex gap-3 mb-6">
        <button onClick={addRound} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">+ Add Round</button>
        <button onClick={() => setShowAddPairing(!showAddPairing)} className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
          {showAddPairing ? "Cancel" : "+ Add Pairing"}
        </button>
      </div>
      {showAddPairing && (
        <form onSubmit={addPairing} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm space-y-4">
          <h3 className="font-semibold">New Pairing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Round</label>
              <select value={pairingForm.roundId} onChange={(e) => setPairingForm({ ...pairingForm, roundId: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Select round</option>
                {tournament.rounds.map((r) => (<option key={r.id} value={r.id}>Round {r.roundNumber}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room</label>
              <input type="text" value={pairingForm.room} onChange={(e) => setPairingForm({ ...pairingForm, room: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g. Room 101" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Affirmative Debater</label>
              <select value={pairingForm.affirmativeId} onChange={(e) => setPairingForm({ ...pairingForm, affirmativeId: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Select debater</option>
                {students.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Negative Debater</label>
              <select value={pairingForm.negativeId} onChange={(e) => setPairingForm({ ...pairingForm, negativeId: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Select debater</option>
                {students.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Judge</label>
              <select value={pairingForm.judgeId} onChange={(e) => setPairingForm({ ...pairingForm, judgeId: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Select judge</option>
                {judges.map((j) => (<option key={j.id} value={j.id}>{j.name}</option>))}
              </select>
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Create Pairing</button>
        </form>
      )}
      {tournament.rounds.map((round) => (
        <div key={round.id} className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            Round {round.roundNumber}
            <span className="text-sm font-normal text-gray-500">({round.pairings.filter((p) => p.ballot).length}/{round.pairings.length} ballots)</span>
          </h2>
          {round.pairings.length === 0 ? (
            <p className="text-gray-400 text-sm">No pairings yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {round.pairings.map((p) => (<PairingCard key={p.id} pairing={p} userRole="MANAGER" />))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
