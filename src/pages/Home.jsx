import { Link } from "react-router-dom";
import { useUser } from "../lib/useUser";

export default function Home() {
  const { user } = useUser();

  const dashboardLink =
    user?.role === "MANAGER"
      ? "/manager"
      : user?.role === "JUDGE"
      ? "/judge"
      : user?.role === "STUDENT"
      ? "/student"
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
        Lincoln-Douglas Debate
        <span className="block text-indigo-600 mt-2">Tournament Manager</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        Organize LD debate tournaments, manage pairings, submit ballots, and track speaker points — all in one place.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {user ? (
          <Link to={dashboardLink || "/"} className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link to="/auth/login" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition">Log In</Link>
            <Link to="/auth/signup" className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition">Sign Up</Link>
          </>
        )}
      </div>
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl mb-2">🏛️</div>
          <h3 className="font-bold text-lg mb-1">Manage Tournaments</h3>
          <p className="text-gray-600 text-sm">Create tournaments, set resolutions, organize rounds and assign pairings.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl mb-2">⚖️</div>
          <h3 className="font-bold text-lg mb-1">Judge &amp; Score</h3>
          <p className="text-gray-600 text-sm">Submit ballots with winners, speaker points, and detailed feedback.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-bold text-lg mb-1">Track Progress</h3>
          <p className="text-gray-600 text-sm">Students view their round history, judge comments, and speaker points.</p>
        </div>
      </div>
    </div>
  );
}
