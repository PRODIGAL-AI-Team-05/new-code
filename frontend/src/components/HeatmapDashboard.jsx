import React, { useState, useRef } from 'react';
import HeatmapVisualizationD3 from './HeatmapVisualizationD3'; // Updated import
import InteractionTracker from './InteractionTracker';
import { MousePointerClick, Move, Activity, BarChart3, RefreshCw } from 'lucide-react';

const HeatmapDashboard = () => {
  const [activeTab, setActiveTab] = useState('clicks');
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalMouseMoves: 0,
    totalInteractions: 0,
    lastUpdated: null
  });

  const clickHeatmapRef = useRef(null);
  const mouseHeatmapRef = useRef(null);  
  const densityHeatmapRef = useRef(null);

  // Fetch statistics from the API (same as original)
  const fetchStats = async () => {
    try {
      const totalClicksResponse = await fetch('http://localhost:5000/api/get-interactions?type=click&limit=10000');
      const totalClicksData = await totalClicksResponse.json();
      
      const totalMovesResponse = await fetch('http://localhost:5000/api/get-interactions?type=mousemove&limit=10000');
      const totalMovesData = await totalMovesResponse.json();

      setStats({
        totalClicks: totalClicksData.count || 0,
        totalMouseMoves: totalMovesData.count || 0,
        totalInteractions: (totalClicksData.count || 0) + (totalMovesData.count || 0),
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  React.useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const refreshAllHeatmaps = () => {
    fetchStats();
    
    switch (activeTab) {
      case 'clicks':
        if (clickHeatmapRef.current?.isReady?.()) {
          clickHeatmapRef.current.loadData('click');
        }
        break;
      case 'movements':
        if (mouseHeatmapRef.current?.isReady?.()) {
          mouseHeatmapRef.current.loadData('mousemove');
        }
        break;
      case 'density':
        if (densityHeatmapRef.current?.isReady?.()) {
          densityHeatmapRef.current.loadData('density');
        }
        break;
    }
  };

  const tabs = [
    {
      id: 'clicks',
      name: 'Click Heatmap',
      icon: MousePointerClick,
      description: 'Visualize where users click most frequently'
    },
    {
      id: 'movements', 
      name: 'Mouse Trails',
      icon: Move,
      description: 'Track mouse movement patterns and trails'
    },
    {
      id: 'density',
      name: 'Interaction Density',
      icon: Activity,
      description: 'Combined density visualization of all interactions'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <InteractionTracker />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="text-blue-600" />
                D3.js Heatmap Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Visualize user interactions with D3.js powered click maps, mouse trails, and density overlays
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshAllHeatmaps}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={20} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel (same as original) */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointerClick className="text-red-400" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mouse Movements</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalMouseMoves.toLocaleString()}</p>
              </div>
              <Move className="text-purple-400" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalInteractions.toLocaleString()}</p>
              </div>
              <Activity className="text-green-400" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-lg font-semibold text-gray-800">{stats.lastUpdated || 'Never'}</p>
              </div>
              <RefreshCw className="text-gray-400" size={24} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 px-6 py-4 text-center border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-transparent hover:border-gray-300 hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Icon size={20} />
                      <span className="font-medium">{tab.name}</span>
                    </div>
                    <p className="text-xs opacity-75">{tab.description}</p>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Heatmap Content with D3.js Components */}
          <div className="p-8">
            {activeTab === 'clicks' && (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">D3.js Click Interaction Heatmap</h3>
                <p className="text-gray-600 mb-6">
                  Density contours and red points show click activity using D3.js contour density estimation.
                </p>
                <HeatmapVisualizationD3
                  ref={clickHeatmapRef}
                  width={800}
                  height={600}
                  heatmapType="click"
                />
              </div>
            )}

            {activeTab === 'movements' && (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">D3.js Mouse Movement Trails</h3>
                <p className="text-gray-600 mb-6">
                  Connected paths and density overlays show mouse movement patterns using D3.js line generators.
                </p>
                <HeatmapVisualizationD3
                  ref={mouseHeatmapRef}
                  width={800}
                  height={600}
                  heatmapType="mousemove"
                />
              </div>
            )}

            {activeTab === 'density' && (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">D3.js Interaction Density Map</h3>
                <p className="text-gray-600 mb-6">
                  Combined density visualization using D3.js contour density with custom color scale.
                </p>
                <HeatmapVisualizationD3
                  ref={densityHeatmapRef}
                  width={800}
                  height={600}
                  heatmapType="density"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapDashboard;