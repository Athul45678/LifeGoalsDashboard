
import React, { useState, useEffect } from "react";
import axios from "axios";

function AISuggestionsModal({ isOpen, onClose, goal, token }) {
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [generatedTasks, setGeneratedTasks] = useState([]);

  const [taskCount, setTaskCount] = useState(3);

  // ----------------------------------------------------
  // 🔥 RESET ALL STATES WHEN MODAL OPENS OR GOAL CHANGES
  // ----------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      setSuggestions([]);
      setGeneratedTasks([]);
      setTaskCount(3);
      setLoading(false);
      setTaskLoading(false);
    }
  }, [isOpen, goal]); 
  // goal added — so switching goal resets suggestions
  // ----------------------------------------------------

  if (!isOpen || !goal) return null;

  // 1️⃣ Generate Suggestions
  const handleGenerateSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/ai/suggestions/",
        { goal_id: goal.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuggestions(res.data.list || []);
    } catch (err) {
      console.error("AI Error:", err);
    }

    setLoading(false);
  };

  // 2️⃣ Generate Smart AI Tasks
  const handleGenerateTasks = async () => {
    setTaskLoading(true);
    setGeneratedTasks([]);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/ai/generate_tasks/",
        {
          goal_id: goal.id,
          count: taskCount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGeneratedTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Task AI Error:", err);
    }

    setTaskLoading(false);
  };

  // 3️⃣ Add Generated Tasks to Goal
  const handleAddTasks = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/ai/add_tasks/",
        {
          goal_id: goal.id,
          tasks: generatedTasks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Tasks added successfully!");
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Add Task Error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-96 p-6 rounded-2xl bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl shadow-xl border border-white/10">

        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          ✨ AI Tools
        </h2>

        <p className="text-sm mt-2 text-gray-800 dark:text-gray-300">
          Goal: <strong>{goal.title}</strong>
        </p>

        {/* Suggestions Button */}
        <button
          onClick={handleGenerateSuggestions}
          disabled={loading}
          className="w-full mt-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "⏳ Loading..." : "✨ Generate Suggestions"}
        </button>

        {suggestions.length > 0 && (
          <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={i} className="p-2 rounded-lg bg-white/40 dark:bg-slate-700/40">
                • {s}
              </li>
            ))}
          </ul>
        )}

        {/* Auto Task Generator */}
        <h3 className="mt-5 font-semibold text-lg text-blue-400">
          🤖 Auto-Generate Tasks
        </h3>

        <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
          Select number of tasks:
        </p>

        <div className="flex gap-3 mt-2">
          {[3, 5, 10].map((num) => (
            <button
              key={num}
              onClick={() => setTaskCount(num)}
              className={`px-3 py-1 rounded-full text-sm ${
                taskCount === num
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 dark:bg-slate-700 dark:text-gray-300"
              }`}
            >
              {num} tasks
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerateTasks}
          disabled={taskLoading}
          className="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {taskLoading ? "⚙️ Generating tasks..." : "🤖 Generate Tasks"}
        </button>

        {generatedTasks.length > 0 && (
          <>
            <h4 className="mt-4 text-sm font-semibold">Preview:</h4>
            <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {generatedTasks.map((task, i) => (
                <li key={i} className="p-2 rounded bg-white/40 dark:bg-slate-700/40">
                  • {task}
                </li>
              ))}
            </ul>

            <button
              onClick={handleAddTasks}
              className="w-full mt-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              ✅ Add Tasks to Goal
            </button>
          </>
        )}

        <button
          onClick={() => {
            // Also reset on close
            setSuggestions([]);
            setGeneratedTasks([]);
            setTaskCount(3);
            onClose();
          }}
          className="mt-4 w-full text-red-500 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default AISuggestionsModal;
