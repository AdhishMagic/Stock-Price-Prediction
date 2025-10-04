import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PredictionHorizonSelector = ({ selectedHorizon, onHorizonChange, customDays, onCustomDaysChange }) => {
  const presetHorizons = [
    { label: '1 Day', value: 1 },
    { label: '1 Week', value: 7 },
    { label: '1 Month', value: 30 },
    { label: '3 Months', value: 90 },
    { label: '6 Months', value: 180 },
    { label: '1 Year', value: 365 }
  ];

  const handlePresetSelect = (days) => {
    onHorizonChange(days);
  };

  const handleCustomSubmit = () => {
    const days = parseInt(customDays);
    if (days >= 1 && days <= 365) {
      onHorizonChange(days);
    }
  };

  const getHorizonLabel = (days) => {
    const preset = presetHorizons?.find(p => p?.value === days);
    if (preset) return preset?.label;
    
    if (days === 1) return '1 Day';
    if (days < 30) return `${days} Days`;
    if (days < 365) return `${Math.round(days / 30)} Months`;
    return '1 Year';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="TrendingUp" size={16} className="text-primary" />
        <span className="text-sm font-medium text-foreground">Prediction Horizon</span>
      </div>
      {/* Preset Horizon Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {presetHorizons?.map((horizon) => (
          <Button
            key={horizon?.value}
            variant={selectedHorizon === horizon?.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetSelect(horizon?.value)}
            className="text-xs"
          >
            {horizon?.label}
          </Button>
        ))}
      </div>
      {/* Custom Days Input */}
      <div className="p-3 bg-muted rounded-lg border border-border">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Settings" size={14} className="text-text-secondary" />
          <span className="text-sm font-medium text-foreground">Custom Horizon</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Days"
            value={customDays}
            onChange={(e) => onCustomDaysChange(e?.target?.value)}
            min="1"
            max="365"
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleCustomSubmit}
            disabled={!customDays || customDays < 1 || customDays > 365}
          >
            Apply
          </Button>
        </div>
        
        <div className="text-xs text-text-secondary mt-1">
          Range: 1-365 days
        </div>
      </div>
      {/* Current Selection Display */}
      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-2">
          <Icon name="Target" size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">
            Predicting: {getHorizonLabel(selectedHorizon)}
          </span>
        </div>
        <div className="text-xs text-text-secondary">
          {selectedHorizon} {selectedHorizon === 1 ? 'day' : 'days'} ahead
        </div>
      </div>
      {/* Confidence Notice */}
      <div className="flex items-start space-x-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
        <Icon name="AlertTriangle" size={14} className="text-warning mt-0.5" />
        <div className="text-xs text-text-secondary">
          <div className="font-medium text-foreground mb-1">Prediction Accuracy</div>
          Longer horizons may have lower accuracy. Consider market volatility and external factors.
        </div>
      </div>
    </div>
  );
};

export default PredictionHorizonSelector;