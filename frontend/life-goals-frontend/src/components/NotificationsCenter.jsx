import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function NotificationsCenter({ token }) {
  const [goals, setGoals] = useState([]);
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/goals/")
      .then((res) => setGoals(res.data || []))
      .catch((err) =>
        console.error("Notifications goals fetch error:", err)
      );
  }, []);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const classify = useMemo(() => {
    const res = {
      overdue: [],
      today: [],
      soon: [],
      completed: [],
    };

    goals.forEach((g) => {
      const progress = g.progress || 0;
      const end = g.end_date ? new Date(g.end_date) : null;

      if (!end) {
        // no end date, ignore for now
        if (progress === 100) res.completed.push(g);
        return;
      }

      const endDay = new Date(end);
      endDay.setHours(0, 0, 0, 0);

      const diff =
        (endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      if (progress === 100) {
        res.completed.push(g);
      } else if (diff < 0) {
        res.overdue.push(g);
      } else if (diff === 0) {
        res.today.push(g);
      } else if (diff > 0 && diff <= 3) {
        res.soon.push(g);
      }
    });

    return res;
  }, [goals, today]);

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

  const sections = [
    {
      key: "overdue",
      title: "Overdue Goals",
      icon: "⚠️",
      color: "border-red-400 bg-red-50/80 dark:bg-red-900/20",
      empty: "No overdue goals. Nice!",
    },
    {
      key: "today",
      title: "Due Today",
      icon: "📌",
      color: "border-amber-400 bg-amber-50/80 dark:bg-amber-900/20",
      empty: "Nothing due today.",
    },
    {
      key: "soon",
      title: "Due Soon (Next 3 days)",
      icon: "⏳",
      color: "border-blue-400 bg-blue-50/80 dark:bg-blue-900/20",
      empty: "No upcoming deadlines.",
    },
    {
      key: "completed",
      title: "Completed Goals",
      icon: "✅",
      color: "border-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/20",
      empty: "You haven't completed any goals yet.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span role="img" aria-label="bell">
              🔔
            </span>
            Notifications & Alerts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            See what's urgent, due today, coming soon, and already completed.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs sm:text-sm">
          <span>Show only urgent</span>
          <input
            type="checkbox"
            checked={showOnlyUrgent}
            onChange={(e) => setShowOnlyUrgent(e.target.checked)}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections
          .filter((s) =>
            showOnlyUrgent ? ["overdue", "today", "soon"].includes(s.key) : true
          )
          .map((section) => {
            const list = classify[section.key] || [];
            return (
              <div
                key={section.key}
                className={`rounded-2xl border ${section.color} shadow-sm p-4 flex flex-col`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {section.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {list.length} item(s)
                  </span>
                </div>

                <div className="flex-1 space-y-2 max-h-56 overflow-y-auto">
                  {list.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">
                      {section.empty}
                    </p>
                  ) : (
                    list.map((g) => {
                      const color =
                        CATEGORY_COLORS[g.category] || CATEGORY_COLORS.Other;
                      const progress = g.progress || 0;
                      return (
                        <div
                          key={g.id}
                          className="rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 p-3 flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-6 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                                  {g.title}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {g.end_date || "-"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {g.description || "No description"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-1">
                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {progress}% complete • Category: {g.category}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
        This is a smart notification view based on your goals&apos; end dates
        and progress. Real-time push / email reminders can be added later using
        background jobs in Django.
      </p>
    </div>
  );
}

export default NotificationsCenter;
