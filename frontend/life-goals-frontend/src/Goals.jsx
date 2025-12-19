import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";

import AddGoalModal from "./components/AddGoalModal";
import AddTaskModal from "./components/AddTaskModal";
import EditGoalModal from "./components/EditGoalModal";
import EditTaskModal from "./components/EditTaskModal";
import AISuggestionsModal from "./components/AISuggestionsModal";

import GoalCard from "./GoalCard";
import Analytics from "./Analytics";
import FocusMode from "./FocusMode"; // Focus mode page

function Goals({ token }) {
  const [goals, setGoals] = useState([]);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Task Modal
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [goalToEdit, setGoalToEdit] = useState(null);

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [sortOption, setSortOption] = useState("progress-desc");

  const dragGoalRef = useRef(null);

  // AI Suggestions modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedAIGoal, setSelectedAIGoal] = useState(null);

  // Focus Mode selected goal
  const [focusGoal, setFocusGoal] = useState(null);

  // Full goal detail modal
  const [detailGoal, setDetailGoal] = useState(null);

  // Helper to keep detailGoal in sync whenever goals change
  const syncDetailGoal = (updatedGoals) => {
    setDetailGoal((prev) => {
      if (!prev) return prev;
      const fresh = updatedGoals.find((g) => g.id === prev.id);
      return fresh || null;
    });
  };

  // Set Authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // Load goals
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/goals/")
      .then((res) => setGoals(res.data))
      .catch((err) => console.error("Error fetching goals:", err));
  }, []);

  // Create Goal
  const createGoal = (goal) => {
    axios
      .post("http://127.0.0.1:8000/api/goals/", goal)
      .then((res) => {
        const updatedGoals = [...goals, { ...res.data, tasks: [] }];
        setGoals(updatedGoals);
        syncDetailGoal(updatedGoals);
        setShowGoalModal(false);
      })
      .catch((err) => console.error("Error creating goal:", err));
  };

  // Delete Goal
  const deleteGoal = (goalId) => {
    axios
      .delete(`http://127.0.0.1:8000/api/goals/${goalId}/`)
      .then(() => {
        const updatedGoals = goals.filter((g) => g.id !== goalId);
        setGoals(updatedGoals);
        // if this goal is opened in detail modal, close it
        setDetailGoal((prev) => (prev && prev.id === goalId ? null : prev));
      })
      .catch((err) => console.error("Error deleting goal:", err));
  };

  // Add task
  const addTaskToGoal = (task) => {
    axios
      .post("http://127.0.0.1:8000/api/tasks/", task)
      .then((res) => {
        const newTask = res.data;

        const updatedGoals = goals.map((goal) => {
          if (goal.id === newTask.goal) {
            const updatedTasks = [...(goal.tasks || []), newTask];
            return {
              ...goal,
              tasks: updatedTasks,
              progress: calculateProgress(updatedTasks),
            };
          }
          return goal;
        });

        setGoals(updatedGoals);
        syncDetailGoal(updatedGoals);
        setShowTaskModal(false);
      })
      .catch((err) => console.error("Error creating task:", err));
  };

  // Update goal details
  const handleUpdateGoal = (updatedGoal) => {
    axios
      .patch(
        `http://127.0.0.1:8000/api/goals/${updatedGoal.id}/`,
        updatedGoal
      )
      .then((res) => {
        const saved = res.data;

        const updatedGoals = goals.map((g) =>
          g.id === saved.id ? { ...saved, tasks: g.tasks } : g
        );

        setGoals(updatedGoals);
        syncDetailGoal(updatedGoals);
        setShowEditModal(false);
      })
      .catch((err) => console.error("Error updating goal:", err));
  };

  // Toggle task completed
  const toggleTask = (task) => {
    axios
      .patch(`http://127.0.0.1:8000/api/tasks/${task.id}/`, {
        completed: !task.completed,
      })
      .then((res) => {
        const updated = res.data;

        const updatedGoals = goals.map((goal) => {
          if (goal.id === updated.goal) {
            const updatedTasks = (goal.tasks || []).map((t) =>
              t.id === updated.id ? updated : t
            );

            return {
              ...goal,
              tasks: updatedTasks,
              progress: calculateProgress(updatedTasks),
            };
          }
          return goal;
        });

        setGoals(updatedGoals);
        syncDetailGoal(updatedGoals); // 🔥 keep modal in sync
      })
      .catch((err) => console.error("Error updating task:", err));
  };

  // Edit Task Save
  const handleEditTask = (task) => {
    axios
      .patch(`http://127.0.0.1:8000/api/tasks/${task.id}/`, task)
      .then((res) => {
        const updated = res.data;

        const updatedGoals = goals.map((goal) => {
          if (goal.id === updated.goal) {
            const updatedTasks = (goal.tasks || []).map((t) =>
              t.id === updated.id ? updated : t
            );

            return {
              ...goal,
              tasks: updatedTasks,
              progress: calculateProgress(updatedTasks),
            };
          }
          return goal;
        });

        setGoals(updatedGoals);
        syncDetailGoal(updatedGoals);
        setShowEditTaskModal(false);
      })
      .catch((err) => console.error("Error saving task:", err));
  };

  // Delete Task
  const handleDeleteTask = (task) => {
    axios
      .delete(`http://127.0.0.1:8000/api/tasks/${task.id}/`)
      .then(() => {
        const updatedGoals = goals.map((goal) => {
          if (goal.id === task.goal) {
            const updatedTasks = (goal.tasks || []).filter(
              (t) => t.id !== task.id
            );
            return {
              ...goal,
              tasks: updatedTasks,
              progress: calculateProgress(updatedTasks),
            };
          }
          return goal;
        });

        setGoals(updatedGoals);
        syncDetailGoal(updatedGoals);
        setShowEditTaskModal(false);
      })
      .catch((err) => console.error("Error deleting task:", err));
  };

  // Drag + Drop
  const onDragStart = (e, goal) => {
    dragGoalRef.current = goal;
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e, targetGoal) => {
    const draggedGoal = dragGoalRef.current;
    if (!draggedGoal || draggedGoal.id === targetGoal.id) return;

    const updated = reorderGoals(goals, draggedGoal, targetGoal);
    setGoals(updated);

    axios
      .patch(`http://127.0.0.1:8000/api/goals/${draggedGoal.id}/reorder/`, {
        order: updated.findIndex((g) => g.id === draggedGoal.id),
      })
      .catch((err) => console.error("Error reordering goal:", err));
  };

  const reorderGoals = (goalList, dragged, target) => {
    const newList = [...goalList];
    const fromIndex = newList.findIndex((g) => g.id === dragged.id);
    const toIndex = newList.findIndex((g) => g.id === target.id);

    newList.splice(fromIndex, 1);
    newList.splice(toIndex, 0, dragged);

    return newList.map((g, index) => ({ ...g, order: index }));
  };

  // Sorting & filters
  const filteredSortedGoals = useMemo(() => {
    let result = [...goals];

    if (filterCategory !== "All")
      result = result.filter((g) => g.category === filterCategory);

    if (filterPriority !== "All")
      result = result.filter((g) => g.priority === filterPriority);

    const priorityRank = { High: 3, Medium: 2, Low: 1 };

    result.sort((a, b) => {
      if (sortOption === "progress-desc")
        return (b.progress || 0) - (a.progress || 0);
      if (sortOption === "endDate-asc")
        return new Date(a.end_date) - new Date(b.end_date);
      if (sortOption === "priority-desc")
        return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
      return 0;
    });

    return result;
  }, [goals, filterCategory, filterPriority, sortOption]);

  // Active vs completed goals
  const activeGoals = filteredSortedGoals.filter(
    (g) => (g.progress || 0) < 100
  );
  const completedGoals = filteredSortedGoals.filter(
    (g) => (g.progress || 0) === 100
  );

  // Focus button handler
  const handleFocus = (goal) => {
    setFocusGoal(goal);
  };

  // Open / close detail modal
  const openDetail = (goal) => setDetailGoal(goal);
  const closeDetail = () => setDetailGoal(null);

  // Reusable helpers for opening modals
  const openEditGoal = (goal) => {
    setGoalToEdit(goal);
    setShowEditModal(true);
  };

  const openEditGoalFromDetail = (goal) => {
    closeDetail();
    openEditGoal(goal);
  };

  const openAddTask = (goal) => {
    setSelectedGoalId(goal.id);
    setShowTaskModal(true);
  };

  const openAddTaskFromDetail = (goal) => {
    closeDetail();
    openAddTask(goal);
  };

  const openAISuggestions = (goal) => {
    setSelectedAIGoal(goal);
    setShowAIModal(true);
  };

  const openAISuggestionsFromDetail = (goal) => {
    closeDetail();
    openAISuggestions(goal);
  };

  const openFocusFromDetail = (goal) => {
    closeDetail();
    handleFocus(goal);
  };

  const openTaskEdit = (task) => {
    setTaskToEdit(task);
    setShowEditTaskModal(true);
  };

  // If Focus Mode active → show only FocusMode
  if (focusGoal) {
    return (
      <FocusMode
        goal={focusGoal}
        onClose={() => setFocusGoal(null)}
        onToggleTask={toggleTask}
      />
    );
  }

  // Normal Goals page
  return (
    <>
      <Analytics goals={goals} />

      {/* Filters */}
      <div className="max-w-5xl mx-auto mt-4 mb-4 bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow flex flex-wrap gap-3 items-center">
        <div>
          <label className="block text-xs font-semibold">Category</label>
          <select
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-700"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option>All</option>
            <option>Health</option>
            <option>Career</option>
            <option>Finance</option>
            <option>Education</option>
            <option>Personal Growth</option>
            <option>Relationships</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold">Priority</label>
          <select
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-700"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold">Sort By</label>
          <select
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-700"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="progress-desc">Progress (High → Low)</option>
            <option value="endDate-asc">End Date (Sooner first)</option>
            <option value="priority-desc">Priority (High first)</option>
          </select>
        </div>

        <div className="ml-auto">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            onClick={() => setShowGoalModal(true)}
          >
            + Add Goal
          </button>
        </div>
      </div>

      {/* ACTIVE GOALS – small cards in 2-column grid */}
      <div className="max-w-5xl mx-auto">
        {activeGoals.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">
              Active Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={deleteGoal}
                  onEdit={() => openEditGoal(goal)}
                  onAddTask={() => openAddTask(goal)}
                  onToggleTask={toggleTask}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onEditTask={openTaskEdit}
                  onAISuggestions={() => openAISuggestions(goal)}
                  onFocus={handleFocus}
                  onOpenDetails={() => openDetail(goal)}
                />
              ))}
            </div>
          </>
        )}

        {/* COMPLETED GOALS – also small cards in 2-column grid */}
        {completedGoals.length > 0 && (
          <div className="mt-10 pt-6 border-t border-white/10 opacity-95">
            <h2 className="text-lg font-semibold mb-4 text-slate-600 dark:text-slate-300">
              Completed Goals
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={deleteGoal}
                  onEdit={() => openEditGoal(goal)}
                  onAddTask={() => openAddTask(goal)}
                  onToggleTask={toggleTask}
                  onDragStart={() => {}}
                  onDragOver={() => {}}
                  onDrop={() => {}}
                  onEditTask={openTaskEdit}
                  onAISuggestions={() => openAISuggestions(goal)}
                  onFocus={handleFocus}
                  onOpenDetails={() => openDetail(goal)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailGoal && (
        <GoalDetailModal
          goal={detailGoal}
          onClose={closeDetail}
          onDelete={deleteGoal}
          onEdit={openEditGoalFromDetail}
          onAddTask={openAddTaskFromDetail}
          onToggleTask={toggleTask}
          onEditTask={openTaskEdit}
          onAISuggestions={openAISuggestionsFromDetail}
          onFocus={openFocusFromDetail}
        />
      )}

      {/* Modals */}
      <AddGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSave={createGoal}
      />

      <AddTaskModal
        isOpen={showTaskModal}
        goalId={selectedGoalId}
        onClose={() => setShowTaskModal(false)}
        onSave={addTaskToGoal}
      />

      <EditGoalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        goal={goalToEdit}
        onSave={handleUpdateGoal}
      />

      <EditTaskModal
        isOpen={showEditTaskModal}
        onClose={() => setShowEditTaskModal(false)}
        task={taskToEdit}
        onSave={handleEditTask}
        onDelete={handleDeleteTask}
      />

      <AISuggestionsModal
        isOpen={showAIModal}
        onClose={() => {
          setShowAIModal(false);
          setSelectedAIGoal(null);
        }}
        goal={selectedAIGoal}
        token={token}
      />
    </>
  );
}

// Progress calc
const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.completed).length;
  return Math.round((done / tasks.length) * 100);
};

export default Goals;

/* ---------------- GOAL DETAIL MODAL (FULL VIEW) ---------------- */

function GoalDetailModal({
  goal,
  onClose,
  onDelete,
  onEdit,
  onAddTask,
  onToggleTask,
  onEditTask,
  onAISuggestions,
  onFocus,
}) {
  const daysLeft = getDaysLeft(goal.end_date);

  const CATEGORY_COLORS = {
    Health: "#ef4444", // red-500
    Career: "#8b5cf6", // violet-500
    Finance: "#22c55e", // green-500
    Education: "#2563eb", // blue-600
    "Personal Growth": "#f97316", // orange-500
    Relationships: "#ec4899", // pink-500
    Other: "#6b7280",
    General: "#6b7280",
  };

  const categoryColor =
    CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other;

  const priorityBadge =
    goal.priority === "High"
      ? "bg-red-100 text-red-700"
      : goal.priority === "Medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  const dueBadge =
    daysLeft < 0
      ? "bg-red-100 text-red-700"
      : daysLeft === 0
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  const incompleteTasks = (goal.tasks || []).filter((t) => !t.completed);
  const completedTasks = (goal.tasks || []).filter((t) => t.completed);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-2">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
        {/* Top gradient header with back + title */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}55)`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 text-sm shadow"
            >
              ←
            </button>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Goal Details
              </p>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50 truncate max-w-[14rem] md:max-w-[20rem]">
                {goal.title}
              </h2>
            </div>
          </div>

          {/* quick badges */}
          <div className="hidden md:flex flex-col items-end gap-1 text-[11px]">
            <span
              className="px-2 py-[3px] rounded-full text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {goal.category}
            </span>
            <span className={`px-2 py-[3px] rounded-full ${priorityBadge}`}>
              {goal.priority} priority
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* badges row (mobile) */}
          <div className="flex md:hidden gap-2 flex-wrap text-[11px]">
            <span
              className="px-2 py-[3px] rounded-full text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {goal.category}
            </span>
            <span className={`px-2 py-[3px] rounded-full ${priorityBadge}`}>
              {goal.priority} priority
            </span>
          </div>

          {/* Dates + due */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Start: <strong>{goal.start_date || "-"}</strong>
            </span>
            <span>•</span>
            <span>
              End: <strong>{goal.end_date || "-"}</strong>
            </span>
            <span
              className={`px-2 py-[3px] rounded-full text-[11px] ${dueBadge}`}
            >
              {Number.isNaN(daysLeft)
                ? "No deadline"
                : daysLeft > 0
                ? `${daysLeft} days left`
                : daysLeft === 0
                ? "Due today"
                : `${Math.abs(daysLeft)} days overdue`}
            </span>
          </div>

          {/* Description */}
          {goal.description && (
            <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2">
              {goal.description}
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-slate-400">
                Progress
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-100">
                {goal.progress || 0}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${goal.progress || 0}%`,
                  backgroundColor: categoryColor,
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 text-xs mt-2">
            <button
              onClick={() => onAddTask && onAddTask(goal)}
              className="px-3 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white"
            >
              + Add Task
            </button>
            <button
              onClick={() => onEdit && onEdit(goal)}
              className="px-3 py-1.5 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              ✏ Edit Goal
            </button>
            <button
              onClick={() => onAISuggestions && onAISuggestions(goal)}
              className="px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              ✨ AI Suggestions
            </button>
            <button
              onClick={() => onFocus && onFocus(goal)}
              className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              🎯 Focus Mode
            </button>
            <button
              onClick={() => onDelete && onDelete(goal.id)}
              className="ml-auto px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              🗑 Delete
            </button>
          </div>

          {/* Tasks: Active + Completed */}
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            {/* Active */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">
                Active Tasks
              </h3>
              {incompleteTasks.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No active tasks.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {incompleteTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 rounded-lg px-2 py-1.5"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer"
                        checked={task.completed}
                        onChange={() => onToggleTask && onToggleTask(task)}
                      />
                      <span
                        onClick={() => onEditTask && onEditTask(task)}
                        className="cursor-pointer text-slate-800 dark:text-slate-100"
                      >
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Completed */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">
                Completed Tasks
              </h3>
              {completedTasks.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No tasks completed yet.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {completedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-2 bg-emerald-50/80 dark:bg-emerald-900/30 rounded-lg px-2 py-1.5"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer"
                        checked={task.completed}
                        onChange={() => onToggleTask && onToggleTask(task)}
                      />
                      <span
                        onClick={() => onEditTask && onEditTask(task)}
                        className="cursor-pointer line-through text-slate-500 dark:text-slate-300"
                      >
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* bottom close button */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// reuse same as in GoalCard
function getDaysLeft(endDateStr) {
  if (!endDateStr) return NaN;
  const today = new Date();
  const end = new Date(endDateStr);
  const diffMs =
    end.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
