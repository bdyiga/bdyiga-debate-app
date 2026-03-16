import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../lib/useUser";

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight">
          LD Debate
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {!user ? (
            <>
              <Link to="/auth/login" className="hover:text-indigo-200 transition">
                Log In
              </Link>
              <Link
                to="/auth/signup"
                className="bg-white text-indigo-700 px-3 py-1.5 rounded-md font-medium hover:bg-indigo-50 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user.role === "MANAGER" && (
                <Link to="/manager" className="hover:text-indigo-200 transition">
                  Dashboard
                </Link>
              )}
              {user.role === "JUDGE" && (
                <Link to="/judge" className="hover:text-indigo-200 transition">
                  My Pairings
                </Link>
              )}
              {user.role === "STUDENT" && (
                <>
                  <Link to="/student" className="hover:text-indigo-200 transition">
                    My Rounds
                  </Link>
                  <Link to="/student/prep" className="hover:text-indigo-200 transition">
                    Prep Coach
                  </Link>
                </>
              )}
              <span className="text-indigo-200 hidden sm:inline">
                {user.name} ({user.role.toLowerCase()})
              </span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
