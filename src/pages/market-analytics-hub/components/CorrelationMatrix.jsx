import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CorrelationMatrix = () => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [matrixView, setMatrixView] = useState('correlation');

  const sectors = [
    { id: 'tech', name: 'Technology', short: 'TECH' },
    { id: 'health', name: 'Healthcare', short: 'HLTH' },
    { id: 'finance', name: 'Finance', short: 'FIN' },
    { id: 'energy', name: 'Energy', short: 'ENR' },
    { id: 'consumer', name: 'Consumer', short: 'CON' },
    { id: 'industrial', name: 'Industrial', short: 'IND' }
  ];

  // Correlation matrix data (symmetric matrix)
  const correlationData = {
    tech: { tech: 1.00, health: 0.73, finance: 0.45, energy: -0.12, consumer: 0.58, industrial: 0.34 },
    health: { tech: 0.73, health: 1.00, finance: 0.52, energy: -0.08, consumer: 0.61, industrial: 0.41 },
    finance: { tech: 0.45, health: 0.52, finance: 1.00, energy: 0.23, consumer: 0.67, industrial: 0.78 },
    energy: { tech: -0.12, health: -0.08, finance: 0.23, energy: 1.00, consumer: 0.15, industrial: 0.45 },
    consumer: { tech: 0.58, health: 0.61, finance: 0.67, energy: 0.15, consumer: 1.00, industrial: 0.56 },
    industrial: { tech: 0.34, health: 0.41, finance: 0.78, energy: 0.45, consumer: 0.56, industrial: 1.00 }
  };

  // Volatility matrix data
  const volatilityData = {
    tech: { tech: 0.24, health: 0.18, finance: 0.21, energy: 0.35, consumer: 0.16, industrial: 0.19 },
    health: { tech: 0.18, health: 0.15, finance: 0.17, energy: 0.28, consumer: 0.14, industrial: 0.16 },
    finance: { tech: 0.21, health: 0.17, finance: 0.22, energy: 0.31, consumer: 0.15, industrial: 0.20 },
    energy: { tech: 0.35, health: 0.28, finance: 0.31, energy: 0.42, consumer: 0.25, industrial: 0.33 },
    consumer: { tech: 0.16, health: 0.14, finance: 0.15, energy: 0.25, consumer: 0.13, industrial: 0.17 },
    industrial: { tech: 0.19, health: 0.16, finance: 0.20, energy: 0.33, consumer: 0.17, industrial: 0.21 }
  };

  const getCurrentData = () => {
    return matrixView === 'correlation' ? correlationData : volatilityData;
  };

  const getCorrelationColor = (value) => {
    if (matrixView === 'correlation') {
      if (value >= 0.7) return 'bg-emerald-500';
      if (value >= 0.4) return 'bg-green-500';
      if (value >= 0.1) return 'bg-yellow-500';
      if (value >= -0.1) return 'bg-gray-500';
      if (value >= -0.4) return 'bg-orange-500';
      return 'bg-red-500';
    } else {
      // Volatility coloring
      if (value >= 0.35) return 'bg-red-500';
      if (value >= 0.25) return 'bg-orange-500';
      if (value >= 0.20) return 'bg-yellow-500';
      if (value >= 0.15) return 'bg-green-500';
      return 'bg-emerald-500';
    }
  };

  const getCorrelationIntensity = (value) => {
    if (matrixView === 'correlation') {
      return Math.abs(value);
    } else {
      return value / 0.5; // Normalize volatility to 0-1 range
    }
  };

  const formatValue = (value) => {
    if (matrixView === 'correlation') {
      return value?.toFixed(2);
    } else {
      return (value * 100)?.toFixed(1) + '%';
    }
  };

  const getRelationshipDescription = (value) => {
    if (matrixView === 'correlation') {
      if (value >= 0.7) return 'Strong Positive';
      if (value >= 0.4) return 'Moderate Positive';
      if (value >= 0.1) return 'Weak Positive';
      if (value >= -0.1) return 'No Correlation';
      if (value >= -0.4) return 'Weak Negative';
      return 'Strong Negative';
    } else {
      if (value >= 0.35) return 'Very High Risk';
      if (value >= 0.25) return 'High Risk';
      if (value >= 0.20) return 'Medium Risk';
      if (value >= 0.15) return 'Low Risk';
      return 'Very Low Risk';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {matrixView === 'correlation' ? 'Sector Correlation' : 'Volatility'} Matrix
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMatrixView('correlation')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-smooth ${
              matrixView === 'correlation' ?'bg-primary text-primary-foreground' :'bg-muted text-text-secondary hover:text-foreground'
            }`}
          >
            Correlation
          </button>
          <button
            onClick={() => setMatrixView('volatility')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-smooth ${
              matrixView === 'volatility' ?'bg-primary text-primary-foreground' :'bg-muted text-text-secondary hover:text-foreground'
            }`}
          >
            Volatility
          </button>
        </div>
      </div>
      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header Row */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            <div className="h-8"></div>
            {sectors?.map((sector) => (
              <div
                key={sector?.id}
                className="h-8 flex items-center justify-center text-xs font-medium text-text-secondary bg-muted rounded"
              >
                {sector?.short}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {sectors?.map((rowSector) => (
            <div key={rowSector?.id} className="grid grid-cols-7 gap-1 mb-1">
              {/* Row Label */}
              <div className="h-8 flex items-center justify-center text-xs font-medium text-text-secondary bg-muted rounded">
                {rowSector?.short}
              </div>

              {/* Matrix Cells */}
              {sectors?.map((colSector) => {
                const value = getCurrentData()?.[rowSector?.id]?.[colSector?.id];
                const isSelected = selectedCell === `${rowSector?.id}-${colSector?.id}`;
                const isDiagonal = rowSector?.id === colSector?.id;

                return (
                  <div
                    key={colSector?.id}
                    onClick={() => setSelectedCell(isSelected ? null : `${rowSector?.id}-${colSector?.id}`)}
                    className={`h-8 flex items-center justify-center text-xs font-bold cursor-pointer rounded transition-all duration-200 ${
                      isDiagonal
                        ? 'bg-primary text-primary-foreground'
                        : `${getCorrelationColor(value)} text-white hover:scale-105`
                    } ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105' : ''
                    }`}
                    style={{
                      opacity: isDiagonal ? 1 : 0.7 + (getCorrelationIntensity(value) * 0.3)
                    }}
                  >
                    {formatValue(value)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">
            {matrixView === 'correlation' ? 'Correlation Strength' : 'Volatility Level'}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-secondary">
              {matrixView === 'correlation' ? 'Negative' : 'Low'}
            </span>
            <div className="flex space-x-1">
              {matrixView === 'correlation' ? (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                </>
              )}
            </div>
            <span className="text-xs text-text-secondary">
              {matrixView === 'correlation' ? 'Positive' : 'High'}
            </span>
          </div>
        </div>
      </div>
      {/* Selected Cell Details */}
      {selectedCell && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          {(() => {
            const [rowId, colId] = selectedCell?.split('-');
            const rowSector = sectors?.find(s => s?.id === rowId);
            const colSector = sectors?.find(s => s?.id === colId);
            const value = getCurrentData()?.[rowId]?.[colId];
            
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Info" size={16} className="text-primary" />
                    <span className="font-medium text-foreground">
                      {rowSector?.name} × {colSector?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="text-text-secondary hover:text-foreground"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">
                      {matrixView === 'correlation' ? 'Correlation:' : 'Volatility:'}
                    </span>
                    <div className="font-bold text-foreground">{formatValue(value)}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Relationship:</span>
                    <div className="font-medium text-foreground">
                      {getRelationshipDescription(value)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-text-secondary">
                  {matrixView === 'correlation' 
                    ? `This indicates ${getRelationshipDescription(value)?.toLowerCase()} correlation between ${rowSector?.name} and ${colSector?.name} sectors.`
                    : `This shows ${getRelationshipDescription(value)?.toLowerCase()} volatility relationship between these sectors.`
                  }
                </p>
              </div>
            );
          })()}
        </div>
      )}
      {/* Export Options */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          Last updated: {new Date()?.toLocaleString()}
        </span>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-1 px-3 py-1 bg-muted text-text-secondary rounded-md hover:text-foreground transition-smooth">
            <Icon name="Download" size={14} />
            <span className="text-xs">Export CSV</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 bg-muted text-text-secondary rounded-md hover:text-foreground transition-smooth">
            <Icon name="RefreshCw" size={14} />
            <span className="text-xs">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrelationMatrix;