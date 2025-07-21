import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import * as d3 from 'd3';

const colorRamp = d3.interpolateTurbo; // much brighter

const HeatmapVisualizationD3 = forwardRef(({
  width = 800,
  height = 600,
  heatmapType = 'click'
}, ref) => {
  const svgRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bandwidth, setBandwidth] = useState(40);
  const [legendTicks, setLegendTicks] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  // Load data from API and update heatmap
  const loadHeatmapData = useCallback(async (type = heatmapType) => {
    setIsLoading(true);
    setError(null);

    try {
      let apiUrl;
      if (type === 'density') {
        apiUrl = `http://localhost:5000/api/get-interactions?type=click&limit=5000`;
      } else {
        apiUrl = `http://localhost:5000/api/get-interactions?type=${type}&limit=2000`;
      }

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.status === 'success' && result.data.length > 0) {
        renderHeatmap(result.data, type);
        console.log(`🔥 Loaded ${result.data.length} ${type} interactions`);
      } else {
        throw new Error(result.message || 'No data available');
      }
    } catch (err) {
      setError('Failed to load heatmap data: ' + err.message);
      console.error('Heatmap data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [heatmapType, width, height, bandwidth]);

  // Main D3.js heatmap rendering function
  const renderHeatmap = useCallback((data, type) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const margin = { top: 16, right: 16, bottom: 32, left: 16 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Filter valid coordinates
    const validData = data.filter(d =>
      d.x > 0 && d.x < width &&
      d.y > 0 && d.y < height &&
      typeof d.x === 'number' && typeof d.y === 'number'
    );

    if (validData.length === 0) {
      setError('No valid coordinate data found');
      return;
    }

    svg
      .attr('viewBox', [0, 0, width, height])
      .style('width', width)
      .style('height', height)
      .style('background', '#f7fafc')
      .style('border-radius', '8px');

    // Build contour density and color
    const contours = d3.contourDensity()
      .x(d => d.x)
      .y(d => d.y)
      .size([innerWidth, innerHeight])
      .bandwidth(bandwidth)
      .thresholds(17)(validData);

    const vmin = d3.min(contours, d => d.value);
    const vmax = d3.max(contours, d => d.value);
    setLegendTicks([vmin, (vmin+vmax)/2, vmax]); // for legend

    const colorScale = d3.scaleSequential(colorRamp).domain([vmax, vmin]);

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .selectAll('path')
      .data(contours)
      .join('path')
      .attr('d', d3.geoPath())
      .attr('fill', d => colorScale(d.value))
      .attr('opacity', 0.78);

    // Draw points ("recent" ones most visible)
    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .selectAll('circle')
      .data(validData.slice(-400))
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 2.7)
      .attr('fill', '#1e3a8a')
      .attr('opacity', 0.33);

    // Tooltip logic
    svg.on('mousemove', (event) => {
      const [mx, my] = d3.pointer(event, svg.node());
      // Only show tooltip inside plot
      if (mx < margin.left || mx > width-margin.right ||
          my < margin.top  || my > height-margin.bottom) {
        setTooltip(null); return;
      }
      // Find closest data point
      let nearest, dist = 12;
      for (const pt of validData) {
        const dx = pt.x+margin.left-mx, dy = pt.y+margin.top-my;
        const d = Math.hypot(dx, dy);
        if (d < dist) { nearest = pt; dist = d; }
      }
      setTooltip(nearest ? {
        x: mx+12, y: my,
        label: `x: ${Math.round(nearest.x)}, y: ${Math.round(nearest.y)}`
      } : null);
    }).on('mouseleave', () => setTooltip(null));
  }, [width, height, bandwidth, colorRamp]);

  // Clear heatmap function
  const clearHeatmap = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    setTooltip(null);
  }, []);

  // Expose methods via ref (same interface as original)
  useImperativeHandle(ref, () => ({
    loadData: loadHeatmapData,
    clearData: clearHeatmap,
    isReady: () => true
  }), [loadHeatmapData, clearHeatmap]);

  // Auto-load data when component mounts or bandwidth changes
  useEffect(() => {
    loadHeatmapData(heatmapType);
  }, [heatmapType, loadHeatmapData, bandwidth]);

  // Legend (SVG gradient)
  const legendW = 184, legendH = 16;
  function Legend() {
    return (
      <svg width={legendW} height={legendH+22}>
        {/* Gradient definition */}
        <defs>
          <linearGradient id="legendGradient">
            <stop offset="0%" stopColor={colorRamp(1)} />
            <stop offset="50%" stopColor={colorRamp(0.5)} />
            <stop offset="100%" stopColor={colorRamp(0)} />
          </linearGradient>
        </defs>
        {/* Gradient bar */}
        <rect x={0} y={0} width={legendW} height={legendH} rx={4} fill="url(#legendGradient)" />
        {/* Ticks */}
        <g>
          {legendTicks.map((t, i) => (
            <text
              key={i}
              x={i * (legendW-1)/(legendTicks.length-1)}
              y={legendH+12}
              textAnchor="middle"
              fontSize={11}
              fill="#222"
            >{t.toFixed(2)}</text>
          ))}
        </g>
      </svg>
    )
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="flex gap-3 items-center mb-2 self-end">
        <label htmlFor="bandwidth" className="text-xs text-gray-700">Smoothing</label>
        <input
          id="bandwidth"
          type="range"
          min={12}
          max={80}
          value={bandwidth}
          onChange={e => setBandwidth(+e.target.value)}
        />
        <span className="text-xs font-mono text-blue-800">{bandwidth}</span>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          border: '2px solid #333',
          borderRadius: '8px',
          background: '#f8f9fa'
        }}
      />
      <div className="mt-1">{legendTicks.length === 3 && <Legend />}</div>
      {/* Tooltip */}
      {!!tooltip && (
        <div style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: tooltip.x, top: tooltip.y,
          background: '#fffedd',
          fontWeight: 600,
          color: '#84291a',
          padding: '3px 8px',
          border: '1.5px solid #ea580c',
          borderRadius: 7,
          fontSize: 13,
          boxShadow: '0 2px 9px rgba(0,0,0,0.15)'
        }}>{tooltip.label}</div>
      )}
      {/* Loading/Error States */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid #007bff',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          Loading {heatmapType} heatmap data...
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          background: 'rgba(255, 240, 240, 0.95)',
          border: '2px solid #dc3545',
          borderRadius: '8px',
          color: '#721c24',
          textAlign: 'center',
        }}>
          <p>❌ {error}</p>
          <button onClick={() => loadHeatmapData()}>Retry</button>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: 10 }}>
        <button
          onClick={() => loadHeatmapData()}
          disabled={isLoading}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            background: isLoading ? '#6c757d' : '#007bff',
            color: 'white'
          }}
        >
          🔄 Refresh Data
        </button>
        <button
          onClick={clearHeatmap}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            background: '#6c757d',
            color: 'white'
          }}
        >
          🧹 Clear
        </button>
      </div>
    </div>
  );
});

HeatmapVisualizationD3.displayName = 'HeatmapVisualizationD3';

export default HeatmapVisualizationD3;
