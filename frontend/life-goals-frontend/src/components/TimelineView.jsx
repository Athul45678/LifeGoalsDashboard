import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function TimelineView({ token }) {
  const [goals, setGoals] = useState([]);
  const [zoom, setZoom] = useState("month"); // "month" | "quarter" | "year"
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const timelineRef = useRef(null);
  const dragState = useRef(null); // {goalId, edge, originalStart, originalEnd, startX}

  // Attach token to axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // Load goals for timeline
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/goals/")
      .then((res) => setGoals(res.data || []))
      .catch((err) => console.error("Timeline goals fetch error:", err));
  }, []);

  // ---------- Date helpers ----------
  const parseDate = (d) => (d ? new Date(d) : null);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const daysBetween = (a, b) => {
    const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    const diff = b0 - a0;
    return diff / (1000 * 60 * 60 * 24);
  };

  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };

  // ---------- Compute min / max dates ----------
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (!goals.length) {
      const today = new Date();
      const end = addDays(today, 30);
      return { minDate: today, maxDate: end, totalDays: 30 };
    }

    let min = null;
    let max = null;

    goals.forEach((g) => {
      const s = parseDate(g.start_date) || new Date();
      const e =
        parseDate(g.end_date) ||
        addDays(parseDate(g.start_date) || new Date(), 7);

      if (!min || s < min) min = s;
      if (!max || e > max) max = e;
    });

    // small padding
    min = addDays(min, -2);
    max = addDays(max, 2);

    const days = Math.max(1, Math.round(daysBetween(min, max)));
    return { minDate: min, maxDate: max, totalDays: days };
  }, [goals]);

  // ---------- Fixed-width inner grid ----------
  const BASE_WIDTHS = {
    month: 1200,
    quarter: 900,
    year: 700,
  };

  const innerWidth = BASE_WIDTHS[zoom] || 1200;

  // One "logical" day width (for grid & drag math)
  const perDayWidth = innerWidth / totalDays;

  // ---------- Category colors ----------
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

  const PRIORITY_BADGE = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-emerald-100 text-emerald-700",
  };

  // ---------- Dependencies (simple) ----------
  const goalDependencies = useMemo(() => {
    const withDates = goals
      .map((g) => ({
        ...g,
        _start: parseDate(g.start_date) || new Date(),
        _end:
          parseDate(g.end_date) ||
          addDays(parseDate(g.start_date) || new Date(), 7),
      }))
      .sort((a, b) => a._start - b._start);

    const deps = {};
    withDates.forEach((g, idx) => {
      deps[g.id] = idx === 0 ? null : withDates[idx - 1];
    });
    return deps;
  }, [goals]);

  // ---------- Sort + split: ongoing vs completed ----------
  const sortedGoals = useMemo(
    () =>
      goals
        .slice()
        .sort(
          (a, b) =>
            new Date(a.start_date || a.end_date) -
            new Date(b.start_date || b.end_date)
        ),
    [goals]
  );

  const activeGoals = useMemo(
    () => sortedGoals.filter((g) => (g.progress || 0) < 100),
    [sortedGoals]
  );

  const completedGoals = useMemo(
    () => sortedGoals.filter((g) => (g.progress || 0) >= 100),
    [sortedGoals]
  );

  // ---------- Drag-resize handlers (scaled) ----------
  useEffect(() => {
    const handleMove = (e) => {
      if (!dragState.current) return;

      const { goalId, edge, originalStart, originalEnd, startX } =
        dragState.current;

      const deltaPx = e.clientX - startX;
      const deltaRatio = deltaPx / innerWidth;
      const deltaDays = Math.round(deltaRatio * totalDays);

      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;

          let newStart = parseDate(originalStart);
          let newEnd = parseDate(originalEnd);

          if (!newStart || !newEnd) return g;

          if (edge === "start") {
            newStart = addDays(parseDate(originalStart), deltaDays);
            if (newStart > newEnd) newStart = newEnd;
          } else {
            newEnd = addDays(parseDate(originalEnd), deltaDays);
            if (newEnd < newStart) newEnd = newStart;
          }

          return {
            ...g,
            start_date: newStart.toISOString().slice(0, 10),
            end_date: newEnd.toISOString().slice(0, 10),
          };
        })
      );
    };

    const handleUp = () => {
      if (!dragState.current) return;
      const { goalId } = dragState.current;
      dragState.current = null;

      const g = goals.find((x) => x.id === goalId);
      if (!g) return;

      axios
        .patch(`http://127.0.0.1:8000/api/goals/${goalId}/`, {
          start_date: g.start_date,
          end_date: g.end_date,
        })
        .catch((err) => console.error("Error saving dragged dates:", err));
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [goals, innerWidth, totalDays]);

  const startDrag = (e, goal, edge) => {
    e.stopPropagation();
    dragState.current = {
      goalId: goal.id,
      edge,
      originalStart: goal.start_date,
      originalEnd: goal.end_date,
      startX: e.clientX,
    };
  };

  // ---------- PDF Export (fixed width, full content) ----------
  const handleExportPDF = async () => {
    if (!timelineRef.current) return;

    try {
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: "#f3f4f6",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(
        pageWidth / canvas.width,
        pageHeight / canvas.height
      );
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("goal-timeline.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  // ---------- Calendar header (scaled) ----------
  const renderCalendarHeader = () => {
    const cells = [];
    for (let i = 0; i <= totalDays; i++) {
      const day = addDays(minDate, i);

      const showLabel =
        zoom === "month"
          ? true
          : zoom === "quarter"
          ? day.getDate() === 1 || i === 0
          : // year
            day.getDate() === 1 &&
            (day.getMonth() === 0 || day.getMonth() === 6);

      cells.push(
        <div
          key={i}
          className="relative flex items-end justify-center text-[10px] text-slate-500"
          style={{
            width: perDayWidth,
            minWidth: perDayWidth,
          }}
        >
          {showLabel && (
            <span className="px-1 rounded bg-white/80 shadow text-[10px]">
              {zoom === "year"
                ? day.toLocaleDateString("en-GB", {
                    month: "short",
                    year: "2-digit",
                  })
                : day.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
            </span>
          )}
        </div>
      );
    }
    return cells;
  };

  // ---------- Single row renderer (reused for active + completed) ----------
  const renderGoalRow = (goal, isCompleted) => {
    const start = parseDate(goal.start_date) || minDate;
    const end = parseDate(goal.end_date) || addDays(start || minDate, 7);

    const totalSpanDays = Math.max(
      1,
      Math.round(daysBetween(minDate, maxDate))
    );
    const startOffsetDays = Math.max(0, daysBetween(minDate, start));
    const goalDurationDays = Math.max(1, daysBetween(start, end) + 1);

    const startRatio = startOffsetDays / totalSpanDays;
    const lengthRatio = goalDurationDays / totalSpanDays;

    let barLeft = startRatio * innerWidth;
    let barWidth = lengthRatio * innerWidth;

    const MIN_WIDTH = 80;
    if (barWidth < MIN_WIDTH) {
      barWidth = MIN_WIDTH;
    }
    if (barLeft + barWidth > innerWidth) {
      barLeft = Math.max(0, innerWidth - barWidth);
    }

    const catColor =
      CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other;
    const progress = goal.progress || 0;
    const tasks = goal.tasks || [];
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.completed).length;
    const dependsOn = goalDependencies[goal.id];

    return (
      <div key={goal.id} className="relative flex gap-3 items-stretch">
        {/* Left meta card */}
        <div className="w-44 flex flex-col justify-center pl-2">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-6 rounded-full"
              style={{ backgroundColor: catColor }}
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
              {goal.title}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
            {goal.category && (
              <span className="px-2 py-[2px] rounded-full bg-slate-100 dark:bg-slate-800">
                {goal.category}
              </span>
            )}
            {goal.priority && (
              <span
                className={
                  "px-2 py-[2px] rounded-full " +
                  (PRIORITY_BADGE[goal.priority] ||
                    "bg-slate-100 text-slate-600")
                }
              >
                {goal.priority}
              </span>
            )}
            {isCompleted && (
              <span className="px-2 py-[2px] rounded-full bg-emerald-100 text-emerald-700">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Timeline row card */}
        <div
          className={
            "relative flex-1 rounded-2xl border shadow-sm overflow-hidden " +
            (isCompleted
              ? "bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700")
          }
          style={{
            backgroundImage: `repeating-linear-gradient(
              to right,
              rgba(148,163,184,0.25) 0px,
              rgba(148,163,184,0.25) 1px,
              transparent 1px,
              transparent ${perDayWidth}px
            )`,
          }}
        >
          {/* Bar area */}
          <div className="relative h-16">
            <div
              className="absolute top-3 h-8 rounded-full cursor-pointer shadow-md flex items-center"
              style={{
                left: barLeft,
                width: barWidth,
                backgroundColor: catColor,
                opacity: isCompleted ? 0.9 : 0.96,
                transition: "all 0.2s ease-out",
              }}
              onClick={() => {
                setSelectedGoal(goal);
                setShowDetail(true);
              }}
            >
              {/* Progress fill */}
              <div
                className="h-full rounded-l-full bg-black/15"
                style={{ width: `${progress}%` }}
              />

              {/* Text inside bar */}
              <div className="flex-1 px-3 flex items-center justify-between text-[11px] text-white font-medium">
                <span className="truncate">{goal.title}</span>
                <span>{isCompleted ? "Completed" : `${progress}%`}</span>
              </div>

              {/* Drag handles (still allowed, even for completed) */}
              <div
                className="absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-black/10"
                onMouseDown={(e) => startDrag(e, goal, "start")}
              />
              <div
                className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-black/10"
                onMouseDown={(e) => startDrag(e, goal, "end")}
              />

              {/* Milestones (tasks) */}
              {totalTasks > 0 &&
                tasks.map((t, idx) => {
                  const pos = (idx + 1) / (totalTasks + 1);
                  return (
                    <div
                      key={t.id}
                      className="absolute -top-1 w-2 h-2 rounded-full border border-white"
                      style={{
                        left: `${pos * 100}%`,
                        backgroundColor: t.completed
                          ? "#22c55e"
                          : "#facc15",
                      }}
                      title={t.title}
                    />
                  );
                })}
            </div>
          </div>

          {/* Footer info */}
          <div className="px-4 pb-2 pt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {formatDate(start)} → {formatDate(end)} •{" "}
              {isCompleted ? "Completed" : `${progress}%`} • {doneTasks}/
              {totalTasks || 0} tasks
            </span>
            {dependsOn && (
              <span className="italic hidden sm:inline">
                Depends on{" "}
                <span className="font-medium">{dependsOn.title}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---------- Render ----------
  return (
    <div className="max-w-5xl mx-auto px-4 pb-10">
      {/* Header & controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span role="img" aria-label="timeline">
              📊
            </span>
            Timeline Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Bars are scaled to fit — drag the edges to adjust dates, click a bar
            for details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 text-xs">
            {["month", "quarter", "year"].map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-3 py-1 rounded-full capitalize ${
                  zoom === z
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            className="text-xs px-3 py-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-sky-500" /> Today marker
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border border-slate-400" /> 1
          cell ≈ timeline-scaled day
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-[6px] rounded-full bg-slate-300" /> Goal bar
        </span>
      </div>

      {/* Timeline container (fixed width, scrollable) */}
      <div
        ref={timelineRef}
        className="overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-inner"
      >
        <div
          className="relative"
          style={{
            minWidth: innerWidth + 220, // left label + grid
          }}
        >
          {/* Calendar header */}
          <div className="sticky top-0 z-10 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur px-32 pt-2 pb-1 border-b border-slate-200 dark:border-slate-700">
            <div className="flex" style={{ width: innerWidth }}>
              {renderCalendarHeader()}
            </div>
          </div>

          {/* Today vertical line */}
          {(() => {
            const today = new Date();
            const offsetDays = daysBetween(minDate, today);
            if (offsetDays < 0 || offsetDays > totalDays) return null;
            const left = offsetDays * perDayWidth + 200; // space for labels

            return (
              <div
                className="pointer-events-none absolute"
                style={{
                  left,
                  top: 80,
                  bottom: 0,
                }}
              >
                <div className="w-[2px] h-full bg-sky-500/60" />
              </div>
            );
          })()}

          {/* Rows */}
          <div className="px-4 pb-5 pt-3 space-y-4">
            {goals.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-6">
                No goals yet. Create goals on the Goals page to see them here.
              </p>
            )}

            {/* Ongoing section */}
            {activeGoals.length > 0 && (
              <>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  🔄 Ongoing Goals
                </div>
                {activeGoals.map((g) => renderGoalRow(g, false))}
              </>
            )}

            {/* Completed section */}
            {completedGoals.length > 0 && (
              <>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>✅ Completed Goals</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    These goals are finished and kept here for your records.
                  </span>
                </div>
                {completedGoals.map((g) => renderGoalRow(g, true))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedGoal && (
        <GoalDetailModal
          goal={selectedGoal}
          dependsOn={goalDependencies[selectedGoal.id]}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
}

// ---------- Detail popup ----------
function GoalDetailModal({ goal, dependsOn, onClose }) {
  const tasks = goal.tasks || [];
  const doneTasks = tasks.filter((t) => t.completed).length;
  const progress = goal.progress || 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-slate-400 hover:text-slate-200 text-lg"
        >
          ✕
        </button>

        <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span role="img" aria-label="sparkles">
            ✨
          </span>
          {goal.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          {goal.description || "No description"}
        </p>

        <div className="flex flex-wrap gap-2 text-xs mb-3">
          {goal.category && (
            <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              Category: {goal.category}
            </span>
          )}
          {goal.priority && (
            <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              Priority: {goal.priority}
            </span>
          )}
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            Progress: {progress}%
          </span>
        </div>

        {dependsOn && (
          <p className="text-xs text-slate-500 mb-3">
            <span className="font-semibold">Depends on:</span>{" "}
            {dependsOn.title}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1 text-slate-500">
            <span>Timeline progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks (incomplete first, completed under ✓ Completed) */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Tasks ({doneTasks}/{tasks.length || 0})
            </span>
            <span className="text-[11px] text-slate-500">
              Milestones are the dots shown on the timeline bar.
            </span>
          </div>

          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500">
              No tasks attached to this goal yet.
            </p>
          ) : (
            <>
              <ul className="max-h-40 overflow-y-auto text-xs space-y-1">
                {/* Incomplete */}
                {tasks
                  .filter((t) => !t.completed)
                  .map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        readOnly
                        checked={t.completed}
                        className="w-3 h-3"
                      />
                      <span className="text-slate-700 dark:text-slate-200">
                        {t.title}
                      </span>
                    </li>
                  ))}

                {/* Divider for completed */}
                {doneTasks > 0 && (
                  <li className="mt-2 mb-1 text-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    ✓ Completed
                  </li>
                )}

                {/* Completed */}
                {tasks
                  .filter((t) => t.completed)
                  .map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 opacity-70"
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={true}
                        className="w-3 h-3"
                      />
                      <span className="line-through text-slate-500 dark:text-slate-400">
                        {t.title}
                      </span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>

        {/* Dates */}
        <p className="text-xs text-slate-500">
          <span className="font-semibold">Start:</span> {goal.start_date || "-"}{" "}
          • <span className="font-semibold">End:</span>{" "}
          {goal.end_date || "-"}
        </p>
      </div>
    </div>
  );
}

export default TimelineView;
