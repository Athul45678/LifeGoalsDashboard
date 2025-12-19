import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CELL_SIZE = 14;
const CELL_GAP = 2;
const LEFT_LABEL_WIDTH = 36;

function HeatmapView({ token }) {
  const [goals, setGoals] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("goals"); // "goals" | "completions" | "hybrid"

  const [hoverInfo, setHoverInfo] = useState(null);

  // popup state
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayGoals, setDayGoals] = useState([]);
  const [dayTasks, setDayTasks] = useState([]);

  const heatmapRef = useRef(null);

  // attach token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // load goals (with nested tasks)
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/goals/")
      .then((res) => setGoals(res.data || []))
      .catch((err) => console.error("Heatmap goals fetch error:", err));
  }, []);

  // helpers
  const parseDate = (d) => (d ? new Date(d) : null);

  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };

  const formatDate = (d) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const startOfWeekMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  const endOfWeekSunday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  // BUILD GRID + MAPS
  const {
    weeks,
    monthLabels,
    maxGoalCount,
    maxCompletionCount,
    dayGoalMap,
    dayTaskMap,
    activeDayCount,
    bestDay,
    longestStreak,
    currentStreak,
    totalTasksCompleted,
  } = useMemo(() => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const goalCounts = {};
    const completionCounts = {};
    const dayGoalMapInner = {};
    const dayTaskMapInner = {};

    // 1) Goal active days (start_date → end_date)
    goals.forEach((g) => {
      const gStart = parseDate(g.start_date);
      const gEnd = parseDate(g.end_date);
      if (!gStart || !gEnd) return;

      const start = gStart < yearStart ? yearStart : gStart;
      const end = gEnd > yearEnd ? yearEnd : gEnd;

      if (end < yearStart || start > yearEnd) return;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        goalCounts[key] = (goalCounts[key] || 0) + 1;
        if (!dayGoalMapInner[key]) dayGoalMapInner[key] = [];
        dayGoalMapInner[key].push(g);
      }
    });

    // 2) Task completions (completed_at)
    goals.forEach((g) => {
      (g.tasks || []).forEach((t) => {
        if (!t.completed || !t.completed_at) return;
        const d = parseDate(t.completed_at);
        if (!d || d.getFullYear() !== year) return;

        const key = d.toISOString().slice(0, 10);
        completionCounts[key] = (completionCounts[key] || 0) + 1;

        if (!dayTaskMapInner[key]) dayTaskMapInner[key] = [];
        dayTaskMapInner[key].push({
          ...t,
          goal_title: g.title,
          goal_category: g.category,
        });
      });
    });

    // 3) Build grid from Monday of first week to Sunday of last week
    const gridStart = startOfWeekMonday(yearStart);
    const gridEnd = endOfWeekSunday(yearEnd);

    const weeksArr = [];
    const monthLabelsArr = Array(500).fill("");
    const placedMonths = new Set();

    let maxGoalCountLocal = 0;
    let maxCompletionCountLocal = 0;
    let activeDayCountLocal = 0;

    let current = new Date(gridStart);
    let weekIndex = 0;

    while (current <= gridEnd) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(current);
        const key = d.toISOString().slice(0, 10);
        const inYear = d.getFullYear() === year;

        const gc = inYear ? goalCounts[key] || 0 : 0;
        const cc = inYear ? completionCounts[key] || 0 : 0;

        if (gc > 0 || cc > 0) {
          activeDayCountLocal += 1;
        }

        if (gc > maxGoalCountLocal) maxGoalCountLocal = gc;
        if (cc > maxCompletionCountLocal) maxCompletionCountLocal = cc;

        week.push({
          date: d,
          key,
          inYear,
          goalCount: gc,
          completionCount: cc,
        });

        if (inYear && d.getDate() === 1) {
          const m = d.toLocaleString("en-GB", { month: "short" });
          if (!placedMonths.has(m)) {
            placedMonths.add(m);
            monthLabelsArr[weekIndex] = m;
          }
        }

        current = addDays(current, 1);
      }

      weeksArr.push(week);
      weekIndex++;
    }

    // 4) Best day (by completions)
    let bestDayLocal = null;
    Object.keys(completionCounts).forEach((k) => {
      if (
        !bestDayLocal ||
        completionCounts[k] > completionCounts[bestDayLocal.key]
      ) {
        bestDayLocal = { key: k, count: completionCounts[k] };
      }
    });

    // 5) Streaks (based on ANY activity: goals active OR completions)
    const dayKeysSorted = Object.keys({
      ...goalCounts,
      ...completionCounts,
    }).sort();

    let longestStreakLocal = 0;
    let currentStreakLocal = 0;
    let lastDate = null;

    dayKeysSorted.forEach((key) => {
      const d = new Date(key);

      if (!lastDate) {
        currentStreakLocal = 1;
      } else {
        const diffDays =
          (d.setHours(0, 0, 0, 0) - lastDate.setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          currentStreakLocal += 1;
        } else if (diffDays > 1) {
          if (currentStreakLocal > longestStreakLocal) {
            longestStreakLocal = currentStreakLocal;
          }
          currentStreakLocal = 1;
        }
      }

      lastDate = new Date(key);
    });

    if (currentStreakLocal > longestStreakLocal) {
      longestStreakLocal = currentStreakLocal;
    }

    const totalTasksCompletedLocal = Object.values(completionCounts).reduce(
      (a, b) => a + b,
      0
    );

    return {
      weeks: weeksArr,
      monthLabels: monthLabelsArr,
      maxGoalCount: maxGoalCountLocal,
      maxCompletionCount: maxCompletionCountLocal,
      dayGoalMap: dayGoalMapInner,
      dayTaskMap: dayTaskMapInner,
      activeDayCount: activeDayCountLocal,
      bestDay: bestDayLocal,
      longestStreak: longestStreakLocal,
      currentStreak: currentStreakLocal,
      totalTasksCompleted: totalTasksCompletedLocal,
    };
  }, [goals, year]);

  // color scale
  const getCellColor = (goalCount, completionCount, inYear) => {
    if (!inYear) return "#e5e7eb";

    let intensity = 0;
    if (viewMode === "goals") {
      if (goalCount === 0) return "#edf2f7";
      if (maxGoalCount === 0) return "#bbf7d0";
      intensity = goalCount / maxGoalCount;
    } else if (viewMode === "completions") {
      if (completionCount === 0) return "#edf2f7";
      if (maxCompletionCount === 0) return "#bbf7d0";
      intensity = completionCount / maxCompletionCount;
    } else {
      // hybrid: average of normalized values
      const gNorm =
        maxGoalCount > 0 && goalCount > 0 ? goalCount / maxGoalCount : 0;
      const cNorm =
        maxCompletionCount > 0 && completionCount > 0
          ? completionCount / maxCompletionCount
          : 0;
      intensity = (gNorm + cNorm) / 2;
      if (intensity === 0) return "#edf2f7";
    }

    if (intensity <= 0.25) return "#bbf7d0";
    if (intensity <= 0.5) return "#4ade80";
    if (intensity <= 0.75) return "#22c55e";
    return "#15803d";
  };

  // export as PNG
  const handleExportImage = async () => {
    if (!heatmapRef.current) return;
    const canvas = await html2canvas(heatmapRef.current, {
      backgroundColor: "#f3f4f6",
      scale: 2,
    });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `goals-heatmap-${year}.png`;
    link.click();
  };

  // open day popup
  const openDayPopup = (dateObj) => {
    const key = dateObj.toISOString().slice(0, 10);
    setDayGoals(dayGoalMap[key] || []);
    setDayTasks(dayTaskMap[key] || []);
    setSelectedDay(dateObj);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10">
      {/* Header + summary row */}
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            📅 Activity Heatmap
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Visualize your goal activity and task completions across the year.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Year selection */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              ←
            </button>
            <span className="font-medium w-12 text-center">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              →
            </button>
          </div>

          <button
            onClick={handleExportImage}
            className="text-xs px-3 py-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
          >
            Export PNG
          </button>
        </div>
      </div>

      {/* Summary strip: A + B */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-slate-500 text-[11px]">Total Goals</p>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {goals.length}
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-slate-500 text-[11px]">Active Days</p>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {activeDayCount}
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-slate-500 text-[11px]">Tasks Completed</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {totalTasksCompleted}
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-slate-500 text-[11px]">Best Completion Day</p>
          <p className="text-[11px] text-slate-700 dark:text-slate-200">
            {bestDay
              ? `${bestDay.count} tasks on ${formatDate(new Date(bestDay.key))}`
              : "—"}
          </p>
        </div>
      </div>

      {/* View mode + legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="inline-flex rounded-full bg-slate-200 dark:bg-slate-800 p-1 text-xs">
          <button
            className={`px-3 py-1 rounded-full ${
              viewMode === "goals"
                ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-slate-100"
                : "text-slate-600 dark:text-slate-300"
            }`}
            onClick={() => setViewMode("goals")}
          >
            Goals Only
          </button>
          <button
            className={`px-3 py-1 rounded-full ${
              viewMode === "completions"
                ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-slate-100"
                : "text-slate-600 dark:text-slate-300"
            }`}
            onClick={() => setViewMode("completions")}
          >
            Completions Only
          </button>
          <button
            className={`px-3 py-1 rounded-full ${
              viewMode === "hybrid"
                ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-slate-100"
                : "text-slate-600 dark:text-slate-300"
            }`}
            onClick={() => setViewMode("hybrid")}
          >
            Hybrid
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Less</span>
          <span className="w-3 h-3 rounded bg-[#bbf7d0]" />
          <span className="w-3 h-3 rounded bg-[#4ade80]" />
          <span className="w-3 h-3 rounded bg-[#22c55e]" />
          <span className="w-3 h-3 rounded bg-[#15803d]" />
          <span>More</span>
        </div>
      </div>

      {/* MAIN HEATMAP + SIDE PANEL (C) */}
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 items-start">
        {/* Heatmap card */}
        <div
          ref={heatmapRef}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-4 overflow-x-auto"
        >
          {/* Month labels */}
          <div
            className="flex mb-1 text-[11px] text-slate-500"
            style={{ marginLeft: LEFT_LABEL_WIDTH }}
          >
            {weeks.map((_, colIdx) => (
              <div
                key={colIdx}
                style={{
                  width: CELL_SIZE + CELL_GAP,
                }}
              >
                {monthLabels[colIdx] || ""}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {WEEKDAYS.map((label, rowIdx) => (
            <div key={label} className="flex items-center">
              {/* Day label */}
              <div
                style={{ width: LEFT_LABEL_WIDTH }}
                className="text-xs text-slate-500"
              >
                {label}
              </div>

              {/* Cells */}
              {weeks.map((week, colIdx) => {
                const cell = week[rowIdx];
                const bg = getCellColor(
                  cell.goalCount,
                  cell.completionCount,
                  cell.inYear
                );

                return (
                  <div
                    key={cell.key + "-" + colIdx}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      marginRight: CELL_GAP,
                      borderRadius: 3,
                      backgroundColor: bg,
                      border: "1px solid #e5e7eb",
                      cursor: cell.inYear ? "pointer" : "default",
                    }}
                    onClick={() => cell.inYear && openDayPopup(cell.date)}
                    onMouseEnter={(e) =>
                      setHoverInfo({
                        x: e.clientX,
                        y: e.clientY,
                        date: cell.date,
                        goalCount: cell.goalCount,
                        completionCount: cell.completionCount,
                      })
                    }
                    onMouseLeave={() => setHoverInfo(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Side stats panel (C) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-4 text-xs space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Year Insights
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-100">
              Longest streak:
            </span>{" "}
            {longestStreak > 0
              ? `${longestStreak} day${longestStreak > 1 ? "s" : ""}`
              : "No streak yet"}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-100">
              Current streak:
            </span>{" "}
            {currentStreak > 0
              ? `${currentStreak} day${currentStreak > 1 ? "s" : ""}`
              : "0 days"}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-100">
              View mode:
            </span>{" "}
            {viewMode === "goals"
              ? "Active goal days"
              : viewMode === "completions"
              ? "Where tasks were completed"
              : "Combination of goals & completions"}
          </p>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoverInfo && (
        <div
          className="fixed px-2 py-1 bg-slate-900 text-white text-[11px] rounded shadow-lg pointer-events-none"
          style={{
            top: hoverInfo.y + 16,
            left: hoverInfo.x + 12,
            zIndex: 9999,
          }}
        >
          <div>{formatDate(hoverInfo.date)}</div>
          <div>
            {hoverInfo.goalCount} active goal
            {hoverInfo.goalCount === 1 ? "" : "s"}
          </div>
          <div>
            {hoverInfo.completionCount} completion
            {hoverInfo.completionCount === 1 ? "" : "s"}
          </div>
        </div>
      )}

      {/* Click popup (goals + tasks) */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute right-4 top-3 text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-3">
              {formatDate(selectedDay)}
            </h3>

            {/* Goals active this day */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
                Active Goals
              </p>
              {dayGoals.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No active goals on this day.
                </p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {dayGoals.map((g) => (
                    <li
                      key={g.id}
                      className="border p-2 rounded-lg dark:border-slate-700 text-xs"
                    >
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {g.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Category: {g.category} • Priority: {g.priority} •{" "}
                        {g.progress}% done
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tasks completed this day */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
                Tasks Completed
              </p>
              {dayTasks.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No tasks completed on this day.
                </p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {dayTasks.map((t) => (
                    <li
                      key={t.id}
                      className="border p-2 rounded-lg dark:border-slate-700 text-xs"
                    >
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Goal: {t.goal_title} • Category: {t.goal_category}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeatmapView;
