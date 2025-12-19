
import { useState, useEffect } from "react";

function EditTaskModal({ isOpen, onClose, task, onSave, onDelete }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    if (title.trim() === "") return;
    onSave({ ...task, title });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-slate-800 text-white p-6 rounded-xl w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>

        <input
          className="w-full p-2 rounded bg-slate-700 border border-slate-600 mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Buttons Section */}
        <div className="flex justify-between items-center">
          
          {/* Delete button LEFT */}
          <button
            onClick={() => onDelete(task)}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Delete
          </button>

          {/* Cancel + Save RIGHT */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
            >
              Save Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;
