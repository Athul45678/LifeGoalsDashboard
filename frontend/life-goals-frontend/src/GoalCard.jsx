import React from "react";

function GoalCard({
  goal,
  onDelete,
  onEdit,
  onAddTask,
  onToggleTask,
  onDragStart,
  onDragOver,
  onDrop,
  onAISuggestions,
  onEditTask,
  onFocus,
  onOpenDetails, // 👉 NEW: open full-screen modal
}) {
  const daysLeft = getDaysLeft(goal.end_date);

  const CATEGORY_COLORS = {
    Health: "#ef4444",
    Career: "#8b5cf6",
    Finance: "#22c55e",
    Education: "#2563eb",
    "Personal Growth": "#f97316",
    Relationships: "#ec4899",
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

  const totalTasks = (goal.tasks || []).length;
  const completedTasks = (goal.tasks || []).filter((t) => t.completed).length;

  const handleCardClick = () => {
    if (onOpenDetails) onOpenDetails(goal);
  };

  return (
    <div
      className="group relative bg-white dark:bg-slate-800 dark:text-slate-100 rounded-2xl shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-700 cursor-pointer transition-all overflow-hidden"
      style={{
        boxShadow:
          "0 10px 25px -15px rgba(15,23,42,0.35)",
      }}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, goal)}
      onDragOver={(e) => onDragOver && onDragOver(e)}
      onDrop={(e) => onDrop && onDrop(e, goal)}
      onClick={handleCardClick}
    >
      {/* colored top strip */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Tiny drag handle */}
          <div className="pt-1 text-slate-400 dark:text-slate-500 cursor-grab">
            <span className="select-none text-xl leading-none">⋮⋮</span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 truncate">
              {goal.title}
            </h2>

            <div className="flex flex-wrap gap-1.5 mt-1">
              <span
                className="px-2 py-[2px] text-[10px] rounded-full text-white"
                style={{ backgroundColor: categoryColor }}
              >
                {goal.category}
              </span>
              <span
                className={`px-2 py-[2px] text-[10px] rounded-full ${priorityBadge}`}
              >
                {goal.priority} priority
              </span>
              <span
                className={`px-2 py-[2px] text-[10px] rounded-full ${dueBadge}`}
              >
                {Number.isNaN(daysLeft)
                  ? "No deadline"
                  : daysLeft > 0
                  ? `${daysLeft}d left`
                  : daysLeft === 0
                  ? "Due today"
                  : `${Math.abs(daysLeft)}d late`}
              </span>
            </div>
          </div>

          {/* Top-right buttons – stop propagation so card won't open */}
          <div className="flex flex-col gap-1 ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit();
              }}
              className="px-2 py-[3px] rounded-full text-[10px] bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(goal.id);
              }}
              className="px-2 py-[3px] rounded-full text-[10px] bg-red-500 text-white hover:bg-red-600"
            >
              Del
            </button>
          </div>
        </div>

        {/* tiny description preview */}
        {goal.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
            {goal.description}
          </p>
        )}

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-500 dark:text-slate-400">
              Progress
            </span>
            <span className="font-semibold">
              {goal.progress || 0}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${goal.progress || 0}%`,
                backgroundColor: categoryColor,
              }}
            />
          </div>
        </div>

        {/* Footer row: tasks + quick actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {totalTasks === 0 ? (
              <span>No tasks yet</span>
            ) : (
              <span>
                {completedTasks}/{totalTasks} tasks done
              </span>
            )}
          </div>

          <div className="flex gap-1.5 text-[10px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTask && onAddTask();
              }}
              className="px-2 py-[3px] rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              + Task
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAISuggestions && onAISuggestions();
              }}
              className="px-2 py-[3px] rounded-full bg-purple-600 text-white hover:bg-purple-700"
            >
              AI
            </button>

            {onFocus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFocus(goal);
                }}
                className="px-2 py-[3px] rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                🎯
              </button>
            )}
          </div>
        </div>

        {/* subtle hint */}
        <p className="text-[10px] text-slate-400 mt-1">
          Click card to view full details
        </p>
      </div>
    </div>
  );
}

function getDaysLeft(endDateStr) {
  if (!endDateStr) return NaN;
  const today = new Date();
  const end = new Date(endDateStr);
  const diffMs =
    end.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default GoalCard;
