import React from "react";

const HeatmapDashboardHeader = ({ analytics = {}, lastUpdated }) => (
  <div className="w-full max-w-5xl mx-auto mt-4 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatBox value={analytics.totalClicks ?? 0} label="Total Clicks" color="text-pink-400" />
      <StatBox value={analytics.mouseMoves ?? 0} label="Mouse Movements" color="text-yellow-400" />
      <StatBox value={analytics.totalInteractions ?? 0} label="Total Interactions" color="text-green-400" />
    </div>
    <div className="text-gray-400 mt-4 text-xs text-center">
      Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "--"}
    </div>
  </div>
);

function StatBox({ value, label, color }) {
  return (
    <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center shadow-md">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="mt-2 text-gray-200 font-semibold">{label}</div>
    </div>
  );
}

export default HeatmapDashboardHeader;
