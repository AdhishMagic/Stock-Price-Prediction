import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';

const MarketVisualization = () => {
  const [activeChart, setActiveChart] = useState('market-trends');
  const [visibleSeries, setVisibleSeries] = useState({
    marketIndex: true,
    techSector: true,
    healthSector: true,
    financeSector: true,
    confidence: true
  });

  const marketData = [
    {
      date: '2024-09-01',
      marketIndex: 4200,
      techSector: 3800,
      healthSector: 2900,
      financeSector: 3200,
      confidence: 85,
      volume: 2400000
    },
    {
      date: '2024-09-08',
      marketIndex: 4350,
      techSector: 3950,
      healthSector: 2950,
      financeSector: 3180,
      confidence: 87,
      volume: 2800000
    },
    {
      date: '2024-09-15',
      marketIndex: 4280,
      techSector: 3820,
      healthSector: 3020,
      financeSector: 3250,
      confidence: 82,
      volume: 3200000
    },
    {
      date: '2024-09-22',
      marketIndex: 4420,
      techSector: 4100,
      healthSector: 3080,
      financeSector: 3300,
      confidence: 89,
      volume: 2900000
    },
    {
      date: '2024-09-29',
      marketIndex: 4380,
      techSector: 4050,
      healthSector: 3150,
      financeSector: 3280,
      confidence: 86,
      volume: 3100000
    },
    {
      date: '2024-10-04',
      marketIndex: 4450,
      techSector: 4180,
      healthSector: 3200,
      financeSector: 3350,
      confidence: 88,
      volume: 3300000
    }
  ];

  const chartTypes = [
    {
      id: 'market-trends',
      name: 'Market Trends',
      icon: 'TrendingUp'
    },
    {
      id: 'sector-comparison',
      name: 'Sector Comparison',
      icon: 'BarChart3'
    },
    {
      id: 'confidence-analysis',
      name: 'Confidence Analysis',
      icon: 'Target'
    }
  ];

  const toggleSeries = (seriesKey) => {
    setVisibleSeries(prev => ({
      ...prev,
      [seriesKey]: !prev?.[seriesKey]
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation">
          <p className="text-sm font-medium text-foreground mb-2">
            {new Date(label)?.toLocaleDateString()}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-text-secondary">{entry?.name}:</span>
              <span className="font-medium text-foreground">
                {typeof entry?.value === 'number' 
                  ? entry?.value?.toLocaleString() 
                  : entry?.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'market-trends':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#8B949E"
                fontSize={12}
                tickFormatter={(value) => new Date(value)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#8B949E" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {visibleSeries?.marketIndex && (
                <Line
                  type="monotone"
                  dataKey="marketIndex"
                  stroke="#0066CC"
                  strokeWidth={2}
                  name="Market Index"
                  dot={{ fill: '#0066CC', strokeWidth: 2, r: 4 }}
                />
              )}
              {visibleSeries?.techSector && (
                <Line
                  type="monotone"
                  dataKey="techSector"
                  stroke="#00D4AA"
                  strokeWidth={2}
                  name="Technology"
                  dot={{ fill: '#00D4AA', strokeWidth: 2, r: 4 }}
                />
              )}
              {visibleSeries?.healthSector && (
                <Line
                  type="monotone"
                  dataKey="healthSector"
                  stroke="#4A90E2"
                  strokeWidth={2}
                  name="Healthcare"
                  dot={{ fill: '#4A90E2', strokeWidth: 2, r: 4 }}
                />
              )}
              {visibleSeries?.financeSector && (
                <Line
                  type="monotone"
                  dataKey="financeSector"
                  stroke="#FFC107"
                  strokeWidth={2}
                  name="Finance"
                  dot={{ fill: '#FFC107', strokeWidth: 2, r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'sector-comparison':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#8B949E"
                fontSize={12}
                tickFormatter={(value) => new Date(value)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#8B949E" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {visibleSeries?.techSector && (
                <Bar dataKey="techSector" fill="#00D4AA" name="Technology" />
              )}
              {visibleSeries?.healthSector && (
                <Bar dataKey="healthSector" fill="#4A90E2" name="Healthcare" />
              )}
              {visibleSeries?.financeSector && (
                <Bar dataKey="financeSector" fill="#FFC107" name="Finance" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'confidence-analysis':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#8B949E"
                fontSize={12}
                tickFormatter={(value) => new Date(value)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#8B949E" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {visibleSeries?.confidence && (
                <Area
                  type="monotone"
                  dataKey="confidence"
                  stroke="#28A745"
                  fill="rgba(40, 167, 69, 0.2)"
                  strokeWidth={2}
                  name="Prediction Confidence %"
                />
              )}
              {visibleSeries?.marketIndex && (
                <Line
                  type="monotone"
                  dataKey="marketIndex"
                  stroke="#0066CC"
                  strokeWidth={2}
                  name="Market Index"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Chart Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Market Analysis</h3>
          <div className="flex items-center space-x-2">
            {chartTypes?.map((type) => (
              <button
                key={type?.id}
                onClick={() => setActiveChart(type?.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  activeChart === type?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-text-secondary hover:text-foreground'
                }`}
              >
                <Icon name={type?.icon} size={16} />
                <span className="hidden sm:inline">{type?.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(visibleSeries)?.map(([key, visible]) => (
            <button
              key={key}
              onClick={() => toggleSeries(key)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-medium transition-smooth ${
                visible
                  ? 'bg-primary/10 text-primary border border-primary/20' :'bg-muted text-text-secondary hover:text-foreground'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  key === 'marketIndex' ? 'bg-blue-500' :
                  key === 'techSector' ? 'bg-teal-500' :
                  key === 'healthSector' ? 'bg-blue-400' :
                  key === 'financeSector'? 'bg-yellow-500' : 'bg-green-500'
                }`}
              />
              <span>
                {key === 'marketIndex' ? 'Market' :
                 key === 'techSector' ? 'Tech' :
                 key === 'healthSector' ? 'Health' :
                 key === 'financeSector'? 'Finance' : 'Confidence'}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Chart Container */}
      <div className="h-96 w-full">
        {renderChart()}
      </div>
      {/* Chart Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
        <span>Last updated: {new Date()?.toLocaleString()}</span>
        <div className="flex items-center space-x-4">
          <span>Data points: {marketData?.length}</span>
          <span>Refresh rate: 15min</span>
        </div>
      </div>
    </div>
  );
};

export default MarketVisualization;