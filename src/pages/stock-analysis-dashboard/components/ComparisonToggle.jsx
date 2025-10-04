import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ComparisonToggle = ({ 
  viewMode, 
  onViewModeChange, 
  showHistorical, 
  showPredicted, 
  onToggleHistorical, 
  onTogglePredicted,
  isLoading 
}) => {
  const viewModes = [
    {
      id: 'overlay',
      label: 'Overlay View',
      icon: 'Layers',
      description: 'Show historical and predicted data together'
    },
    {
      id: 'split',
      label: 'Split View',
      icon: 'Columns',
      description: 'Show historical and predicted data separately'
    },
    {
      id: 'comparison',
      label: 'Comparison',
      icon: 'GitCompare',
      description: 'Side-by-side comparison of actual vs predicted'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Settings" size={20} className="text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Chart Controls</h3>
          <p className="text-sm text-text-secondary">Customize your data visualization</p>
        </div>
      </div>
      {/* View Mode Selection */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Eye" size={16} className="text-text-secondary" />
          <span className="text-sm font-medium text-foreground">View Mode</span>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {viewModes?.map((mode) => (
            <button
              key={mode?.id}
              onClick={() => onViewModeChange(mode?.id)}
              disabled={isLoading}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-smooth text-left ${
                viewMode === mode?.id
                  ? 'bg-primary/10 border-primary/20 text-primary' :'bg-muted border-border text-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name={mode?.icon} size={16} />
              <div className="flex-1">
                <div className="font-medium">{mode?.label}</div>
                <div className="text-xs text-text-secondary">{mode?.description}</div>
              </div>
              {viewMode === mode?.id && (
                <Icon name="Check" size={16} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Data Visibility Toggles */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="ToggleLeft" size={16} className="text-text-secondary" />
          <span className="text-sm font-medium text-foreground">Data Visibility</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div>
                <div className="font-medium text-foreground">Historical Data</div>
                <div className="text-xs text-text-secondary">Show actual price history</div>
              </div>
            </div>
            <Button
              variant={showHistorical ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleHistorical}
              disabled={isLoading}
              className="min-w-[60px]"
            >
              {showHistorical ? 'ON' : 'OFF'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <div>
                <div className="font-medium text-foreground">Predicted Data</div>
                <div className="text-xs text-text-secondary">Show AI predictions</div>
              </div>
            </div>
            <Button
              variant={showPredicted ? 'default' : 'outline'}
              size="sm"
              onClick={onTogglePredicted}
              disabled={isLoading}
              className="min-w-[60px]"
            >
              {showPredicted ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Zap" size={16} className="text-text-secondary" />
          <span className="text-sm font-medium text-foreground">Quick Actions</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleHistorical(true);
              onTogglePredicted(true);
              onViewModeChange('overlay');
            }}
            disabled={isLoading}
            className="text-xs"
          >
            <Icon name="Layers" size={14} className="mr-1" />
            Show All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleHistorical(true);
              onTogglePredicted(false);
              onViewModeChange('overlay');
            }}
            disabled={isLoading}
            className="text-xs"
          >
            <Icon name="History" size={14} className="mr-1" />
            Historical Only
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleHistorical(false);
              onTogglePredicted(true);
              onViewModeChange('overlay');
            }}
            disabled={isLoading}
            className="text-xs"
          >
            <Icon name="TrendingUp" size={14} className="mr-1" />
            Predictions Only
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleHistorical(true);
              onTogglePredicted(true);
              onViewModeChange('comparison');
            }}
            disabled={isLoading}
            className="text-xs"
          >
            <Icon name="GitCompare" size={14} className="mr-1" />
            Compare
          </Button>
        </div>
      </div>
      {/* Status Indicator */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-warning animate-pulse' : 'bg-success'}`}></div>
            <span className="text-text-secondary">
              {isLoading ? 'Updating...' : 'Ready'}
            </span>
          </div>
          <div className="text-text-secondary">
            Last updated: {new Date()?.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonToggle;