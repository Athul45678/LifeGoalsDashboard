import { useState, useEffect } from "react";

function FocusMode({ goal, onClose, onToggleTask }) {
  // -----------------------------
  // Timer mode: "focus" or "break"
  // -----------------------------
  const [mode, setMode] = useState("focus");

  // Adjustable durations (seconds)
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Focus stats (saved in localStorage)
  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  // Local copy of tasks for instant UI update
  const [tasks, setTasks] = useState(goal.tasks || []);

  useEffect(() => {
    setTasks(goal.tasks || []);
  }, [goal]);

  // -----------------------------
  // Load stats from localStorage
  // -----------------------------
  useEffect(() => {
    const raw = localStorage.getItem("focusStats");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      const todayStr = new Date().toDateString();

      if (data.date === todayStr) {
        setSessionsToday(data.sessionsToday || 0);
        setTotalMinutesToday(data.totalMinutesToday || 0);
        setStreakDays(data.streakDays || 1);
      } else {
        // new day → maybe streak continues
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (data.date === yesterday.toDateString()) {
          setStreakDays((data.streakDays || 0) + 1);
        } else {
          setStreakDays(1);
        }
      }
    } catch (e) {
      console.error("Error parsing focusStats", e);
    }
  }, []);

  const saveStats = (newSessions, newMinutes) => {
    const todayStr = new Date().toDateString();
    const payload = {
      date: todayStr,
      sessionsToday: newSessions,
      totalMinutesToday: newMinutes,
      streakDays,
    };
    localStorage.setItem("focusStats", JSON.stringify(payload));
  };

  // -----------------------------
  // Timer effect
  // -----------------------------
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode, focusMinutes, breakMinutes]);

  const handleTimerEnd = () => {
    setIsRunning(false);

    if (mode === "focus") {
      // Focus session finished
      const sessionMinutes = focusMinutes;
      const newSessions = sessionsToday + 1;
      const newMinutes = totalMinutesToday + sessionMinutes;

      setSessionsToday(newSessions);
      setTotalMinutesToday(newMinutes);
      saveStats(newSessions, newMinutes);

      // Auto-switch to break
      setMode("break");
      setTimeLeft(breakMinutes * 60);
      setIsRunning(true); // auto-start break
    } else {
      // Break finished → back to focus
      setMode("focus");
      setTimeLeft(focusMinutes * 60);
      setIsRunning(true); // auto-start next focus
    }
  };

  // -----------------------------
  // Helper: format time
  // -----------------------------
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // -----------------------------
  // Handlers for adjustable timers
  // -----------------------------
  const handleFocusMinutesChange = (e) => {
    const value = Math.max(1, Number(e.target.value) || 1);
    setFocusMinutes(value);
    if (mode === "focus" && !isRunning) {
      setTimeLeft(value * 60);
    }
  };

  const handleBreakMinutesChange = (e) => {
    const value = Math.max(1, Number(e.target.value) || 1);
    setBreakMinutes(value);
    if (mode === "break" && !isRunning) {
      setTimeLeft(value * 60);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    // If timer was at 0, reset based on mode
    if (timeLeft <= 0) {
      setTimeLeft(
        (mode === "focus" ? focusMinutes : breakMinutes) * 60
      );
    }
  };
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(
      (mode === "focus" ? focusMinutes : breakMinutes) * 60
    );
  };

  // -----------------------------
  // Progress ring (SVG circle)
  // -----------------------------
  const totalSeconds =
    mode === "focus" ? focusMinutes * 60 : breakMinutes * 60;
  const percent =
    totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (percent / 100) * circumference;

  // -----------------------------
  // Tasks in Focus Mode
  // -----------------------------
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleToggleTaskLocal = (task) => {
    // Update backend via parent
    if (onToggleTask) {
      onToggleTask(task);
    }
    // Update local UI immediately
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center p-4 sm:p-8">
      {/* Top bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-sm"
        >
          ← Exit Focus Mode
        </button>

        <div className="text-right text-xs sm:text-sm text-slate-300">
          <div>🔥 Streak: {streakDays} day{streakDays !== 1 ? "s" : ""}</div>
          <div>🎯 Sessions today: {sessionsToday}</div>
          <div>⏱ Focused: {totalMinutesToday} min</div>
        </div>
      </div>

      {/* Goal Title */}
      <div className="w-full max-w-3xl text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          {goal.title}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          {goal.description}
        </p>
      </div>

      {/* Main content: Timer + Tasks */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT: Timer */}
        <div className="flex flex-col items-center">
          {/* Mode + settings */}
          <div className="mb-4 flex flex-col items-center gap-3">
            <div className="text-sm uppercase tracking-wide text-slate-400">
              {mode === "focus" ? "Focus Session" : "Break Time"}
            </div>

            <div className="flex gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span>Focus:</span>
                <input
                  type="number"
                  min="1"
                  value={focusMinutes}
                  onChange={handleFocusMinutesChange}
                  className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center"
                />
                <span>min</span>
              </div>

              <div className="flex items-center gap-2">
                <span>Break:</span>
                <input
                  type="number"
                  min="1"
                  value={breakMinutes}
                  onChange={handleBreakMinutesChange}
                  className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center"
                />
                <span>min</span>
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke="#1f2937"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke={mode === "focus" ? "#22c55e" : "#3b82f6"}
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-mono">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {Math.round(percent)}% done
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-sm"
              >
                Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 text-sm"
              >
                Pause
              </button>
            )}

            <button
              onClick={resetTimer}
              className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600 text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT: Tasks */}
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Tasks</h3>

          {tasks.length === 0 && (
            <p className="text-slate-400 text-sm">No tasks for this goal.</p>
          )}

          {/* Incomplete tasks */}
          {incompleteTasks.length > 0 && (
            <ul className="space-y-2 mb-4">
              {incompleteTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 bg-slate-800 rounded px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTaskLocal(task)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm">{task.title}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div className="mt-2 pt-3 border-t border-slate-700">
              <p className="text-xs font-semibold text-slate-400 mb-2">
                Completed
              </p>
              <ul className="space-y-2">
                {completedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 bg-slate-800/70 rounded px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTaskLocal(task)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm line-through text-slate-500">
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FocusMode;
