import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./lib/useUser";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ManagerDashboard from "./pages/ManagerDashboard";
import TournamentDetail from "./pages/TournamentDetail";
import JudgeDashboard from "./pages/JudgeDashboard";
import BallotPage from "./pages/BallotPage";
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/judge" element={<JudgeDashboard />} />
            <Route path="/judge/ballot/:pairingId" element={<BallotPage />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Routes>
        </main>
      </div>
    </UserProvider>
  );
}
