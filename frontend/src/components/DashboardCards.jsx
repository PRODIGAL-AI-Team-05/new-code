import React from "react";

const DashboardCards = ({ analytics, lastUpdated }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 24,
    marginBottom: 24,
    marginTop: 12,
  }}>
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-red-500">{analytics.totalClicks ?? '--'}</div>
      <div className="text-gray-200 mt-2">Total Clicks</div>
    </div>
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-purple-400">{analytics.mouseMoves ?? '--'}</div>
      <div className="text-gray-200 mt-2">Mouse Movements</div>
    </div>
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-green-400">{analytics.totalInteractions ?? '--'}</div>
      <div className="text-gray-200 mt-2">Total Interactions</div>
    </div>
    <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-blue-400">{lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--'}</div>
      <div className="text-gray-200 mt-2">Last Updated</div>
    </div>
  </div>
);

export default DashboardCards;
