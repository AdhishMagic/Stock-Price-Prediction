import React from 'react';
import Icon from '../../../components/AppIcon';

const PortfolioKPICards = () => {
  const kpiData = [
    {
      id: 1,
      title: "Total Portfolio Value",
      value: "$2,847,392.50",
      change: "+$47,392.50",
      changePercent: "+1.69%",
      trend: "up",
      sparklineData: [100, 105, 103, 108, 112, 109, 115, 118],
      icon: "DollarSign",
      color: "text-success"
    },
    {
      id: 2,
      title: "Daily P&L",
      value: "+$23,847.20",
      change: "+0.84%",
      changePercent: "vs yesterday",
      trend: "up",
      sparklineData: [100, 98, 102, 105, 103, 107, 110, 108],
      icon: "TrendingUp",
      color: "text-success"
    },
    {
      id: 3,
      title: "Predicted 30-Day Return",
      value: "+7.2%",
      change: "High Confidence",
      changePercent: "85% accuracy",
      trend: "up",
      sparklineData: [100, 102, 104, 103, 106, 108, 107, 110],
      icon: "Target",
      color: "text-primary"
    },
    {
      id: 4,
      title: "Overall Risk Score",
      value: "6.4/10",
      change: "Moderate Risk",
      changePercent: "Balanced",
      trend: "neutral",
      sparklineData: [100, 101, 99, 102, 100, 103, 101, 102],
      icon: "Shield",
      color: "text-warning"
    },
    {
      id: 5,
      title: "Diversification Index",
      value: "8.7/10",
      change: "Well Diversified",
      changePercent: "Optimal spread",
      trend: "up",
      sparklineData: [100, 103, 105, 104, 107, 109, 108, 111],
      icon: "PieChart",
      color: "text-accent"
    }
  ];

  const renderSparkline = (data) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    const points = data?.map((value, index) => {
      const x = (index / (data?.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    })?.join(' ');

    return (
      <svg width="60" height="20" className="opacity-60">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
      {kpiData?.map((kpi) => (
        <div
          key={kpi?.id}
          className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation transition-smooth"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg bg-${kpi?.color?.split('-')?.[1]}/10 flex items-center justify-center`}>
              <Icon name={kpi?.icon} size={20} className={kpi?.color} />
            </div>
            <div className={kpi?.color}>
              {renderSparkline(kpi?.sparklineData)}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-text-secondary font-medium">
              {kpi?.title}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {kpi?.value}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${kpi?.color}`}>
                {kpi?.change}
              </span>
              <span className="text-xs text-text-secondary">
                {kpi?.changePercent}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioKPICards;