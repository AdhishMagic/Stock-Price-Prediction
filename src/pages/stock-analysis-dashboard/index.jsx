import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
// Button import removed (sidebar toggle removed)

// Import all components
import StockSearchBar from './components/StockSearchBar';
import DateRangePicker from './components/DateRangePicker';
import PredictionHorizonSelector from './components/PredictionHorizonSelector';
import MetricCards from './components/MetricCards';
import StockChart from './components/StockChart';
import ModelAccuracyMetrics from './components/ModelAccuracyMetrics';
import ComparisonToggle from './components/ComparisonToggle';
import { useModelMetadata, useStockForecast } from '../../api/hooks';
import ExportControls from './components/ExportControls';

const StockAnalysisDashboard = () => {
  // State management
  const [selectedStock, setSelectedStock] = useState(null);
  const [dateRange, setDateRange] = useState({
    preset: '1M',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0],
    endDate: new Date()?.toISOString()?.split('T')?.[0]
  });
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [predictionHorizon, setPredictionHorizon] = useState(7);
  const [customDays, setCustomDays] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Chart control states
  const [viewMode, setViewMode] = useState('overlay');
  const [showHistorical, setShowHistorical] = useState(true);
  const [showPredicted, setShowPredicted] = useState(true);
  // Removed sidebar collapse feature and floating chevron button

  // Mock stock data
  const [stockData, setStockData] = useState({
    currentPrice: '$156.78',
    dailyChange: 2.45,
    dailyChangePercent: 1.58,
    volatility: 0.24,
    volatilityChange: -0.02
  });

  // Mock prediction data
  const [predictionData, setPredictionData] = useState({
    confidence: 87,
    confidenceChange: 3,
    predictedPrice: '$159.23',
    upperBound: '$165.45',
    lowerBound: '$153.01'
  });

  // Simulate real-time updates during market hours
  useEffect(() => {
    const checkMarketHours = () => {
      const now = new Date();
      const currentHour = now?.getHours();
      const currentDay = now?.getDay();
      
      const isWeekday = currentDay >= 1 && currentDay <= 5;
      const isMarketHours = currentHour >= 9 && currentHour < 16;
      
      return isWeekday && isMarketHours;
    };

    const updateData = () => {
      if (selectedStock && checkMarketHours()) {
        setStockData(prev => ({
          ...prev,
          currentPrice: `$${(parseFloat(prev?.currentPrice?.slice(1)) + (Math.random() - 0.5) * 2)?.toFixed(2)}`,
          dailyChange: parseFloat((prev?.dailyChange + (Math.random() - 0.5) * 0.5)?.toFixed(2)),
          dailyChangePercent: parseFloat((prev?.dailyChangePercent + (Math.random() - 0.5) * 0.2)?.toFixed(2))
        }));
        setLastUpdate(new Date());
      }
    };

    const interval = setInterval(updateData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedStock]);

  // Handle stock selection
  const handleStockSelect = async (stock) => {
    if (!stock) {
      setSelectedStock(null);
      return;
    }

    setIsLoading(true);
    setSelectedStock(stock);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update stock data based on selection
      const mockPrice = 100 + Math.random() * 100;
      const mockChange = (Math.random() - 0.5) * 10;
      
      setStockData({
        currentPrice: `$${mockPrice?.toFixed(2)}`,
        dailyChange: parseFloat(mockChange?.toFixed(2)),
        dailyChangePercent: parseFloat((mockChange / mockPrice * 100)?.toFixed(2)),
        volatility: parseFloat((Math.random() * 0.5)?.toFixed(2)),
        volatilityChange: parseFloat(((Math.random() - 0.5) * 0.1)?.toFixed(2))
      });

      setPredictionData({
        confidence: Math.floor(Math.random() * 30) + 70,
        confidenceChange: Math.floor((Math.random() - 0.5) * 10),
        predictedPrice: `$${(mockPrice + (Math.random() - 0.5) * 10)?.toFixed(2)}`,
        upperBound: `$${(mockPrice + Math.random() * 15)?.toFixed(2)}`,
        lowerBound: `$${(mockPrice - Math.random() * 15)?.toFixed(2)}`
      });

      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
      console.error('Failed to fetch stock data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date range changes
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (selectedStock) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleCustomDateChange = (type, value) => {
    if (type === 'start') {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
    }
  };

  // Handle prediction horizon changes
  const handleHorizonChange = (days) => {
    setPredictionHorizon(days);
    if (selectedStock) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const handleCustomDaysChange = (value) => {
    setCustomDays(value);
  };

  // Chart control handlers
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleToggleHistorical = (show) => {
    setShowHistorical(show);
  };

  const handleTogglePredicted = (show) => {
    setShowPredicted(show);
  };

  // Backend integration hooks
  const { data: metadata, isLoading: metaLoading } = useModelMetadata(selectedStock, { enabled: !!selectedStock });
  // Adjust horizon to nearest available if metadata present
  const effectiveHorizon = useMemo(() => {
    if (!metadata?.horizons) return predictionHorizon;
    if (metadata.horizons.includes(predictionHorizon)) return predictionHorizon;
    // pick closest horizon
    const sorted = [...metadata.horizons].sort((a,b)=>a-b);
    let closest = sorted[0];
    let minDiff = Math.abs(predictionHorizon - closest);
    for (const h of sorted) {
      const d = Math.abs(predictionHorizon - h);
      if (d < minDiff) { minDiff = d; closest = h; }
    }
    return closest;
  }, [metadata, predictionHorizon]);

  const { data: forecastData, isLoading: forecastLoading } = useStockForecast({
    ticker: selectedStock,
    horizon: effectiveHorizon,
    recent: 200,
    enabled: !!selectedStock
  });

  const combinedLoading = isLoading || metaLoading || forecastLoading;

  // Feature flag: enable / disable sidebar layout.
  // Accepts values: '1', 'true', 'yes' (case-insensitive) to enable; anything else disables.
  const enableSidebar = (() => {
    const raw = (import.meta?.env?.VITE_ENABLE_STOCK_SIDEBAR ?? '').toString().trim().toLowerCase();
    return ['1','true','yes','on'].includes(raw);
  })();

  return (
    <>
      <Helmet>
        <title>Stock Analysis Dashboard - AI-Powered Stock Predictions</title>
        <meta name="description" content="Advanced stock analysis dashboard with AI-powered price predictions, historical trends, and risk assessment metrics for informed investment decisions." />
        <meta name="keywords" content="stock analysis, AI predictions, financial dashboard, investment tools, market analytics" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Main Content */}
        <main className="pt-16 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
              <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                    Stock Analysis Dashboard
                  </h1>
                  <p className="text-text-secondary">
                    AI-powered predictions and comprehensive market analysis
                  </p>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-success' : 
                    connectionStatus === 'error' ? 'bg-destructive' : 'bg-warning'
                  }`} />
                  <span className="text-sm text-text-secondary">
                    {connectionStatus === 'connected' ? 'Live Data' : 
                     connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  Updated: {lastUpdate?.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Top Controls Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Stock Search */}
              <div className="lg:col-span-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon name="Search" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Stock Search</span>
                  </div>
                  <StockSearchBar
                    selectedStock={selectedStock}
                    onStockSelect={handleStockSelect}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="lg:col-span-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <DateRangePicker
                    selectedRange={dateRange}
                    onRangeChange={handleDateRangeChange}
                    customStartDate={customStartDate}
                    customEndDate={customEndDate}
                    onCustomDateChange={handleCustomDateChange}
                  />
                </div>
              </div>

              {/* Prediction Horizon */}
              <div className="lg:col-span-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <PredictionHorizonSelector
                    selectedHorizon={predictionHorizon}
                    onHorizonChange={handleHorizonChange}
                    customDays={customDays}
                    onCustomDaysChange={handleCustomDaysChange}
                  />
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="mb-8">
                  <MetricCards
                    stockData={stockData}
                    predictionData={predictionData}
                    isLoading={combinedLoading}
                  />
                  {selectedStock && (
                    <div className="mt-4 p-4 border border-border rounded-lg bg-card/50">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Icon name="Database" size={14} className="text-primary" /> Model Output
                      </h3>
                      {combinedLoading && <div className="text-xs text-text-secondary">Loading model data...</div>}
                      {!combinedLoading && forecastData && (
                        <div className="space-y-2">
                          <div className="text-xs text-text-secondary">Horizon: {effectiveHorizon} (requested {predictionHorizon})</div>
                          <div className="text-xs">Predictions (first 3): {forecastData.predictions.slice(0,3).map(p=>p.p50.toFixed(2)).join(', ')}</div>
                          <div className="text-xs">Quantiles: {forecastData.predictions[0] && Object.keys(forecastData.predictions[0]).filter(k=>k.startsWith('p')).join(', ')}</div>
                        </div>
                      )}
                      {!combinedLoading && !forecastData && (
                        <div className="text-xs text-warning">No forecast available.</div>
                      )}
                    </div>
                  )}
            </div>

            {/* Main Chart + Optional Sidebar (feature flag controlled) */}
            {enableSidebar ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
                {/* Main Chart Area */}
                <div className="xl:col-span-8 transition-all duration-300">
                  <StockChart
                    selectedStock={selectedStock}
                    isLoading={isLoading}
                    showPrediction={showPredicted}
                    viewMode={viewMode}
                    historicalData={stockData}
                    predictionData={predictionData}
                  />
                </div>
                {/* Right Sidebar */}
                <div className="xl:col-span-4 transition-all duration-300">
                  <div className="space-y-6">
                    <ModelAccuracyMetrics
                      selectedStock={selectedStock}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <StockChart
                  selectedStock={selectedStock}
                  isLoading={isLoading}
                  showPrediction={showPredicted}
                  viewMode={viewMode}
                  historicalData={stockData}
                  predictionData={predictionData}
                />
                {/* Accuracy metrics moved below chart when sidebar disabled */}
                <div className="mt-6">
                  <ModelAccuracyMetrics
                    selectedStock={selectedStock}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Bottom Controls Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comparison Toggle */}
              <div>
                <ComparisonToggle
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  showHistorical={showHistorical}
                  showPredicted={showPredicted}
                  onToggleHistorical={handleToggleHistorical}
                  onTogglePredicted={handleTogglePredicted}
                  isLoading={isLoading}
                />
              </div>

              {/* Export Controls */}
              <div>
                <ExportControls
                  selectedStock={selectedStock}
                  isLoading={isLoading}
                  historicalData={stockData}
                  predictionData={predictionData}
                />
              </div>
            </div>

            {/* Floating sidebar toggle removed */}
          </div>
        </main>
      </div>
    </>
  );
};

export default StockAnalysisDashboard;