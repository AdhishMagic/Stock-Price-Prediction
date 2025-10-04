import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ModelPerformance = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedModel, setSelectedModel] = useState(null);

  const timeframes = [
    { id: '1d', label: '1D' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '90D' }
  ];

  const modelData = [
    {
      id: 'lstm-v3',
      name: 'LSTM v3.2',
      type: 'Neural Network',
      accuracy: 89.4,
      mse: 0.0234,
      rmse: 0.153,
      mae: 0.121,
      r2Score: 0.847,
      status: 'active',
      lastUpdated: '2024-10-04T10:30:00Z',
      predictions: 15847,
      successRate: 87.3,
      trend: 'up',
      change: '+2.1%'
    },
    {
      id: 'transformer-v2',
      name: 'Transformer v2.1',
      type: 'Attention Model',
      accuracy: 86.7,
      mse: 0.0289,
      rmse: 0.170,
      mae: 0.134,
      r2Score: 0.821,
      status: 'active',
      lastUpdated: '2024-10-04T10:25:00Z',
      predictions: 12934,
      successRate: 84.6,
      trend: 'up',
      change: '+1.8%'
    },
    {
      id: 'ensemble-v1',
      name: 'Ensemble v1.5',
      type: 'Hybrid Model',
      accuracy: 91.2,
      mse: 0.0198,
      rmse: 0.141,
      mae: 0.108,
      r2Score: 0.863,
      status: 'active',
      lastUpdated: '2024-10-04T10:35:00Z',
      predictions: 8756,
      successRate: 89.7,
      trend: 'up',
      change: '+3.2%'
    },
    {
      id: 'random-forest',
      name: 'Random Forest v2.0',
      type: 'Tree-based',
      accuracy: 82.1,
      mse: 0.0356,
      rmse: 0.189,
      mae: 0.156,
      r2Score: 0.789,
      status: 'training',
      lastUpdated: '2024-10-04T09:45:00Z',
      predictions: 6432,
      successRate: 80.4,
      trend: 'down',
      change: '-1.2%'
    },
    {
      id: 'xgboost-v3',
      name: 'XGBoost v3.1',
      type: 'Gradient Boosting',
      accuracy: 85.3,
      mse: 0.0267,
      rmse: 0.163,
      mae: 0.129,
      r2Score: 0.834,
      status: 'active',
      lastUpdated: '2024-10-04T10:20:00Z',
      predictions: 11245,
      successRate: 83.1,
      trend: 'stable',
      change: '+0.3%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10';
      case 'training': return 'text-warning bg-warning/10';
      case 'inactive': return 'text-text-secondary bg-muted';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-text-secondary';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Model Performance</h3>
        <div className="flex items-center space-x-2">
          {timeframes?.map((timeframe) => (
            <button
              key={timeframe?.id}
              onClick={() => setSelectedTimeframe(timeframe?.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-smooth ${
                selectedTimeframe === timeframe?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:text-foreground'
              }`}
            >
              {timeframe?.label}
            </button>
          ))}
        </div>
      </div>
      {/* Model Leaderboard */}
      <div className="space-y-3 mb-6">
        {modelData?.sort((a, b) => b?.accuracy - a?.accuracy)?.map((model, index) => (
            <div
              key={model?.id}
              onClick={() => setSelectedModel(selectedModel === model?.id ? null : model?.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-smooth ${
                selectedModel === model?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{model?.name}</div>
                    <div className="text-xs text-text-secondary">{model?.type}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model?.status)}`}>
                    {model?.status}
                  </span>
                  <Icon
                    name={getTrendIcon(model?.trend)}
                    size={14}
                    className={getTrendColor(model?.trend)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">Accuracy</span>
                  <div className="font-bold text-foreground">{model?.accuracy}%</div>
                </div>
                <div>
                  <span className="text-text-secondary">Success Rate</span>
                  <div className="font-bold text-foreground">{model?.successRate}%</div>
                </div>
                <div>
                  <span className="text-text-secondary">Change</span>
                  <div className={`font-bold ${getTrendColor(model?.trend)}`}>
                    {model?.change}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                <span>{model?.predictions?.toLocaleString()} predictions</span>
                <span>Updated {formatTime(model?.lastUpdated)}</span>
              </div>

              {/* Accuracy Bar */}
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all duration-300"
                    style={{ width: `${model?.accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
      {/* Detailed Metrics */}
      {selectedModel && (
        <div className="border-t border-border pt-4">
          {(() => {
            const model = modelData?.find(m => m?.id === selectedModel);
            return (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icon name="BarChart3" size={16} className="text-primary" />
                  <h4 className="font-semibold text-foreground">{model?.name} Metrics</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">MSE:</span>
                      <span className="font-mono text-foreground">{model?.mse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">RMSE:</span>
                      <span className="font-mono text-foreground">{model?.rmse}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">MAE:</span>
                      <span className="font-mono text-foreground">{model?.mae}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">R² Score:</span>
                      <span className="font-mono text-foreground">{model?.r2Score}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth">
                    View Details
                  </button>
                  <button className="px-3 py-2 bg-muted text-text-secondary rounded-lg text-sm font-medium hover:text-foreground transition-smooth">
                    <Icon name="Download" size={16} />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">5</div>
            <div className="text-text-secondary">Active Models</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">91.2%</div>
            <div className="text-text-secondary">Best Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;