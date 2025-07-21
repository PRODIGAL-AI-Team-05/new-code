import { useEffect, useRef, useState } from 'react';

const InteractionTracker = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const eventsRef = useRef([]);
  const lastMoveRef = useRef(0);
  const [sessionId, setSessionId] = useState(() => {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = (window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
      localStorage.setItem('sessionId', sid);
    }
    return sid;
  });

  useEffect(() => {
    const recordEvent = (type, e) => {
      const now = Date.now();
      if (type === 'mousemove' && now - lastMoveRef.current < 200) return;
      lastMoveRef.current = now;
      eventsRef.current.push({
        type,
        x: e.pageX, // store pixel coords (recommended for D3 mapping)
        y: e.pageY,
        timestamp: new Date().toISOString(),
        pageURL: window.location.href,
        userAgent: navigator.userAgent,
        sessionId,
      });
      setInteractionCount((prev) => prev + 1);
    };

    const sendBatch = async () => {
      if (eventsRef.current.length === 0) return;
      try {
        const batch = eventsRef.current.slice();
        eventsRef.current.length = 0;
        await fetch('http://localhost:5000/api/log-interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
        });
      } catch (err) {
        console.error('[Tracker] ❌ Error:', err);
      }
    };

    const handleClick = (e) => recordEvent('click', e);
    const handleMouseMove = (e) => recordEvent('mousemove', e);

    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    const intervalId = setInterval(sendBatch, 5000);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(intervalId);
    };
  }, [sessionId]);

  return (
    <div className="fixed top-4 right-4 bg-white text-black px-3 py-1 rounded-full shadow-md text-sm z-50">
      Interactions: {interactionCount}
    </div>
  );
};

export default InteractionTracker;
