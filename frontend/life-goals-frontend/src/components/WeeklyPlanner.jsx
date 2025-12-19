import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function WeeklyPlanner({ token }) {
  const [goals, setGoals] = useState([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/goals/")
      .then((res) => setGoals(res.data || []))
      .catch((err) => console.error("Weekly planner goals fetch error:", err));
  }, []);

  const parseDate = (d) => (d ? new Date(d) : null);

  const daysOfWeek = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const daysGoals = useMemo(() => {
    const map = {};
    daysOfWeek.forEach((d) => {
      const key = d.toISOString().slice(0, 10);
      map[key] = [];
    });

    goals.forEach((g) => {
      const s = parseDate(g.start_date) || daysOfWeek[0];
      const e = parseDate(g.end_date) || daysOfWeek[6];

      daysOfWeek.forEach((d) => {
        if (d >= s && d <= e) {
          const key = d.toISOString().slice(0, 10);
          map[key].push(g);
        }
      });
    });

    return map;
  }, [goals, daysOfWeek]);

  const CATEGORY_COLORS = {
    Health: "#FF0000",
    Career: "#8A2BE2",
    Finance: "#00C853",
    Education: "#1E3A8A",
    "Personal Growth": "#FF9100",
    Relationships: "#FF69B4",
    Other: "#9CA3AF",
    General: "#9CA3AF",
  };

  const formatDayLabel = (d) =>
    d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

  const changeWeek = (delta) => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + delta * 7);
    setWeekStart(getMonday(newStart));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span role="img" aria-label="planner">
              🗓️
            </span>
            Weekly Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            See which goals are active each day this week.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => changeWeek(-1)}
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
          >
            ← Prev
          </button>
          <span className="font-medium">
            Week of{" "}
            {weekStart.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => changeWeek(1)}
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
        {daysOfWeek.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const list = daysGoals[key] || [];

          return (
            <div
              key={key}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-52"
            >
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  {formatDayLabel(day)}
                </span>
                {isToday(day) && (
                  <span className="text-[10px] px-2 py-[2px] rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Today
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
                {list.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No active goals.
                  </p>
                ) : (
                  list.map((g) => {
                    const color =
                      CATEGORY_COLORS[g.category] || CATEGORY_COLORS.Other;
                    const progress = g.progress || 0;
                    return (
                      <div
                        key={g.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
                            {g.title}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {progress}% complete
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sun, 1 = Mon
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isToday(d) {
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export default WeeklyPlanner;
