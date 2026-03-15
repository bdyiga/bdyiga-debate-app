import { Link } from "react-router-dom";

export default function PairingCard({ pairing, showBallotLink, userRole }) {
  const hasBallot = !!pairing.ballot;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {pairing.room || "No room"}
        </span>
        {hasBallot ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Ballot submitted
          </span>
        ) : (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
            Pending
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div>
          <div className="text-xs text-gray-500">AFF</div>
          <div className="font-medium text-green-700">{pairing.affirmative?.name}</div>
        </div>
        <div className="flex items-center justify-center text-gray-400 font-bold">vs</div>
        <div>
          <div className="text-xs text-gray-500">NEG</div>
          <div className="font-medium text-blue-700">{pairing.negative?.name}</div>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        <span className="font-medium">Judge:</span> {pairing.judge?.name}
      </div>

      {hasBallot && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-sm">
          <div className="flex justify-between">
            <span>
              Winner:{" "}
              <span className="font-semibold">
                {pairing.ballot.winner === "AFFIRMATIVE"
                  ? pairing.affirmative?.name
                  : pairing.negative?.name}
              </span>
            </span>
          </div>
          <div className="flex gap-4 text-gray-500 mt-1">
            <span>AFF: {pairing.ballot.affSpeakerPts} pts</span>
            <span>NEG: {pairing.ballot.negSpeakerPts} pts</span>
          </div>
          {pairing.ballot.comments && (
            <p className="mt-2 text-gray-600 italic text-sm">&ldquo;{pairing.ballot.comments}&rdquo;</p>
          )}
        </div>
      )}

      {showBallotLink && !hasBallot && userRole === "JUDGE" && (
        <Link
          to={`/judge/ballot/${pairing.id}`}
          className="mt-3 block text-center bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Submit Ballot
        </Link>
      )}
    </div>
  );
}
