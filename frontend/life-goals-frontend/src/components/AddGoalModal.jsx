
import React, { useState } from "react";

function AddGoalModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("Other");
  const [priority, setPriority] = useState("Medium");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 dark:text-slate-100 w-full max-w-lg rounded-xl shadow-xl p-6 transition-colors">

        <h2 className="text-2xl font-bold mb-4">Add New Goal</h2>

        {/* Title */}
        <label className="block mb-2">Title</label>
        <input
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-slate-700 dark:border-slate-600"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <label className="block mb-2">Description</label>
        <textarea
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-slate-700 dark:border-slate-600"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* Dates */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-2">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded mb-4 bg-white dark:bg-slate-700 dark:border-slate-600"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="block mb-2">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded mb-4 bg-white dark:bg-slate-700 dark:border-slate-600"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Category */}
        <label className="block mb-1 font-medium">Category</label>
        <select
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-slate-700 dark:border-slate-600"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Health</option>
          <option>Career</option>
          <option>Finance</option>
          <option>Education</option>
          <option>Personal Growth</option>
          <option>Relationships</option>
          <option>Other</option>
        </select>

        {/* Priority */}
        <label className="block mb-1 font-medium">Priority</label>
        <select
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-slate-700 dark:border-slate-600"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-4 py-2 bg-gray-400 dark:bg-slate-600 rounded text-white"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            onClick={() =>
              onSave({
                title,
                description,
                start_date: startDate,
                end_date: endDate,
                category,
                priority,
              })
            }
          >
            Save Goal
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddGoalModal;
