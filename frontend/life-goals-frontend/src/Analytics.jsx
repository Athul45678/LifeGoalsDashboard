

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

// Pie chart colors
const PIE_COLORS = ["#3b82f6", "#10b981", "#ef4444", "#facc15"];

// Category → Color Mapping (same as GoalCard)
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

function Analytics({ goals }) {
  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => (g.progress || 0) >= 100).length;

    const avgProgress =
      totalGoals === 0
        ? 0
        : Math.round(
            goals.reduce((sum, g) => sum + (g.progress || 0), 0) / totalGoals
          );

    const allTasks = goals.flatMap((g) => g.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.completed).length;

    return {
      totalGoals,
      completedGoals,
      avgProgress,
      totalTasks,
      completedTasks,
    };
  }, [goals]);

  // Pie chart data
  const taskPieData = [
    { name: "Completed Tasks", value: stats.completedTasks },
    { name: "Remaining Tasks", value: stats.totalTasks - stats.completedTasks },
  ];

  // Bar chart data
  const progressBarData = goals.map((g) => ({
    name: g.title.length > 10 ? g.title.slice(0, 10) + "..." : g.title,
    progress: g.progress || 0,
    categoryColor: CATEGORY_COLORS[g.category] || CATEGORY_COLORS.Other,
  }));

  return (
    <div className="max-w-5xl mx-auto mb-6">
      {/* Stats Top Row */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow transition">
          <p className="text-xs text-gray-500 dark:text-slate-400">Total Goals</p>
          <p className="text-2xl font-bold">{stats.totalGoals}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow transition">
          <p className="text-xs text-gray-500 dark:text-slate-400">Completed Goals</p>
          <p className="text-2xl font-bold">{stats.completedGoals}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow transition">
          <p className="text-xs text-gray-500 dark:text-slate-400">Average Progress</p>
          <p className="text-2xl font-bold">{stats.avgProgress}%</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow h-64 transition">
          <h3 className="font-semibold mb-2 text-sm">Tasks Completion</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={taskPieData} dataKey="value" nameKey="name" outerRadius={70}>
                {taskPieData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tw-prose-invert)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-4 rounded-xl shadow h-64 transition">
          <h3 className="font-semibold mb-2 text-sm">Goal Progress</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressBarData}>

              {/* X-AXIS LABELS */}
              <XAxis
                dataKey="name"
                stroke="currentColor"
                interval={0}      
                angle={-35}       
                textAnchor="end"  
                height={60}       
              />

              <YAxis domain={[0, 100]} stroke="currentColor" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tw-prose-invert)",
                  borderRadius: "8px",
                }}
              />

              <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                {progressBarData.map((entry, index) => (
                  <Cell key={index} fill={entry.categoryColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
