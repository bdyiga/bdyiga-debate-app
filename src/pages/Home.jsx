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
      <div className="mt-12 mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 text-sm font-medium text-purple-700 mb-4">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          Powered by AI
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">AI-Enhanced Debate Experience</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Go beyond tournament management with built-in AI tools that help students prepare and judges provide richer feedback.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
          <div className="bg-purple-50 border border-purple-100 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <h3 className="font-bold text-purple-900">Debate Prep Coach</h3>
            </div>
            <p className="text-sm text-purple-700">Students select a resolution and side to instantly generate structured prep briefs with value/criterion frameworks, contentions, and counterargument strategies.</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <h3 className="font-bold text-purple-900">AI Ballot Feedback</h3>
            </div>
            <p className="text-sm text-purple-700">Judges can generate AI-drafted feedback based on the round context, then edit and refine before submitting — saving time while delivering more detailed comments.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
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
