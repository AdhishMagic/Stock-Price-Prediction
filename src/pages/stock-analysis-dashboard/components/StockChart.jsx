import React, { useState, useMemo } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StockChart = ({ 
  historicalData, 
  predictionData, 
  selectedStock, 
  isLoading, 
  showPrediction = true,
  chartType = 'line' 
}) => {
  const [zoomDomain, setZoomDomain] = useState(null);
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Mock historical data
  const mockHistoricalData = useMemo(() => {
    if (!selectedStock) return [];
    
    const data = [];
    const basePrice = 150;
    const startDate = new Date();
    startDate?.setDate(startDate?.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date?.setDate(date?.getDate() + i);
      
      const randomChange = (Math.random() - 0.5) * 10;
      const price = basePrice + randomChange + (Math.sin(i / 5) * 5);
      
      data?.push({
        date: date?.toISOString()?.split('T')?.[0],
        timestamp: date?.getTime(),
        price: parseFloat(price?.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 500000,
        high: parseFloat((price + Math.random() * 3)?.toFixed(2)),
        low: parseFloat((price - Math.random() * 3)?.toFixed(2)),
        open: parseFloat((price + (Math.random() - 0.5) * 2)?.toFixed(2)),
        close: parseFloat(price?.toFixed(2))
      });
    }
    return data;
  }, [selectedStock]);

  // Mock prediction data
  const mockPredictionData = useMemo(() => {
    if (!selectedStock || !mockHistoricalData?.length) return [];
    
    const lastPrice = mockHistoricalData?.[mockHistoricalData?.length - 1]?.price;
    const data = [];
    const predictionDays = 7;

    for (let i = 1; i <= predictionDays; i++) {
      const date = new Date();
      date?.setDate(date?.getDate() + i);
      
      const trend = Math.sin(i / 3) * 2;
      const noise = (Math.random() - 0.5) * 3;
      const predictedPrice = lastPrice + trend + noise;
      
      const confidence = Math.max(60, 95 - (i * 5));
      const confidenceRange = predictedPrice * (0.05 + (i * 0.01));
      
      data?.push({
        date: date?.toISOString()?.split('T')?.[0],
        timestamp: date?.getTime(),
        predicted: parseFloat(predictedPrice?.toFixed(2)),
        upperBound: parseFloat((predictedPrice + confidenceRange)?.toFixed(2)),
        lowerBound: parseFloat((predictedPrice - confidenceRange)?.toFixed(2)),
        confidence: parseFloat(confidence?.toFixed(1)),
        isPrediction: true
      });
    }
    return data;
  }, [selectedStock, mockHistoricalData]);

  // Combine historical and prediction data
  const chartData = useMemo(() => {
    const historical = mockHistoricalData?.map(item => ({
      ...item,
      isPrediction: false
    }));
    
    if (showPrediction && mockPredictionData?.length > 0) {
      return [...historical, ...mockPredictionData];
    }
    
    return historical;
  }, [mockHistoricalData, mockPredictionData, showPrediction]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      const isHistorical = !data?.isPrediction;
      
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-elevation">
          <div className="text-sm font-medium text-foreground mb-2">
            {new Date(label)?.toLocaleDateString()}
          </div>
          {isHistorical ? (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Price:</span>
                <span className="font-semibold text-foreground">${data?.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Volume:</span>
                <span className="text-foreground">{data?.volume?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">High:</span>
                <span className="text-success">${data?.high}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Low:</span>
                <span className="text-destructive">${data?.low}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Predicted:</span>
                <span className="font-semibold text-primary">${data?.predicted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Confidence:</span>
                <span className="text-foreground">{data?.confidence}%</span>
              </div>
              {showConfidenceBands && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Upper:</span>
                    <span className="text-success">${data?.upperBound}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Lower:</span>
                    <span className="text-destructive">${data?.lowerBound}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleZoomReset = () => {
    setZoomDomain(null);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-32 h-6 bg-muted rounded"></div>
            <div className="flex space-x-2">
              <div className="w-20 h-8 bg-muted rounded"></div>
              <div className="w-20 h-8 bg-muted rounded"></div>
            </div>
          </div>
          <div className="w-full h-80 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!selectedStock) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <Icon name="TrendingUp" size={48} className="text-text-secondary mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Select a Stock to View Chart
          </h3>
          <p className="text-text-secondary">
            Use the search bar above to find and select a stock for analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {selectedStock?.symbol} Price Chart
            </h3>
            <p className="text-sm text-text-secondary">{selectedStock?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showConfidenceBands ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowConfidenceBands(!showConfidenceBands)}
            className="text-xs"
          >
            <Icon name="Target" size={14} className="mr-1" />
            Confidence Bands
          </Button>
          
          {zoomDomain && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomReset}
              className="text-xs"
            >
              <Icon name="ZoomOut" size={14} className="mr-1" />
              Reset Zoom
            </Button>
          )}
        </div>
      </div>
      {/* Chart Container */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(e) => setActiveTooltip(e)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date"
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickFormatter={(value) => new Date(value)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickFormatter={(value) => `$${value?.toFixed(0)}`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Historical Price Line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name="Historical Price"
            />
            
            {/* Prediction Line */}
            {showPrediction && (
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="var(--color-accent)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
                name="Predicted Price"
              />
            )}
            
            {/* Confidence Bands */}
            {showPrediction && showConfidenceBands && (
              <>
                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke="var(--color-success)"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  dot={false}
                  connectNulls={false}
                  name="Upper Bound"
                />
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="var(--color-destructive)"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  dot={false}
                  connectNulls={false}
                  name="Lower Bound"
                />
              </>
            )}
            
            {/* Current Date Reference Line */}
            <ReferenceLine 
              x={new Date()?.toISOString()?.split('T')?.[0]} 
              stroke="var(--color-warning)" 
              strokeDasharray="2 2"
              label={{ value: "Today", position: "top" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-primary"></div>
          <span className="text-xs text-text-secondary">Historical Price</span>
        </div>
        {showPrediction && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-accent" style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--color-accent) 0, var(--color-accent) 3px, transparent 3px, transparent 6px)' }}></div>
              <span className="text-xs text-text-secondary">Predicted Price</span>
            </div>
            {showConfidenceBands && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-success opacity-60"></div>
                  <span className="text-xs text-text-secondary">Upper Bound</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-destructive opacity-60"></div>
                  <span className="text-xs text-text-secondary">Lower Bound</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StockChart;