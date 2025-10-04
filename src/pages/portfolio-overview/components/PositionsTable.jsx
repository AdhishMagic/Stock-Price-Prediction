import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const PositionsTable = () => {
  const [sortField, setSortField] = useState('currentValue');
  const [sortDirection, setSortDirection] = useState('desc');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const positions = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      sector: "Technology",
      shares: 2847,
      avgCost: 165.20,
      currentPrice: 185.12,
      currentValue: 526847.25,
      unrealizedPL: 56742.84,
      unrealizedPLPercent: 12.08,
      predictedReturn: 8.2,
      confidence: 87,
      riskLevel: "Low",
      weight: 18.5
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      sector: "Technology",
      shares: 1892,
      avgCost: 205.45,
      currentPrice: 228.75,
      currentValue: 432891.80,
      unrealizedPL: 44089.60,
      unrealizedPLPercent: 11.34,
      predictedReturn: 6.8,
      confidence: 82,
      riskLevel: "Low",
      weight: 15.2
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      sector: "Technology",
      shares: 2634,
      avgCost: 125.80,
      currentPrice: 138.42,
      currentValue: 364467.20,
      unrealizedPL: 33245.08,
      unrealizedPLPercent: 10.03,
      predictedReturn: 9.1,
      confidence: 79,
      riskLevel: "Medium",
      weight: 12.8
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      sector: "Consumer Discretionary",
      shares: 2145,
      avgCost: 142.30,
      currentPrice: 149.95,
      currentValue: 321714.75,
      unrealizedPL: 16412.25,
      unrealizedPLPercent: 5.38,
      predictedReturn: 5.4,
      confidence: 74,
      riskLevel: "Medium",
      weight: 11.3
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      sector: "Consumer Discretionary",
      shares: 1247,
      avgCost: 235.60,
      currentPrice: 221.45,
      currentValue: 276237.05,
      unrealizedPL: -17634.05,
      unrealizedPLPercent: -6.00,
      predictedReturn: -2.1,
      confidence: 68,
      riskLevel: "High",
      weight: 9.7
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      sector: "Technology",
      shares: 542,
      avgCost: 398.75,
      currentPrice: 441.25,
      currentValue: 239180.60,
      unrealizedPL: 23055.00,
      unrealizedPLPercent: 10.66,
      predictedReturn: 12.3,
      confidence: 85,
      riskLevel: "High",
      weight: 8.4
    },
    {
      symbol: "JPM",
      name: "JPMorgan Chase",
      sector: "Financial Services",
      shares: 1389,
      avgCost: 135.20,
      currentPrice: 147.58,
      currentValue: 205012.24,
      unrealizedPL: 17201.22,
      unrealizedPLPercent: 9.16,
      predictedReturn: 4.7,
      confidence: 81,
      riskLevel: "Medium",
      weight: 7.2
    },
    {
      symbol: "JNJ",
      name: "Johnson & Johnson",
      sector: "Healthcare",
      shares: 1205,
      avgCost: 155.80,
      currentPrice: 160.68,
      currentValue: 193622.10,
      unrealizedPL: 5880.40,
      unrealizedPLPercent: 3.13,
      predictedReturn: 3.2,
      confidence: 89,
      riskLevel: "Low",
      weight: 6.8
    }
  ];

  const sectorOptions = [
    { value: 'all', label: 'All Sectors' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Financial Services', label: 'Financial Services' },
    { value: 'Consumer Discretionary', label: 'Consumer Discretionary' }
  ];

  const riskOptions = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'Low', label: 'Low Risk' },
    { value: 'Medium', label: 'Medium Risk' },
    { value: 'High', label: 'High Risk' }
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedPositions = positions?.filter(position => {
      if (sectorFilter !== 'all' && position?.sector !== sectorFilter) return false;
      if (riskFilter !== 'all' && position?.riskLevel !== riskFilter) return false;
      return true;
    })?.sort((a, b) => {
      const aValue = a?.[sortField];
      const bValue = b?.[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * multiplier;
      }
      return aValue?.toString()?.localeCompare(bValue?.toString()) * multiplier;
    });

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getChangeColor = (value) => {
    return value > 0 ? 'text-success' : value < 0 ? 'text-destructive' : 'text-text-secondary';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'text-success bg-success/10';
      case 'Medium': return 'text-warning bg-warning/10';
      case 'High': return 'text-destructive bg-destructive/10';
      default: return 'text-text-secondary bg-muted';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Portfolio Positions</h3>
          <p className="text-sm text-text-secondary">
            {filteredAndSortedPositions?.length} of {positions?.length} positions
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            options={sectorOptions}
            value={sectorFilter}
            onChange={setSectorFilter}
            placeholder="Filter by sector"
            className="w-full sm:w-48"
          />
          <Select
            options={riskOptions}
            value={riskFilter}
            onChange={setRiskFilter}
            placeholder="Filter by risk"
            className="w-full sm:w-48"
          />
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
                >
                  <span>Symbol</span>
                  <Icon name={getSortIcon('symbol')} size={14} />
                </button>
              </th>
              <th className="text-left py-3 px-2 hidden md:table-cell">
                <button
                  onClick={() => handleSort('sector')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
                >
                  <span>Sector</span>
                  <Icon name={getSortIcon('sector')} size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('shares')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-foreground transition-colors ml-auto"
                >
                  <span>Shares</span>
                  <Icon name={getSortIcon('shares')} size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('currentValue')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-foreground transition-colors ml-auto"
                >
                  <span>Value</span>
                  <Icon name={getSortIcon('currentValue')} size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2 hidden lg:table-cell">
                <button
                  onClick={() => handleSort('unrealizedPL')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-foreground transition-colors ml-auto"
                >
                  <span>P&L</span>
                  <Icon name={getSortIcon('unrealizedPL')} size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('predictedReturn')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-foreground transition-colors ml-auto"
                >
                  <span>Predicted</span>
                  <Icon name={getSortIcon('predictedReturn')} size={14} />
                </button>
              </th>
              <th className="text-center py-3 px-2 hidden xl:table-cell">
                <button
                  onClick={() => handleSort('confidence')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-foreground transition-colors mx-auto"
                >
                  <span>Confidence</span>
                  <Icon name={getSortIcon('confidence')} size={14} />
                </button>
              </th>
              <th className="text-center py-3 px-2 hidden lg:table-cell">
                <span className="text-sm font-medium text-text-secondary">Risk</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPositions?.map((position) => (
              <tr
                key={position?.symbol}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-4 px-2">
                  <div>
                    <div className="font-semibold text-foreground">{position?.symbol}</div>
                    <div className="text-xs text-text-secondary truncate max-w-[120px]">
                      {position?.name}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 hidden md:table-cell">
                  <span className="text-sm text-text-secondary">{position?.sector}</span>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="text-sm font-medium text-foreground">
                    {position?.shares?.toLocaleString()}
                  </div>
                  <div className="text-xs text-text-secondary">
                    @${position?.avgCost}
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="text-sm font-medium text-foreground">
                    ${position?.currentValue?.toLocaleString()}
                  </div>
                  <div className="text-xs text-text-secondary">
                    ${position?.currentPrice}
                  </div>
                </td>
                <td className="py-4 px-2 text-right hidden lg:table-cell">
                  <div className={`text-sm font-medium ${getChangeColor(position?.unrealizedPL)}`}>
                    {position?.unrealizedPL > 0 ? '+' : ''}${position?.unrealizedPL?.toLocaleString()}
                  </div>
                  <div className={`text-xs ${getChangeColor(position?.unrealizedPLPercent)}`}>
                    {position?.unrealizedPLPercent > 0 ? '+' : ''}{position?.unrealizedPLPercent}%
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className={`text-sm font-medium ${getChangeColor(position?.predictedReturn)}`}>
                    {position?.predictedReturn > 0 ? '+' : ''}{position?.predictedReturn}%
                  </div>
                  <div className="text-xs text-text-secondary">30-day</div>
                </td>
                <td className="py-4 px-2 text-center hidden xl:table-cell">
                  <div className={`text-sm font-medium ${getConfidenceColor(position?.confidence)}`}>
                    {position?.confidence}%
                  </div>
                </td>
                <td className="py-4 px-2 text-center hidden lg:table-cell">
                  <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(position?.riskLevel)}`}>
                    {position?.riskLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAndSortedPositions?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No positions match your current filters</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setSectorFilter('all');
              setRiskFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default PositionsTable;