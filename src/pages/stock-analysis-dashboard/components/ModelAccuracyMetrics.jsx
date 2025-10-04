import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';

const ModelAccuracyMetrics = ({ selectedStock, isLoading }) => {
  // Mock accuracy metrics data
  const accuracyMetrics = {
    mse: 2.45,
    rmse: 1.56,
    mae: 1.23,
    r2Score: 0.87,
    lastUpdated: '2025-10-04T11:30:00Z'
  };

  // Mock historical performance data
  const historicalPerformance = [
    { period: 'Jan', accuracy: 85, mse: 2.1, rmse: 1.4 },
    { period: 'Feb', accuracy: 88, mse: 1.9, rmse: 1.3 },
    { period: 'Mar', accuracy: 82, mse: 2.8, rmse: 1.7 },
    { period: 'Apr', accuracy: 90, mse: 1.5, rmse: 1.2 },
    { period: 'May', accuracy: 87, mse: 2.0, rmse: 1.4 },
    { period: 'Jun', accuracy: 89, mse: 1.7, rmse: 1.3 },
    { period: 'Jul', accuracy: 91, mse: 1.4, rmse: 1.1 },
    { period: 'Aug', accuracy: 86, mse: 2.2, rmse: 1.5 },
    { period: 'Sep', accuracy: 88, mse: 1.8, rmse: 1.3 },
    { period: 'Oct', accuracy: 89, mse: 1.6, rmse: 1.2 }
  ];

  const getMetricColor = (metric, value) => {
    switch (metric) {
      case 'r2Score':
        if (value >= 0.8) return 'text-success';
        if (value >= 0.6) return 'text-warning';
        return 'text-destructive';
      case 'mse': case'rmse': case'mae':
        if (value <= 1.5) return 'text-success';
        if (value <= 2.5) return 'text-warning';
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'mse': return 'Target';
      case 'rmse': return 'TrendingUp';
      case 'mae': return 'BarChart3';
      case 'r2Score': return 'Award';
      default: return 'Activity';
    }
  };

  const getMetricDescription = (metric) => {
    switch (metric) {
      case 'mse': return 'Mean Squared Error - Lower is better';
      case 'rmse': return 'Root Mean Squared Error - Lower is better';
      case 'mae': return 'Mean Absolute Error - Lower is better';
      case 'r2Score': return 'R² Score - Higher is better (max 1.0)';
      default: return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation">
          <div className="text-sm font-medium text-foreground mb-2">{label}</div>
          {payload?.map((entry, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-text-secondary">{entry?.name}:</span>
              <span className="font-semibold text-foreground ml-2">
                {entry?.name === 'Accuracy' ? `${entry?.value}%` : entry?.value?.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="w-40 h-6 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4]?.map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded">
                <div className="w-20 h-4 bg-background rounded"></div>
                <div className="w-16 h-4 bg-background rounded"></div>
              </div>
            ))}
          </div>
          <div className="w-full h-48 bg-muted rounded mt-6"></div>
        </div>
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Icon name="BarChart3" size={48} className="text-text-secondary mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Model Accuracy Metrics
          </h3>
          <p className="text-text-secondary">
            Select a stock to view prediction model performance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="BarChart3" size={20} className="text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Model Accuracy</h3>
            <p className="text-sm text-text-secondary">
              Performance metrics for {selectedStock?.symbol}
            </p>
          </div>
        </div>
        <div className="text-xs text-text-secondary">
          Updated: {new Date(accuracyMetrics.lastUpdated)?.toLocaleTimeString()}
        </div>
      </div>
      {/* Accuracy Metrics Cards */}
      <div className="space-y-3 mb-6">
        {Object.entries(accuracyMetrics)?.filter(([key]) => key !== 'lastUpdated')?.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name={getMetricIcon(key)} size={16} className="text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {key?.toUpperCase()?.replace('SCORE', ' Score')}
                </div>
                <div className="text-xs text-text-secondary">
                  {getMetricDescription(key)}
                </div>
              </div>
            </div>
            <div className={`text-xl font-bold ${getMetricColor(key, value)}`}>
              {key === 'r2Score' ? value?.toFixed(3) : value?.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      {/* Performance Trend Chart */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={16} className="text-text-secondary" />
          <span className="text-sm font-medium text-foreground">Historical Performance</span>
        </div>
        
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="period" 
                stroke="var(--color-text-secondary)" 
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-text-secondary)" 
                fontSize={12}
                domain={[75, 95]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                name="Accuracy"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Model Information */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="text-xs text-text-secondary">
            <div className="font-medium text-foreground mb-1">Model Information</div>
            <div>Algorithm: LSTM Neural Network with attention mechanism</div>
            <div>Training Data: 5 years of historical price data</div>
            <div>Last Retrained: {new Date()?.toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      {/* Accuracy Interpretation */}
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-2 p-2 bg-success/10 rounded border border-success/20">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-success">High Accuracy (&gt;85%)</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-warning/10 rounded border border-warning/20">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-warning">Medium Accuracy (70-85%)</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-destructive/10 rounded border border-destructive/20">
            <div className="w-2 h-2 bg-destructive rounded-full"></div>
            <span className="text-destructive">Low Accuracy (&lt;70%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelAccuracyMetrics;