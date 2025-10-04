import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const GlobalControls = ({ onFiltersChange }) => {
  const [selectedSector, setSelectedSector] = useState('all');
  const [volatilityFilter, setVolatilityFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [modelComparison, setModelComparison] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const sectorOptions = [
    { value: 'all', label: 'All Sectors' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'energy', label: 'Energy' },
    { value: 'consumer', label: 'Consumer Goods' },
    { value: 'industrial', label: 'Industrial' }
  ];

  const volatilityOptions = [
    { value: 'all', label: 'All Volatility Levels' },
    { value: 'low', label: 'Low Volatility (< 15%)' },
    { value: 'medium', label: 'Medium Volatility (15-25%)' },
    { value: 'high', label: 'High Volatility (> 25%)' }
  ];

  const timeRangeOptions = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'ytd', label: 'Year to Date' }
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      sector: selectedSector,
      volatility: volatilityFilter,
      timeRange: timeRange,
      modelComparison: modelComparison
    };

    switch (filterType) {
      case 'sector':
        setSelectedSector(value);
        newFilters.sector = value;
        break;
      case 'volatility':
        setVolatilityFilter(value);
        newFilters.volatility = value;
        break;
      case 'timeRange':
        setTimeRange(value);
        newFilters.timeRange = value;
        break;
      case 'modelComparison':
        setModelComparison(value);
        newFilters.modelComparison = value;
        break;
    }

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const resetFilters = () => {
    setSelectedSector('all');
    setVolatilityFilter('all');
    setTimeRange('30d');
    setModelComparison(false);
    
    if (onFiltersChange) {
      onFiltersChange({
        sector: 'all',
        volatility: 'all',
        timeRange: '30d',
        modelComparison: false
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Primary Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Market Filters</span>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Select
              options={sectorOptions}
              value={selectedSector}
              onChange={(value) => handleFilterChange('sector', value)}
              placeholder="Select Sector"
              className="min-w-[160px]"
            />

            <Select
              options={volatilityOptions}
              value={volatilityFilter}
              onChange={(value) => handleFilterChange('volatility', value)}
              placeholder="Volatility Filter"
              className="min-w-[180px]"
            />

            <Select
              options={timeRangeOptions}
              value={timeRange}
              onChange={(value) => handleFilterChange('timeRange', value)}
              placeholder="Time Range"
              className="min-w-[120px]"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <Button
            variant={modelComparison ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('modelComparison', !modelComparison)}
            iconName="GitCompare"
            iconPosition="left"
          >
            Model Compare
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            iconName={isAdvancedOpen ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            Advanced
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            iconName="RotateCcw"
          >
            Reset
          </Button>
        </div>
      </div>
      {/* Advanced Controls */}
      {isAdvancedOpen && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Market Cap Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Market Cap</label>
              <Select
                options={[
                  { value: 'all', label: 'All Caps' },
                  { value: 'large', label: 'Large Cap (>$10B)' },
                  { value: 'mid', label: 'Mid Cap ($2B-$10B)' },
                  { value: 'small', label: 'Small Cap (<$2B)' }
                ]}
                value="all"
                onChange={() => {}}
                placeholder="Market Cap"
              />
            </div>

            {/* Performance Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Performance</label>
              <Select
                options={[
                  { value: 'all', label: 'All Performance' },
                  { value: 'outperform', label: 'Outperforming' },
                  { value: 'underperform', label: 'Underperforming' },
                  { value: 'neutral', label: 'Neutral' }
                ]}
                value="all"
                onChange={() => {}}
                placeholder="Performance"
              />
            </div>

            {/* Prediction Confidence */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Min Confidence</label>
              <Select
                options={[
                  { value: '0', label: 'Any Confidence' },
                  { value: '70', label: '70%+' },
                  { value: '80', label: '80%+' },
                  { value: '90', label: '90%+' }
                ]}
                value="0"
                onChange={() => {}}
                placeholder="Confidence"
              />
            </div>

            {/* Data Quality */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Data Quality</label>
              <Select
                options={[
                  { value: 'all', label: 'All Quality' },
                  { value: 'high', label: 'High Quality (95%+)' },
                  { value: 'medium', label: 'Medium Quality (85%+)' },
                  { value: 'basic', label: 'Basic Quality (75%+)' }
                ]}
                value="all"
                onChange={() => {}}
                placeholder="Data Quality"
              />
            </div>
          </div>

          {/* Advanced Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="Info" size={14} />
              <span>Advanced filters help refine analysis for specific research needs</span>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" iconName="Save">
                Save Preset
              </Button>
              <Button variant="outline" size="sm" iconName="Download">
                Export Config
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Summary */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {selectedSector !== 'all' && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
            <span>Sector: {sectorOptions?.find(s => s?.value === selectedSector)?.label}</span>
            <button onClick={() => handleFilterChange('sector', 'all')}>
              <Icon name="X" size={12} />
            </button>
          </div>
        )}
        
        {volatilityFilter !== 'all' && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
            <span>Volatility: {volatilityOptions?.find(v => v?.value === volatilityFilter)?.label}</span>
            <button onClick={() => handleFilterChange('volatility', 'all')}>
              <Icon name="X" size={12} />
            </button>
          </div>
        )}
        
        {timeRange !== '30d' && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
            <span>Time: {timeRangeOptions?.find(t => t?.value === timeRange)?.label}</span>
            <button onClick={() => handleFilterChange('timeRange', '30d')}>
              <Icon name="X" size={12} />
            </button>
          </div>
        )}
        
        {modelComparison && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
            <span>Model Comparison: ON</span>
            <button onClick={() => handleFilterChange('modelComparison', false)}>
              <Icon name="X" size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalControls;