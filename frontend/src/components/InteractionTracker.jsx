import { useEffect, useRef, useState } from "react";

const InteractionTracker = ({ onInteraction }) => {
  const [interactionCount, setInteractionCount] = useState(0);
  const eventsRef = useRef([]);
  const lastMoveTime = useRef(0);

  useEffect(() => {
    const recordEvent = (type, e) => {
      const now = Date.now();
      if (type === "mousemove" && now - lastMoveTime.current < 40) return;
      if (type === "mousemove") lastMoveTime.current = now;

      const event = {
        type,
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
        timestamp: new Date().toISOString(),
        pageURL: window.location.pathname,
        userAgent: navigator.userAgent,
      };

      eventsRef.current.push(event);

      setInteractionCount((prev) => prev + 1);
      if (onInteraction)
        onInteraction({ x: event.x, y: event.y, value: type === "click" ? 1 : 0.3 });
    };

    const handleClick = (e) => recordEvent("click", e);
    const handleMouseMove = (e) => recordEvent("mousemove", e);

    document.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleMouseMove);

    const sendBatch = async () => {
      if (eventsRef.current.length === 0) return;
      const batch = [...eventsRef.current];
      eventsRef.current = [];

      try {
        await fetch("http://localhost:5000/api/log-interaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        });
      } catch (err) {
        console.error("Failed to send interaction batch:", err);
      }
    };

    const intervalId = setInterval(sendBatch, 5000);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleMouseMove);
      clearInterval(intervalId);
    };
  }, [onInteraction]);

  return (
    <div className="fixed top-4 right-4 bg-white text-black px-3 py-1 rounded-full shadow-md text-sm z-50">
      Interactions: {interactionCount}
    </div>
  );
};

export default InteractionTracker;
