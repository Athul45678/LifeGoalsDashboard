import { useState } from "react";

function AddTaskModal({ isOpen, onClose, onSave, goalId }) {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-6 rounded-xl shadow-lg w-full max-w-md transition-colors">

        <h2 className="text-xl font-bold mb-4">Add New Task</h2>

        <input
          type="text"
          placeholder="Task title"
          className="border p-2 w-full rounded mb-4 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 dark:bg-slate-600 dark:text-slate-100 rounded hover:bg-gray-400 dark:hover:bg-slate-500"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => {
              onSave({
                title,
                completed: false,
                goal: goalId,
              });
              setTitle("");
            }}
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTaskModal;
