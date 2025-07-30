import React, { useEffect, useState } from "react";

function AIInsightsText() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/ai-insights-text?type=click");
        const data = await res.json();
        setInsights(data.insights || "No insights available.");
      } catch {
        setInsights("Failed to fetch AI insights.");
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  return (
    <div className="bg-black bg-opacity-20 rounded-xl p-5 mt-8 max-w-2xl mx-auto text-white">
      <h2 className="text-2xl font-bold text-green-400 mb-2">AI Insights Summary</h2>
      {loading ? <p>Loading insights...</p> : <p>{insights}</p>}
    </div>
  );
}

export default AIInsightsText;
