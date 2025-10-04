import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCards = ({ stockData, predictionData, isLoading }) => {
  const metrics = [
    {
      id: 'current-price',
      title: 'Current Price',
      value: stockData?.currentPrice || '$0.00',
      change: stockData?.dailyChange || 0,
      changePercent: stockData?.dailyChangePercent || 0,
      icon: 'DollarSign',
      color: stockData?.dailyChange >= 0 ? 'text-success' : 'text-destructive'
    },
    {
      id: 'daily-change',
      title: 'Daily Change',
      value: `${stockData?.dailyChange >= 0 ? '+' : ''}${stockData?.dailyChange || 0}`,
      change: stockData?.dailyChangePercent || 0,
      changePercent: null,
      icon: stockData?.dailyChange >= 0 ? 'TrendingUp' : 'TrendingDown',
      color: stockData?.dailyChange >= 0 ? 'text-success' : 'text-destructive'
    },
    {
      id: 'prediction-confidence',
      title: 'Prediction Confidence',
      value: `${predictionData?.confidence || 0}%`,
      change: predictionData?.confidenceChange || 0,
      changePercent: null,
      icon: 'Target',
      color: predictionData?.confidence >= 80 ? 'text-success' : 
             predictionData?.confidence >= 60 ? 'text-warning' : 'text-destructive'
    },
    {
      id: 'volatility-index',
      title: 'Volatility Index',
      value: stockData?.volatility || '0.00',
      change: stockData?.volatilityChange || 0,
      changePercent: null,
      icon: 'Activity',
      color: stockData?.volatility <= 0.2 ? 'text-success' : 
             stockData?.volatility <= 0.4 ? 'text-warning' : 'text-destructive'
    }
  ];

  const getChangeIcon = (change) => {
    if (change > 0) return 'ArrowUp';
    if (change < 0) return 'ArrowDown';
    return 'Minus';
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-text-secondary';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4]?.map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-muted rounded-lg"></div>
                <div className="w-4 h-4 bg-muted rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-4 bg-muted rounded"></div>
                <div className="w-16 h-6 bg-muted rounded"></div>
                <div className="w-12 h-3 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics?.map((metric) => (
        <div
          key={metric?.id}
          className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation transition-smooth"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
              <Icon name={metric?.icon} size={20} className="text-primary" />
            </div>
            <div className="flex items-center space-x-1">
              {metric?.change !== 0 && (
                <>
                  <Icon 
                    name={getChangeIcon(metric?.change)} 
                    size={12} 
                    className={getChangeColor(metric?.change)} 
                  />
                  <span className={`text-xs font-medium ${getChangeColor(metric?.change)}`}>
                    {Math.abs(metric?.change)?.toFixed(2)}
                    {metric?.changePercent !== null && '%'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-text-secondary font-medium">
              {metric?.title}
            </div>
            <div className={`text-2xl font-bold ${metric?.color}`}>
              {metric?.value}
            </div>
            {metric?.changePercent !== null && (
              <div className={`text-xs ${getChangeColor(metric?.changePercent)}`}>
                {metric?.changePercent >= 0 ? '+' : ''}{metric?.changePercent?.toFixed(2)}% today
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;