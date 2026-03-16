import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRequireAuth } from "../lib/useUser";
import { apiFetch } from "../lib/api";

export default function DebatePrepPage() {
  const { user, loading } = useRequireAuth(["STUDENT"]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [side, setSide] = useState("affirmative");
  const [brief, setBrief] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        setTournaments(data);
        if (data.length > 0) setSelectedTournament(data[0]);
      });
  }, [user]);

  const handleGenerate = async () => {
    if (!selectedTournament) return;
    setGenerating(true);
    setError("");
    setBrief(null);
    try {
      const res = await apiFetch("/api/ai/debate-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution: selectedTournament.resolution,
          side,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBrief(data.brief);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!brief) return;
    const text = formatBriefAsText(brief);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading || !user) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/student" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
        ← Back to My Rounds
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Debate Prep Coach</h1>
        <p className="text-gray-600">
          Select a tournament and side to generate an AI-powered prep brief with arguments, evidence directions, and counterargument strategies.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tournament</label>
            <select
              value={selectedTournament?.id || ""}
              onChange={(e) => {
                const t = tournaments.find((t) => t.id === parseInt(e.target.value));
                setSelectedTournament(t);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {tournaments.length === 0 && <option value="">No tournaments available</option>}
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTournament && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
              <div className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1">Resolution</div>
              <p className="text-sm text-indigo-900 italic">{selectedTournament.resolution}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Side</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSide("affirmative")}
                className={`p-3 rounded-lg border-2 text-center font-medium transition ${
                  side === "affirmative"
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                Affirmative
              </button>
              <button
                type="button"
                onClick={() => setSide("negative")}
                className={`p-3 rounded-lg border-2 text-center font-medium transition ${
                  side === "negative"
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                Negative
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !selectedTournament}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Brief…
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                Generate Prep Brief
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {brief && <BriefDisplay brief={brief} side={side} onCopy={handleCopy} copied={copied} onRegenerate={handleGenerate} generating={generating} />}
    </div>
  );
}

function BriefDisplay({ brief, side, onCopy, copied, onRegenerate, generating }) {
  const sideColor = side === "affirmative" ? "green" : "blue";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          <span className={`text-${sideColor}-700`}>{side.charAt(0).toUpperCase() + side.slice(1)}</span> Prep Brief
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onCopy}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={onRegenerate}
            disabled={generating}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 transition"
          >
            Regenerate
          </button>
        </div>
      </div>

      {brief.value && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Value & Criterion</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Value</div>
              <div className="text-lg font-semibold text-gray-900">{brief.value}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Criterion</div>
              <div className="text-lg font-semibold text-gray-900">{brief.criterion}</div>
            </div>
          </div>
        </div>
      )}

      {brief.definitions?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Definitions</h3>
          <ul className="space-y-1.5">
            {brief.definitions.map((def, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-indigo-400 font-bold">•</span>
                {def}
              </li>
            ))}
          </ul>
        </div>
      )}

      {brief.contentions?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contentions</h3>
          <div className="space-y-4">
            {brief.contentions.map((c, i) => (
              <div key={i} className={`border-l-4 border-${sideColor}-400 pl-4`}>
                <div className="font-semibold text-gray-900 mb-1">
                  Contention {i + 1}: {c.tagline}
                </div>
                <p className="text-sm text-gray-700 mb-2">{c.warrant}</p>
                <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                  <span className="font-medium">Evidence to find:</span> {c.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {brief.counterarguments?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Anticipated Counterarguments</h3>
          <div className="space-y-4">
            {brief.counterarguments.map((ca, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-red-700 mb-1">
                  Opponent may argue: {ca.opponentArg}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium text-green-700">Your response:</span> {ca.response}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatBriefAsText(brief) {
  const lines = [];
  if (brief.value) {
    lines.push(`VALUE: ${brief.value}`);
    lines.push(`CRITERION: ${brief.criterion}`);
    lines.push("");
  }
  if (brief.definitions?.length) {
    lines.push("DEFINITIONS:");
    brief.definitions.forEach((d) => lines.push(`  - ${d}`));
    lines.push("");
  }
  if (brief.contentions?.length) {
    lines.push("CONTENTIONS:");
    brief.contentions.forEach((c, i) => {
      lines.push(`  ${i + 1}. ${c.tagline}`);
      lines.push(`     ${c.warrant}`);
      lines.push(`     Evidence: ${c.evidence}`);
    });
    lines.push("");
  }
  if (brief.counterarguments?.length) {
    lines.push("COUNTERARGUMENTS:");
    brief.counterarguments.forEach((ca) => {
      lines.push(`  Opponent: ${ca.opponentArg}`);
      lines.push(`  Response: ${ca.response}`);
      lines.push("");
    });
  }
  return lines.join("\n");
}
