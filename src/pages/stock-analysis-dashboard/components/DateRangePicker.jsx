import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DateRangePicker = ({ selectedRange, onRangeChange, customStartDate, customEndDate, onCustomDateChange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const presetRanges = [
    { label: '1D', value: '1D', days: 1 },
    { label: '1W', value: '1W', days: 7 },
    { label: '1M', value: '1M', days: 30 },
    { label: '3M', value: '3M', days: 90 },
    { label: '1Y', value: '1Y', days: 365 },
    { label: 'Custom', value: 'custom', days: null }
  ];

  const handlePresetSelect = (range) => {
    if (range?.value === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      const endDate = new Date();
      const startDate = new Date();
      startDate?.setDate(endDate?.getDate() - range?.days);
      
      onRangeChange({
        preset: range?.value,
        startDate: startDate?.toISOString()?.split('T')?.[0],
        endDate: endDate?.toISOString()?.split('T')?.[0]
      });
    }
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      onRangeChange({
        preset: 'custom',
        startDate: customStartDate,
        endDate: customEndDate
      });
      setShowCustomPicker(false);
    }
  };

  const formatDateRange = () => {
    if (selectedRange?.preset === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate)?.toLocaleDateString();
      const end = new Date(customEndDate)?.toLocaleDateString();
      return `${start} - ${end}`;
    }
    return selectedRange?.preset;
  };

  return (
    <div className="space-y-4">
      {/* Preset Range Buttons */}
      <div className="flex flex-wrap gap-2">
        {presetRanges?.map((range) => (
          <Button
            key={range?.value}
            variant={selectedRange?.preset === range?.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetSelect(range)}
            className="min-w-[60px]"
          >
            {range?.label}
          </Button>
        ))}
      </div>
      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div className="p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Calendar" size={16} className="text-text-secondary" />
            <span className="text-sm font-medium text-foreground">Custom Date Range</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomDateChange('start', e?.target?.value)}
                max={new Date()?.toISOString()?.split('T')?.[0]}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomDateChange('end', e?.target?.value)}
                min={customStartDate}
                max={new Date()?.toISOString()?.split('T')?.[0]}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomPicker(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCustomDateSubmit}
              disabled={!customStartDate || !customEndDate}
            >
              Apply Range
            </Button>
          </div>
        </div>
      )}
      {/* Selected Range Display */}
      <div className="flex items-center space-x-2 text-sm text-text-secondary">
        <Icon name="Calendar" size={14} />
        <span>Selected: {formatDateRange()}</span>
      </div>
    </div>
  );
};

export default DateRangePicker;