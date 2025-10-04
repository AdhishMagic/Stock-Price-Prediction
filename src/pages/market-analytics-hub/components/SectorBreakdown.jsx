import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SectorBreakdown = () => {
  const [selectedSector, setSelectedSector] = useState(null);

  const sectorData = [
    {
      id: 'technology',
      name: 'Technology',
      performance: 15.7,
      trend: 'up',
      marketCap: '12.4T',
      companies: 847,
      volatility: 'Medium',
      prediction: 'Bullish',
      confidence: 89,
      color: 'bg-emerald-500'
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      performance: 8.3,
      trend: 'up',
      marketCap: '8.9T',
      companies: 623,
      volatility: 'Low',
      prediction: 'Bullish',
      confidence: 82,
      color: 'bg-blue-500'
    },
    {
      id: 'finance',
      name: 'Finance',
      performance: 6.1,
      trend: 'up',
      marketCap: '9.2T',
      companies: 1024,
      volatility: 'Medium',
      prediction: 'Neutral',
      confidence: 75,
      color: 'bg-yellow-500'
    },
    {
      id: 'energy',
      name: 'Energy',
      performance: -2.4,
      trend: 'down',
      marketCap: '4.1T',
      companies: 312,
      volatility: 'High',
      prediction: 'Bearish',
      confidence: 71,
      color: 'bg-red-500'
    },
    {
      id: 'consumer',
      name: 'Consumer Goods',
      performance: 4.8,
      trend: 'up',
      marketCap: '6.7T',
      companies: 756,
      volatility: 'Low',
      prediction: 'Bullish',
      confidence: 78,
      color: 'bg-purple-500'
    },
    {
      id: 'industrial',
      name: 'Industrial',
      performance: 3.2,
      trend: 'up',
      marketCap: '5.3T',
      companies: 892,
      volatility: 'Medium',
      prediction: 'Neutral',
      confidence: 73,
      color: 'bg-orange-500'
    }
  ];

  const getPerformanceColor = (performance) => {
    if (performance > 10) return 'text-emerald-500';
    if (performance > 5) return 'text-green-500';
    if (performance > 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPredictionColor = (prediction) => {
    switch (prediction) {
      case 'Bullish': return 'text-green-500 bg-green-500/10';
      case 'Bearish': return 'text-red-500 bg-red-500/10';
      default: return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Sector Breakdown</h3>
        <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-smooth">
          <span>View All</span>
          <Icon name="ArrowRight" size={16} />
        </button>
      </div>
      {/* Sector Heatmap */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {sectorData?.map((sector) => (
          <div
            key={sector?.id}
            onClick={() => setSelectedSector(selectedSector === sector?.id ? null : sector?.id)}
            className={`relative p-4 rounded-lg border cursor-pointer transition-smooth ${
              selectedSector === sector?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${sector?.color}`} />
                <span className="text-sm font-medium text-foreground">
                  {sector?.name}
                </span>
              </div>
              <Icon
                name={sector?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'}
                size={14}
                className={sector?.trend === 'up' ? 'text-success' : 'text-destructive'}
              />
            </div>

            <div className="space-y-1">
              <div className={`text-lg font-bold ${getPerformanceColor(sector?.performance)}`}>
                {sector?.performance > 0 ? '+' : ''}{sector?.performance}%
              </div>
              
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{sector?.companies} companies</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPredictionColor(sector?.prediction)}`}>
                  {sector?.prediction}
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                <span>Confidence</span>
                <span>{sector?.confidence}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all duration-300"
                  style={{ width: `${sector?.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Sector Details */}
      {selectedSector && (
        <div className="border-t border-border pt-4">
          {(() => {
            const sector = sectorData?.find(s => s?.id === selectedSector);
            return (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${sector?.color}`} />
                  <h4 className="font-semibold text-foreground">{sector?.name} Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Market Cap:</span>
                    <div className="font-medium text-foreground">${sector?.marketCap}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Volatility:</span>
                    <div className="font-medium text-foreground">{sector?.volatility}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Companies:</span>
                    <div className="font-medium text-foreground">{sector?.companies?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Prediction:</span>
                    <div className={`font-medium ${getPredictionColor(sector?.prediction)?.split(' ')?.[0]}`}>
                      {sector?.prediction}
                    </div>
                  </div>
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth">
                  Analyze {sector?.name} Sector
                </button>
              </div>
            );
          })()}
        </div>
      )}
      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-muted text-text-secondary rounded-lg hover:text-foreground transition-smooth">
            <Icon name="Download" size={16} />
            <span className="text-sm">Export Data</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-muted text-text-secondary rounded-lg hover:text-foreground transition-smooth">
            <Icon name="RefreshCw" size={16} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectorBreakdown;