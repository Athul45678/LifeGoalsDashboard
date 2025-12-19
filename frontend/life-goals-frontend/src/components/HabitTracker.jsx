import React, { useEffect, useState } from "react";
import axios from "axios";

function HabitTracker({ token }) {
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);

  // Form states
  const [title, setTitle] = useState("");
  const [linkedGoal, setLinkedGoal] = useState("");

  // Edit modal states
  const [editHabit, setEditHabit] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // 🔹 New: filter by goal for Today’s Habits list
  const [goalFilter, setGoalFilter] = useState("all");

  // Load habits & goals
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/habits/")
      .then((res) => setHabits(res.data))
      .catch((err) => console.log("Habit load error:", err));

    axios
      .get("http://127.0.0.1:8000/api/goals/")
      .then((res) => setGoals(res.data))
      .catch((err) => console.log("Goal load error:", err));
  }, []);

  // Add habit
  const createHabit = () => {
    if (!title.trim()) return alert("Enter habit name");
    if (!linkedGoal) return alert("Select a goal");

    axios
      .post("http://127.0.0.1:8000/api/habits/", {
        title,
        goal: linkedGoal,
      })
      .then((res) => {
        setHabits((prev) => [...prev, res.data]);
        setTitle("");
        setLinkedGoal("");
      })
      .catch((err) => console.log("Habit create error:", err));
  };

  // Toggle habit
  const toggleHabit = (id) => {
    axios
      .post(`http://127.0.0.1:8000/api/habits/${id}/toggle/`)
      .then((res) => {
        const updated = res.data.habit || res.data;
        setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      })
      .catch((err) => console.log("Habit toggle error:", err));
  };

  // Delete habit
  const deleteHabit = (id) => {
    if (!window.confirm("Delete this habit?")) return;

    axios
      .delete(`http://127.0.0.1:8000/api/habits/${id}/`)
      .then(() => {
        setHabits((prev) => prev.filter((h) => h.id !== id));
      })
      .catch((err) => console.log("Habit delete error:", err));
  };

  // Edit modal open
  const openEdit = (habit) => {
    setEditHabit(habit);
    setEditTitle(habit.title);
  };

  // Save edit
  const saveEditHabit = () => {
    if (!editTitle.trim()) return;

    axios
      .patch(`http://127.0.0.1:8000/api/habits/${editHabit.id}/`, {
        title: editTitle.trim(),
        goal: editHabit.goal,
      })
      .then((res) => {
        const updated = res.data.habit || res.data;
        setHabits((prev) =>
          prev.map((h) => (h.id === editHabit.id ? updated : h))
        );
        setEditHabit(null);
      })
      .catch((err) => console.log("Habit update error:", err));
  };

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];


  const isDoneToday = (habit) =>
    (habit.completed_dates || []).includes(today);

  // 🔹 Apply goal filter ONLY for the right-side lists
  const filteredForList =
    goalFilter === "all"
      ? habits
      : habits.filter((h) => String(h.goal) === String(goalFilter));

  const activeHabits = filteredForList.filter((h) => !isDoneToday(h));
  const completedHabits = filteredForList.filter((h) => isDoneToday(h));

  // Progress circle (always uses ALL habits, not filtered)
  const totalHabits = habits.length;
  const completedCount = habits.filter((h) => isDoneToday(h)).length;
  const completionPercent =
    totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (completionPercent / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-8 text-center">
        Habit & Routine Tracker
      </h2>

      {/* GRID: LEFT + RIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6">
          {/* TODAY SUMMARY */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="#22c55e"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold">
                  {completionPercent}%
                </span>
                <span className="text-[10px] text-slate-500">Today</span>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Today's Progress
              </p>

              <p className="text-lg font-semibold">
                {completedCount} / {totalHabits} habits completed
              </p>

              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                Stay consistent! Every small habit builds your goals. 💪
              </p>
            </div>
          </div>

          {/* ADD HABIT */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-3">Add New Habit</h3>

            <input
              type="text"
              placeholder="Habit name (Ex: Read 10 pages)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded bg-gray-200 dark:bg-slate-700 dark:text-white"
            />

            <select
              value={linkedGoal}
              onChange={(e) => setLinkedGoal(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded bg-gray-200 dark:bg-slate-700 dark:text-white"
            >
              <option value="">Select Goal</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>

            <button
              onClick={createHabit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              + Add Habit
            </button>
          </div>

          {/* HABIT CALENDAR VIEW */}
          <HabitCalendar habits={habits} />
        </div>

        {/* RIGHT SIDE — SCROLLABLE LIST */}
    
        <div className="max-h-[calc(210vh-300px)] overflow-y-auto pr-3 space-y-6">




          {/* ACTIVE HABITS */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">

            {/* Sticky header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 pb-2 pt-1 z-20 flex items-center justify-between mb-3 border-b border-slate-700/30">
              <h3 className="text-xl font-semibold">Today's Habits</h3>

              <select
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 dark:text-white border border-gray-300 dark:border-slate-600"
              >
                <option value="all">All Goals</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            {activeHabits.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No active habits for this filter. Add or uncheck some habits.
              </p>
            ) : (
              <ul className="space-y-3">
                {activeHabits.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    today={today}
                    completed={false}
                    toggleHabit={toggleHabit}
                    openEdit={openEdit}
                    deleteHabit={deleteHabit}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* COMPLETED HABITS */}
          {completedHabits.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border-t border-slate-700/50">
              <h3 className="text-xl font-semibold mb-3 text-green-500">
                Completed Today ✔
              </h3>

              <ul className="space-y-3">
                {completedHabits.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    today={today}
                    completed={true}
                    toggleHabit={toggleHabit}
                    openEdit={openEdit}
                    deleteHabit={deleteHabit}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editHabit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-80">
            <h3 className="text-lg font-bold mb-3">Edit Habit</h3>

            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 mb-3 rounded bg-gray-200 dark:bg-slate-700 dark:text-white"
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setEditHabit(null)}
                className="px-4 py-1 rounded bg-gray-300 dark:bg-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={saveEditHabit}
                className="px-4 py-1 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------ HABIT CALENDAR (MONTH GRID) ---------------- */

function HabitCalendar({ habits }) {
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [habitFilter, setHabitFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth(); // 0-11

  const monthLabel = monthDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const goPrevMonth = () => {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goNextMonth = () => {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  // Filter habits by selected habit
  const filteredHabits =
    habitFilter === "all"
      ? habits
      : habits.filter((h) => String(h.id) === String(habitFilter));

  const days = buildMonthGrid(year, month, filteredHabits);

  // Selected date stats
  let selectedCompleted = [];
  let selectedIncomplete = [];
  if (selectedDate) {
    selectedCompleted = filteredHabits.filter((h) =>
      (h.completed_dates || []).includes(selectedDate)
    );
    selectedIncomplete = filteredHabits.filter(
      (h) => !(h.completed_dates || []).includes(selectedDate)
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow">

      {/* Legend */}
      <div className="flex gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500"></span> Full Completed
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-400"></span> Partially Completed
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-300 dark:bg-slate-700"></span> Not Completed
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-lg font-semibold">Habit Calendar</h3>

        {/* Habit filter */}
        <select
          value={habitFilter}
          onChange={(e) => setHabitFilter(e.target.value)}
          className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 dark:text-white border border-gray-300 dark:border-slate-600"
        >
          <option value="all">All habits</option>
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.title}
            </option>
          ))}
        </select>
      </div>

      {/* Month header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={goPrevMonth}
          className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"
        >
          ◀
        </button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <button
          onClick={goNextMonth}
          className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"
        >
          ▶
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-[11px] text-center text-gray-500 dark:text-gray-400 mb-1">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {days.map((day, idx) => {
          const { date, inCurrentMonth, status, label } = day;

          let bgClass =
            "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200";
          if (!inCurrentMonth) {
            bgClass =
              "bg-transparent text-gray-400 dark:text-slate-600 border border-dashed border-gray-300/40 dark:border-slate-600/40";
          } else if (status === "full") {
            bgClass = "bg-green-500 text-white";
          } else if (status === "partial") {
            bgClass = "bg-yellow-400 text-white";
          } else if (status === "none") {
            bgClass =
              "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200";
          }

          const isSelected = selectedDate === date;

          return (
            <button
              key={idx}
              disabled={!inCurrentMonth}
              onClick={() => {
                if (inCurrentMonth) setSelectedDate(date);
              }}
              className={`h-8 flex items-center justify-center rounded-md border text-[11px]
                ${
                  inCurrentMonth
                    ? "border-gray-300 dark:border-slate-600"
                    : "border-transparent"
                }
                ${bgClass}
                ${isSelected ? "ring-2 ring-blue-400" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Selected date details */}
      {selectedDate && filteredHabits.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-slate-700 pt-3">
          <p className="text-xs font-semibold mb-1">
            {new Date(selectedDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
            Completed: {selectedCompleted.length} / {filteredHabits.length}
          </p>

          {selectedCompleted.length > 0 && (
            <>
              <p className="text-[11px] font-semibold text-green-500 mb-1">
                ✔ Completed
              </p>
              <ul className="text-[11px] text-gray-700 dark:text-slate-200 mb-2">
                {selectedCompleted.map((h) => (
                  <li key={h.id}>• {h.title}</li>
                ))}
              </ul>
            </>
          )}

          {selectedIncomplete.length > 0 && (
            <>
              <p className="text-[11px] font-semibold text-yellow-500 mb-1">
                ⏳ Not Completed
              </p>
              <ul className="text-[11px] text-gray-700 dark:text-slate-200">
                {selectedIncomplete.map((h) => (
                  <li key={h.id}>• {h.title}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// // Build month grid with status (full / partial / none)
// Build month grid with status (full / partial / none)
function buildMonthGrid(year, month, habits) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];

  // Helper to generate YYYY-MM-DD in LOCAL TIME
  const toLocalDate = (d) => d.toLocaleDateString("en-CA");

  // Previous month cells
  for (let i = 0; i < startWeekday; i++) {
    const day = daysInPrev - startWeekday + 1 + i;
    const d = new Date(year, month - 1, day);

    cells.push({
      date: toLocalDate(d),
      inCurrentMonth: false,
      status: "out",
      label: day,
    });
  }

  // Current month cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = toLocalDate(dateObj);

    let completed = 0;
    const total = habits.length;

    habits.forEach((h) => {
      if ((h.completed_dates || []).includes(dateStr)) completed += 1;
    });

    let status = "none";
    if (total === 0) status = "none";
    else if (completed === total) status = "full";
    else if (completed === 0) status = "none";
    else status = "partial";

    cells.push({
      date: dateStr,
      inCurrentMonth: true,
      status,
      label: d,
    });
  }

  // Next month cells to fill 6 rows (42 cells)
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const lastDate = new Date(last.date);
    lastDate.setDate(lastDate.getDate() + 1);

    cells.push({
      date: toLocalDate(lastDate),
      inCurrentMonth: false,
      status: "out",
      label: lastDate.getDate(),
    });
  }

  return cells;
}


// function buildMonthGrid(year, month, habits) {
//   const firstDay = new Date(year, month, 1);
//   const startWeekday = firstDay.getDay(); // 0 (Sun) - 6 (Sat)

//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const daysInPrev = new Date(year, month, 0).getDate();

//   const cells = [];

//   // Previous month cells
//   for (let i = 0; i < startWeekday; i++) {
//     const day = daysInPrev - startWeekday + 1 + i;
//     const d = new Date(year, month - 1, day);
//     cells.push({
//       date: d.toISOString().split("T")[0],
//       inCurrentMonth: false,
//       status: "out",
//       label: day,
//     });
//   }

//   // Current month cells
//   for (let d = 1; d <= daysInMonth; d++) {
//     const dateObj = new Date(year, month, d);
//     const dateStr = dateObj.toISOString().split("T")[0];

//     const total = habits.length;
//     let completed = 0;
//     habits.forEach((h) => {
//       if ((h.completed_dates || []).includes(dateStr)) completed += 1;
//     });

//     let status = "none";
//     if (total === 0) {
//       status = "none";
//     } else if (completed === 0) {
//       status = "none";
//     } else if (completed === total) {
//       status = "full";
//     } else {
//       status = "partial";
//     }

//     cells.push({
//       date: dateStr,
//       inCurrentMonth: true,
//       status,
//       label: d,
//     });
//   }

//   // Next month cells to fill 42 (6 weeks)
//   while (cells.length % 7 !== 0) {
//     const last = cells[cells.length - 1];
//     const lastDate = new Date(last.date);
//     lastDate.setDate(lastDate.getDate() + 1);
//     const dNum = lastDate.getDate();
//     cells.push({
//       date: lastDate.toISOString().split("T")[0],
//       inCurrentMonth: false,
//       status: "out",
//       label: dNum,
//     });
//   }

//   return cells;
// }

/* ------------ HELPERS & ROW COMPONENT ---------------- */

function getHabitIcon(title) {
  const t = title.toLowerCase();
  if (t.includes("read") || t.includes("book")) return "📘";
  if (t.includes("run") || t.includes("walk")) return "🏃";
  if (t.includes("gym") || t.includes("exercise")) return "🏋️";
  if (t.includes("meditat") || t.includes("mind")) return "🧘";
  if (t.includes("study") || t.includes("learn")) return "📚";
  if (t.includes("water")) return "💧";
  if (t.includes("sleep")) return "😴";
  if (t.includes("code")) return "💻";
  return "✅";
}

function getLast7Days() {
  const arr = [];
  const labels = ["S", "M", "T", "W", "T", "F", "S"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push({
      iso: d.toISOString().split("T")[0],
      label: labels[d.getDay()],
    });
  }
  return arr;
}

function HabitRow({
  habit,
  today,
  completed,
  toggleHabit,
  openEdit,
  deleteHabit,
}) {
  const icon = getHabitIcon(habit.title);
  const last7 = getLast7Days();
  const doneToday = (habit.completed_dates || []).includes(today);

  return (
    <li className="flex justify-between items-center bg-gray-100 dark:bg-slate-700 p-3 rounded-lg">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <p
            className={`text-lg font-medium ${
              completed ? "line-through text-gray-400" : ""
            }`}
          >
            {habit.title}
          </p>
        </div>

        <p className="text-xs text-gray-400">Goal: {habit.goal_title}</p>
        <p className="text-xs mt-1 text-green-500">
          🔥 Streak: {habit.streak} days
        </p>

        {/* WEEK GRAPH */}
        <div className="flex items-center gap-1 mt-2">
          {last7.map((d, idx) => {
            const isDone = (habit.completed_dates || []).includes(d.iso);
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] 
                  ${
                    isDone
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-slate-200"
                  }`}
              >
                {d.label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="w-5 h-5"
          checked={doneToday}
          onChange={() => toggleHabit(habit.id)}
        />

        <button
          onClick={() => openEdit(habit)}
          className="text-yellow-400 text-sm hover:text-yellow-300"
        >
          Edit
        </button>

        <button
          onClick={() => deleteHabit(habit.id)}
          className="text-red-500 text-sm hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default HabitTracker;
