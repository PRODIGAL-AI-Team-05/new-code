import React, { useState, useEffect } from "react";
import InteractionTracker from "./components/InteractionTracker";
import LiveHeatmapOverlay from "./components/LiveHeatmapOverlay";
import HeatmapDashboardHeader from "./components/HeatmapDashboardHeader";
import AIInsightsText from "./components/AIInsightsText";

function App() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [heatPoints, setHeatPoints] = useState([]);

  useEffect(() => {
    const currPage = window.location.pathname;

    async function fetchStoredInteractions() {
      try {
        const [clickRes, moveRes] = await Promise.all([
          fetch(
            `http://localhost:5000/api/get-interactions?type=click&limit=10000&page=${encodeURIComponent(
              currPage
            )}`
          ),
          fetch(
            `http://localhost:5000/api/get-interactions?type=mousemove&limit=10000&page=${encodeURIComponent(
              currPage
            )}`
          ),
        ]);
        const clickJson = await clickRes.json();
        const moveJson = await moveRes.json();

        const clicks =
          clickJson.status === "success" && Array.isArray(clickJson.data)
            ? clickJson.data.map((d) => ({ x: d.x, y: d.y, value: 1 }))
            : [];

        const moves =
          moveJson.status === "success" && Array.isArray(moveJson.data)
            ? moveJson.data.map((d) => ({ x: d.x, y: d.y, value: 0.3 }))
            : [];

        setHeatPoints([...clicks, ...moves]);
      } catch (err) {
        console.error("Error fetching interactions:", err);
      }
    }

    fetchStoredInteractions();
  }, []);

  const handleInteraction = (point) => {
    setHeatPoints((points) => [...points, point]);
  };

  const totalClicks = heatPoints.filter((p) => p.value === 1).length;
  const mouseMoves = heatPoints.filter((p) => p.value < 1).length;
  const totalInteractions = heatPoints.length;

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center px-6 py-12">
      <HeatmapDashboardHeader
        analytics={{
          totalClicks,
          mouseMoves,
          totalInteractions,
        }}
        lastUpdated={Date.now()}
      />

      <InteractionTracker onInteraction={handleInteraction} />

      <button
        onClick={() => setShowOverlay((v) => !v)}
        className="mt-8 mb-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-black rounded-lg font-bold shadow-lg"
        style={{ zIndex: 11000 }}
      >
        {showOverlay ? "Hide Heatmap Overlay" : "Show Heatmap Overlay"}
      </button>

      {showOverlay && <LiveHeatmapOverlay points={heatPoints} />}

      <div className="text-center mb-12 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-pulse tracking-tight">
          🔥 Heatmap Analytics Tool
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Track user clicks <b>and mouse movements</b> live — this heatmap overlays your real website.
        </p>
      </div>

      <AIInsightsText />
    </div>
  );
}

export default App;
