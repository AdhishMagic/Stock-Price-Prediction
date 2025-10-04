import React, { useState } from 'react';


const PortfolioHeatmap = () => {
  const [selectedStock, setSelectedStock] = useState(null);

  const portfolioHoldings = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      weight: 18.5,
      currentValue: 526847.25,
      predictedReturn: 8.2,
      confidence: 87,
      sector: "Technology",
      riskLevel: "Low",
      performance: "positive"
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      weight: 15.2,
      currentValue: 432891.80,
      predictedReturn: 6.8,
      confidence: 82,
      sector: "Technology",
      riskLevel: "Low",
      performance: "positive"
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      weight: 12.8,
      currentValue: 364467.20,
      predictedReturn: 9.1,
      confidence: 79,
      sector: "Technology",
      riskLevel: "Medium",
      performance: "positive"
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      weight: 11.3,
      currentValue: 321714.75,
      predictedReturn: 5.4,
      confidence: 74,
      sector: "Consumer Discretionary",
      riskLevel: "Medium",
      performance: "neutral"
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      weight: 9.7,
      currentValue: 276237.05,
      predictedReturn: -2.1,
      confidence: 68,
      sector: "Consumer Discretionary",
      riskLevel: "High",
      performance: "negative"
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      weight: 8.4,
      currentValue: 239180.60,
      predictedReturn: 12.3,
      confidence: 85,
      sector: "Technology",
      riskLevel: "High",
      performance: "positive"
    },
    {
      symbol: "JPM",
      name: "JPMorgan Chase",
      weight: 7.2,
      currentValue: 205012.24,
      predictedReturn: 4.7,
      confidence: 81,
      sector: "Financial Services",
      riskLevel: "Medium",
      performance: "positive"
    },
    {
      symbol: "JNJ",
      name: "Johnson & Johnson",
      weight: 6.8,
      currentValue: 193622.10,
      predictedReturn: 3.2,
      confidence: 89,
      sector: "Healthcare",
      riskLevel: "Low",
      performance: "neutral"
    },
    {
      symbol: "V",
      name: "Visa Inc.",
      weight: 5.9,
      currentValue: 167996.18,
      predictedReturn: 7.6,
      confidence: 83,
      sector: "Financial Services",
      riskLevel: "Low",
      performance: "positive"
    },
    {
      symbol: "UNH",
      name: "UnitedHealth Group",
      weight: 4.2,
      currentValue: 119590.45,
      predictedReturn: 5.8,
      confidence: 86,
      sector: "Healthcare",
      riskLevel: "Medium",
      performance: "positive"
    }
  ];

  const getPerformanceColor = (performance, predictedReturn) => {
    if (performance === 'positive' || predictedReturn > 5) return 'bg-success/20 border-success/40 text-success';
    if (performance === 'negative' || predictedReturn < 0) return 'bg-destructive/20 border-destructive/40 text-destructive';
    return 'bg-warning/20 border-warning/40 text-warning';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'High': return 'text-destructive';
      default: return 'text-text-secondary';
    }
  };

  const calculateSize = (weight) => {
    const minSize = 120;
    const maxSize = 200;
    const maxWeight = Math.max(...portfolioHoldings?.map(h => h?.weight));
    return minSize + (weight / maxWeight) * (maxSize - minSize);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Portfolio Holdings Heatmap</h3>
          <p className="text-sm text-text-secondary">Size by position weight, color by predicted performance</p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-success/20 border border-success/40"></div>
            <span className="text-text-secondary">Positive</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-warning/20 border border-warning/40"></div>
            <span className="text-text-secondary">Neutral</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/40"></div>
            <span className="text-text-secondary">Negative</span>
          </div>
        </div>
      </div>
      <div className="relative min-h-[400px] overflow-hidden">
        <div className="flex flex-wrap gap-3 justify-center items-center p-4">
          {portfolioHoldings?.map((holding) => {
            const size = calculateSize(holding?.weight);
            return (
              <div
                key={holding?.symbol}
                className={`relative border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  getPerformanceColor(holding?.performance, holding?.predictedReturn)
                } ${selectedStock === holding?.symbol ? 'ring-2 ring-primary' : ''}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  minWidth: '120px',
                  minHeight: '120px'
                }}
                onClick={() => setSelectedStock(selectedStock === holding?.symbol ? null : holding?.symbol)}
              >
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="text-center">
                    <div className="font-bold text-lg">{holding?.symbol}</div>
                    <div className="text-xs opacity-80 truncate">{holding?.name}</div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <div className="text-sm font-semibold">{holding?.weight}%</div>
                    <div className="text-xs">
                      ${(holding?.currentValue / 1000)?.toFixed(0)}K
                    </div>
                    <div className="text-xs font-medium">
                      {holding?.predictedReturn > 0 ? '+' : ''}{holding?.predictedReturn}%
                    </div>
                  </div>
                </div>
                {selectedStock === holding?.symbol && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-elevation p-4 z-10">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{holding?.name}</h4>
                        <p className="text-sm text-text-secondary">{holding?.sector}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-text-secondary">Current Value:</span>
                          <div className="font-medium">${holding?.currentValue?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-text-secondary">Weight:</span>
                          <div className="font-medium">{holding?.weight}%</div>
                        </div>
                        <div>
                          <span className="text-text-secondary">Predicted Return:</span>
                          <div className="font-medium">
                            {holding?.predictedReturn > 0 ? '+' : ''}{holding?.predictedReturn}%
                          </div>
                        </div>
                        <div>
                          <span className="text-text-secondary">Confidence:</span>
                          <div className="font-medium">{holding?.confidence}%</div>
                        </div>
                        <div>
                          <span className="text-text-secondary">Risk Level:</span>
                          <div className={`font-medium ${getRiskColor(holding?.riskLevel)}`}>
                            {holding?.riskLevel}
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {selectedStock && (
        <div 
          className="fixed inset-0 z-[5]" 
          onClick={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
};

export default PortfolioHeatmap;