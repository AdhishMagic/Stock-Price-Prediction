import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const WatchlistPanel = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const watchlistStocks = [
    {
      symbol: "META",
      name: "Meta Platforms",
      price: 298.75,
      change: +5.23,
      changePercent: +1.78,
      predictedReturn: 6.4,
      confidence: 82
    },
    {
      symbol: "NFLX",
      name: "Netflix Inc.",
      price: 445.20,
      change: -8.90,
      changePercent: -1.96,
      predictedReturn: 3.2,
      confidence: 75
    },
    {
      symbol: "AMD",
      name: "Advanced Micro Devices",
      price: 102.45,
      change: +2.15,
      changePercent: +2.14,
      predictedReturn: 8.7,
      confidence: 79
    },
    {
      symbol: "CRM",
      name: "Salesforce Inc.",
      price: 215.80,
      change: +1.45,
      changePercent: +0.68,
      predictedReturn: 4.9,
      confidence: 84
    },
    {
      symbol: "PYPL",
      name: "PayPal Holdings",
      price: 58.92,
      change: -0.78,
      changePercent: -1.31,
      predictedReturn: 2.1,
      confidence: 71
    }
  ];

  const topMovers = [
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      change: +15.2,
      changePercent: +3.45,
      alert: "Strong Buy Signal",
      type: "positive"
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      change: -12.8,
      changePercent: -2.89,
      alert: "Risk Alert",
      type: "negative"
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      change: +8.7,
      changePercent: +1.23,
      alert: "Prediction Update",
      type: "neutral"
    }
  ];

  const handleAddStock = () => {
    if (newSymbol?.trim()) {
      // Mock add functionality
      setNewSymbol('');
      setShowAddForm(false);
    }
  };

  const getChangeColor = (change) => {
    return change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-text-secondary';
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'positive': return 'text-success bg-success/10';
      case 'negative': return 'text-destructive bg-destructive/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Watchlist Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Watchlist</h3>
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            Add Stock
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter symbol (e.g., AAPL)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e?.target?.value?.toUpperCase())}
                className="flex-1"
              />
              <Button
                variant="default"
                size="sm"
                onClick={handleAddStock}
                disabled={!newSymbol?.trim()}
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => {
                  setShowAddForm(false);
                  setNewSymbol('');
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {watchlistStocks?.map((stock) => (
            <div
              key={stock?.symbol}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{stock?.symbol}</div>
                    <div className="text-xs text-text-secondary truncate">{stock?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">${stock?.price}</div>
                    <div className={`text-xs ${getChangeColor(stock?.change)}`}>
                      {stock?.change > 0 ? '+' : ''}{stock?.change} ({stock?.changePercent > 0 ? '+' : ''}{stock?.changePercent}%)
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-text-secondary">
                    Pred: {stock?.predictedReturn > 0 ? '+' : ''}{stock?.predictedReturn}%
                  </span>
                  <span className="text-text-secondary">
                    Conf: {stock?.confidence}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Top Movers Alert Feed */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Top Movers</h3>
          <Icon name="Bell" size={16} className="text-text-secondary" />
        </div>

        <div className="space-y-3">
          {topMovers?.map((mover, index) => (
            <div
              key={`${mover?.symbol}-${index}`}
              className="p-3 rounded-lg border border-border/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="font-semibold text-foreground">{mover?.symbol}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getAlertColor(mover?.type)}`}>
                      {mover?.alert}
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary mt-1">{mover?.name}</div>
                  <div className={`text-sm font-medium mt-2 ${getChangeColor(mover?.change)}`}>
                    {mover?.change > 0 ? '+' : ''}{mover?.change} ({mover?.changePercent > 0 ? '+' : ''}{mover?.changePercent}%)
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  2 min ago
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4"
          iconName="ChevronDown"
          iconPosition="right"
        >
          View All Alerts
        </Button>
      </div>
    </div>
  );
};

export default WatchlistPanel;