import React, { useEffect, useRef } from "react";
import simpleheat from "../lib/simpleheat.js"; // Add simpleheat.js in this path

const LiveHeatmapOverlay = ({ points }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas on page load and window resize
    const resize = () => {
      canvas.width = document.documentElement.scrollWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const heat = simpleheat(canvas);

    const formatted = (points || []).map((p) => [p.x, p.y, p.value || 1]);

    heat.data(formatted);
    heat.max(30);
    heat.radius(40, 20);
    heat.draw(0.01);

    return () => window.removeEventListener("resize", resize);
  }, [points]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
};

export default LiveHeatmapOverlay;
