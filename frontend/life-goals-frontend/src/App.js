
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import Goals from "./Goals";
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";

// Pages
import TimelineView from "./components/TimelineView";
import HeatmapView from "./components/HeatmapView";
import WeeklyPlanner from "./components/WeeklyPlanner";
import NotificationsCenter from "./components/NotificationsCenter";

// Habit Tracker
import HabitTracker from "./components/HabitTracker";

// Full Goal Page
import GoalDetailsPage from "./GoalDetailsPage";

import axios from "axios";

// WRAPPER COMPONENT to allow useNavigate in main App
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [showSignup, setShowSignup] = useState(false);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios
        .get("http://127.0.0.1:8000/api/profile/")
        .then((res) => setProfile(res.data))
        .catch((err) => console.log("Profile load error:", err));
    }
  }, [token]);

  // Theme persistence
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const handleLogin = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
    setShowSignup(false);
    navigate("/"); // GO TO GOALS
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setProfile(null);
    navigate("/");
  };

  const toggleDarkMode = () => setDark(!dark);

  const navBtn = (route) =>
    `px-3 py-1 rounded transition ${
      window.location.pathname === route
        ? "bg-blue-600 text-white shadow"
        : "bg-gray-200 dark:bg-slate-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600"
    }`;

  const getAvatarUrl = () => {
    if (!profile?.avatar) {
      return "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";
    }

    return profile.avatar.startsWith("http")
      ? profile.avatar
      : `http://127.0.0.1:8000${profile.avatar}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
      <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-300 mb-4 pt-4">
        Life Goals Dashboard
      </h1>

      {/* DARK MODE TOGGLE */}
      {token && (
        <div className="flex justify-center mb-4">
          <button
            onClick={toggleDarkMode}
            className="relative w-16 h-8 bg-gray-300 dark:bg-slate-700 rounded-full p-1"
          >
            <div
              className="w-6 h-6 bg-white dark:bg-yellow-400 rounded-full shadow transition-all"
              style={{
                transform: dark ? "translateX(32px)" : "translateX(0px)",
              }}
            />
          </button>
        </div>
      )}

      {/* LOGIN / SIGNUP */}
      {!token ? (
        <>
          {!showSignup ? (
            <Login onLogin={handleLogin} openSignup={() => setShowSignup(true)} />
          ) : (
            <Signup onSignupSuccess={() => setShowSignup(false)} />
          )}
        </>
      ) : (
        <>
          {/* TOP NAVIGATION */}
          <div className="max-w-6xl mx-auto flex justify-between mb-5 px-3 items-center">
            <div className="flex flex-wrap gap-2">
              <button className={navBtn("/")} onClick={() => navigate("/")}>
                Goals
              </button>

              <button
                className={navBtn("/timeline")}
                onClick={() => navigate("/timeline")}
              >
                Timeline
              </button>

              <button
                className={navBtn("/heatmap")}
                onClick={() => navigate("/heatmap")}
              >
                Heatmap
              </button>

              <button
                className={navBtn("/weekly")}
                onClick={() => navigate("/weekly")}
              >
                Weekly Planner
              </button>

              <button
                className={navBtn("/notifications")}
                onClick={() => navigate("/notifications")}
              >
                Notifications
              </button>

              <button
                className={navBtn("/habits")}
                onClick={() => navigate("/habits")}
              >
                Habits
              </button>
            </div>

            {/* PROFILE + LOGOUT */}
            <div className="flex items-center gap-3">
              <img
                onClick={() => navigate("/profile")}
                src={getAvatarUrl()}
                className="w-9 h-9 rounded-full border border-slate-400 object-cover cursor-pointer hover:opacity-80"
                alt="avatar"
              />

              <span
                onClick={() => navigate("/profile")}
                className="font-medium text-sm dark:text-white cursor-pointer hover:text-blue-400"
              >
                {profile?.username || "User"}
              </span>

              <button
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          {/* ROUTES */}
          <Routes>
            <Route path="/" element={<Goals token={token} />} />
            <Route path="/timeline" element={<TimelineView token={token} />} />
            <Route path="/heatmap" element={<HeatmapView token={token} />} />
            <Route path="/weekly" element={<WeeklyPlanner token={token} />} />
            <Route
              path="/notifications"
              element={<NotificationsCenter token={token} />}
            />
            <Route path="/profile" element={<Profile token={token} />} />
            <Route path="/habits" element={<HabitTracker token={token} />} />

            {/* FULL GOAL PAGE */}
            <Route path="/goal/:id" element={<GoalDetailsPage token={token} />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default AppWrapper;
