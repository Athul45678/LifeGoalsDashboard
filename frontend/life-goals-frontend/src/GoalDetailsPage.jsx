import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function GoalDetailsPage({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    axios
      .get(`http://127.0.0.1:8000/api/goals/${id}/`)
      .then((res) => setGoal(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!goal) return <p className="text-center mt-10">Goal not found.</p>;

  const completedTasks = goal.tasks.filter((t) => t.completed);
  const incompleteTasks = goal.tasks.filter((t) => !t.completed);

  const daysLeft = getDaysLeft(goal.end_date);

  const categoryColor = getCategoryColor(goal.category);

  // ------------------ ACTION HANDLERS ------------------
  const deleteGoal = () => {
    if (!window.confirm("Delete this goal?")) return;

    axios.delete(`http://127.0.0.1:8000/api/goals/${goal.id}/`).then(() => {
      navigate("/"); // return to goals page
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 relative overflow-y-auto">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-lg font-bold text-blue-500 hover:text-blue-700"
        >
          ← Back
        </button>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          {goal.title}
        </h1>

        {/* BADGES */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span
            className="px-3 py-1 text-xs rounded-full text-white"
            style={{ backgroundColor: categoryColor }}
          >
            {goal.category}
          </span>

          <span className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(goal.priority)}`}>
            {goal.priority} priority
          </span>

          <span className={`px-3 py-1 text-xs rounded-full ${getDueColor(daysLeft)}`}>
            {daysLeft > 0
              ? `${daysLeft} days left`
              : daysLeft === 0
              ? "Due today"
              : `${Math.abs(daysLeft)} days overdue`}
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
            onClick={deleteGoal}
          >
            Delete
          </button>

          <button
            className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => alert("Use your existing Edit modal here")}
          >
            Edit
          </button>

          <button
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
            onClick={() => alert("Use your Add Task modal here")}
          >
            + Task
          </button>

          <button
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => alert("Trigger AI Suggestions modal")}
          >
            ✨ AI
          </button>

          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => alert("Trigger Focus Mode (you already built it)")}
          >
            🎯 Focus
          </button>
        </div>

        {/* DATE INFO */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          Start: {goal.start_date} • End: {goal.end_date}
        </p>

        {/* PROGRESS BAR */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-semibold">{goal.progress}%</span>
          </div>

          <div className="w-full bg-gray-300 dark:bg-slate-700 h-3 rounded-full">
            <div
              className="h-3 rounded-full"
              style={{
                width: `${goal.progress}%`,
                backgroundColor: categoryColor,
              }}
            />
          </div>
        </div>

        {/* TASKS SECTION */}
        <h2 className="text-xl font-semibold mb-2">Tasks</h2>

        {/* INCOMPLETE TASKS */}
        {incompleteTasks.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Incomplete
            </h3>

            <ul className="space-y-1">
              {incompleteTasks.map((task) => (
                <li key={task.id} className="flex gap-2 items-start">
                  <input type="checkbox" checked={false} readOnly className="mt-1" />
                  <span>{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* COMPLETED TASKS */}
        {completedTasks.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h3 className="font-semibold text-green-500 dark:text-green-400 mb-1">
              Completed
            </h3>

            <ul className="space-y-1">
              {completedTasks.map((task) => (
                <li key={task.id} className="flex gap-2 items-start">
                  <input type="checkbox" checked readOnly className="mt-1" />
                  <span className="line-through opacity-60">{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------ Helper Functions ------------ */

function getDaysLeft(endDateStr) {
  if (!endDateStr) return NaN;
  const today = new Date();
  const end = new Date(endDateStr);
  const diff = end.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.round(diff / 86400000);
}

function getCategoryColor(category) {
  const colors = {
    Health: "#FF0000",
    Career: "#8A2BE2",
    Finance: "#00C853",
    Education: "#1E3A8A",
    "Personal Growth": "#FF9100",
    Relationships: "#FF69B4",
    Other: "#9CA3AF",
  };

  return colors[category] || "#9CA3AF";
}

function getPriorityColor(priority) {
  return priority === "High"
    ? "bg-red-100 text-red-700"
    : priority === "Medium"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";
}

function getDueColor(daysLeft) {
  return daysLeft < 0
    ? "bg-red-100 text-red-700"
    : daysLeft <= 3
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";
}
