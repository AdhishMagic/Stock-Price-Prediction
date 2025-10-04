import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const PortfolioControls = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState('main');
  const [dateRange, setDateRange] = useState('30d');
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [refreshInterval, setRefreshInterval] = useState('15m');

  const portfolioOptions = [
    { value: 'main', label: 'Main Portfolio ($2.8M)' },
    { value: 'growth', label: 'Growth Portfolio ($1.2M)' },
    { value: 'income', label: 'Income Portfolio ($850K)' },
    { value: 'speculative', label: 'Speculative Portfolio ($320K)' }
  ];

  const dateRangeOptions = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const riskToleranceOptions = [
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'aggressive', label: 'Aggressive' }
  ];

  const refreshIntervalOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' }
  ];

  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Mock refresh functionality
  };

  const formatLastRefresh = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Section - Portfolio Selection & Date Range */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Portfolio"
              options={portfolioOptions}
              value={selectedPortfolio}
              onChange={setSelectedPortfolio}
            />
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={dateRange}
              onChange={setDateRange}
            />
          </div>

          {dateRange === 'custom' && (
            <div className="flex space-x-2">
              <Input
                type="date"
                label="From"
                className="w-32"
              />
              <Input
                type="date"
                label="To"
                className="w-32"
              />
            </div>
          )}
        </div>

        {/* Center Section - Risk & Refresh Settings */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="min-w-[140px]">
            <Select
              label="Risk Tolerance"
              options={riskToleranceOptions}
              value={riskTolerance}
              onChange={setRiskTolerance}
            />
          </div>

          <div className="min-w-[130px]">
            <Select
              label="Auto Refresh"
              options={refreshIntervalOptions}
              value={refreshInterval}
              onChange={setRefreshInterval}
            />
          </div>
        </div>

        {/* Right Section - Actions & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="text-right">
            <div className="text-sm text-text-secondary mb-1">Last Updated</div>
            <div className="text-sm font-medium text-foreground">
              {formatLastRefresh(lastRefresh)}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              iconPosition="left"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
            />
          </div>
        </div>
      </div>

      {/* Portfolio Value Display */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div>
              <div className="text-sm text-text-secondary">Current Value</div>
              <div className="text-2xl font-bold text-foreground">$2,847,392.50</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Today's Change</div>
              <div className="text-lg font-semibold text-success">+$23,847.20 (+0.84%)</div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Market Status</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm font-medium text-foreground">Market Open</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Export Report
            </Button>
            
            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              iconPosition="left"
            >
              Add Position
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-text-secondary">Positions</div>
          <div className="text-lg font-semibold text-foreground">24</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-text-secondary">Sectors</div>
          <div className="text-lg font-semibold text-foreground">8</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-text-secondary">Avg Confidence</div>
          <div className="text-lg font-semibold text-primary">82%</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-text-secondary">Beta</div>
          <div className="text-lg font-semibold text-warning">1.24</div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioControls;