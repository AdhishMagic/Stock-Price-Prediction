import React from 'react';
import Icon from '../../../components/AppIcon';

const MarketMetricsStrip = () => {
  const marketMetrics = [
    {
      id: 1,
      title: "Overall Accuracy",
      value: "87.3%",
      change: "+2.1%",
      trend: "up",
      icon: "Target",
      description: "Model prediction accuracy across all sectors"
    },
    {
      id: 2,
      title: "Top Sector",
      value: "Technology",
      change: "+15.7%",
      trend: "up",
      icon: "TrendingUp",
      description: "Best performing sector this quarter"
    },
    {
      id: 3,
      title: "Volatility Index",
      value: "24.8",
      change: "-3.2",
      trend: "down",
      icon: "Activity",
      description: "Market volatility indicator"
    },
    {
      id: 4,
      title: "Trend Strength",
      value: "Strong",
      change: "+0.8",
      trend: "up",
      icon: "BarChart3",
      description: "Overall market trend strength"
    },
    {
      id: 5,
      title: "Active Models",
      value: "12",
      change: "+2",
      trend: "up",
      icon: "Brain",
      description: "Currently running prediction models"
    },
    {
      id: 6,
      title: "Data Quality",
      value: "98.5%",
      change: "+0.3%",
      trend: "up",
      icon: "Database",
      description: "Real-time data completeness score"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {marketMetrics?.map((metric) => (
        <div
          key={metric?.id}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-elevation transition-smooth"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={metric?.icon} size={16} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-text-secondary">
                {metric?.title}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {metric?.value}
            </div>
            
            <div className="flex items-center space-x-1">
              <Icon
                name={metric?.trend === 'up' ? 'ArrowUp' : 'ArrowDown'}
                size={12}
                className={metric?.trend === 'up' ? 'text-success' : 'text-destructive'}
              />
              <span
                className={`text-xs font-medium ${
                  metric?.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}
              >
                {metric?.change}
              </span>
            </div>
            
            <p className="text-xs text-text-secondary mt-1">
              {metric?.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketMetricsStrip;