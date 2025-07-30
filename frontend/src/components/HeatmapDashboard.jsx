import React, { useEffect, useState } from "react";
import HeatmapDashboardHeader from "./HeatmapDashboardHeader";
import { HeatMapGrid } from "react-heatmap-grid";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 800;
const X_BINS = 48;
const Y_BINS = 32;

function binPointsToGrid(data, xBins = X_BINS, yBins = Y_BINS) {
  const grid = Array.from({ length: yBins }, () => Array(xBins).fill(0));
  data.forEach(({ x, y }) => {
    if (
      typeof x === "number" &&
      typeof y === "number" &&
      x >= 0 && x <= IMAGE_WIDTH &&
      y >= 0 && y <= IMAGE_HEIGHT
    ) {
      const xi = Math.floor((x / IMAGE_WIDTH) * (xBins - 1));
      const yi = Math.floor((y / IMAGE_HEIGHT) * (yBins - 1));
      grid[yi][xi] += 1;
    }
  });
  return grid;
}

const HeatmapDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heatmapData, setHeatmapData] = useState(
    Array.from({ length: Y_BINS }, () => Array(X_BINS).fill(0))
  );
  const [analytics, setAnalytics] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        const resClicks = await fetch(
          "http://localhost:5000/api/get-interactions?type=click&limit=10000"
        );
        const resMoves = await fetch(
          "http://localhost:5000/api/get-interactions?type=mousemove&limit=10000"
        );
        const jsonClicks = await resClicks.json();
        const jsonMoves = await resMoves.json();

        if (
          jsonClicks.status === "success" &&
          jsonMoves.status === "success" &&
          Array.isArray(jsonClicks.data) &&
          Array.isArray(jsonMoves.data)
        ) {
          // Combine click data for heatmap (or customize as needed)
          setHeatmapData(binPointsToGrid(jsonClicks.data));

          // Analytics summary
          setAnalytics({
            totalClicks: jsonClicks.data.length,
            mouseMoves: jsonMoves.data.length,
            totalInteractions: jsonClicks.data.length + jsonMoves.data.length,
          });

          setLastUpdated(Date.now());
        } else {
          throw new Error("Failed to fetch interaction data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  return (
    <>
      {/* Heatmap Dashboard Header */}
      <HeatmapDashboardHeader analytics={analytics} lastUpdated={lastUpdated} />

      {/* Main heatmap section */}
      <div style={{ width: IMAGE_WIDTH, margin: "auto" }}>
        <h2 className="text-2xl font-bold mb-4 text-white text-center">
          User Click Heatmap
        </h2>
        {loading && (
          <p className="text-white text-center">Loading heatmap data...</p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div
          style={{
            position: "relative",
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            borderRadius: 10,
            border: "1px solid #ccc",
            margin: "0 auto",
            backgroundColor: "#121212",
            overflow: "hidden",
          }}
        >
          <img
            src="/image.jpg"
            alt="Website Screenshot"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
              zIndex: 1,
              objectFit: "cover",
              borderRadius: 10,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <HeatMapGrid
              data={heatmapData}
              xLabels={Array.from({ length: X_BINS }).map(() => "")}
              yLabels={Array.from({ length: Y_BINS }).map(() => "")}
              cellStyle={(_x, _y, value) => ({
                background: value
                  ? `rgba(255,0,0,${Math.min(0.7, value / 20)})`
                  : "rgba(0,0,0,0)",
                border: "none",
              })}
              cellHeight="auto"
              square
              xLabelsStyle={() => ({ color: "transparent" })}
              yLabelsStyle={() => ({ color: "transparent" })}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeatmapDashboard;
