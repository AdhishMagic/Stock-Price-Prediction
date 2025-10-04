import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import MarketMetricsStrip from './components/MarketMetricsStrip';
import GlobalControls from './components/GlobalControls';
import MarketVisualization from './components/MarketVisualization';
import SectorBreakdown from './components/SectorBreakdown';
import ModelPerformance from './components/ModelPerformance';
import CorrelationMatrix from './components/CorrelationMatrix';
import Icon from '../../components/AppIcon';

const MarketAnalyticsHub = () => {
  const [filters, setFilters] = useState({
    sector: 'all',
    volatility: 'all',
    timeRange: '30d',
    modelComparison: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Simulate initial data loading
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      setLastUpdated(new Date());
    };

    loadData();
  }, []);

  useEffect(() => {
    // Update data when filters change
    const updateData = async () => {
      // Simulate filter-based data refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastUpdated(new Date());
    };

    updateData();
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setLastUpdated(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Loading Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded-lg w-64 animate-pulse" />
                <div className="h-4 bg-muted rounded w-96 animate-pulse" />
              </div>
              <div className="h-10 bg-muted rounded-lg w-32 animate-pulse" />
            </div>

            {/* Loading Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {[...Array(6)]?.map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                    <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-12 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Controls */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="h-6 bg-muted rounded w-32 animate-pulse mb-4" />
              <div className="flex space-x-4">
                {[...Array(3)]?.map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded w-40 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Loading Chart */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="h-6 bg-muted rounded w-40 animate-pulse mb-4" />
              <div className="h-96 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* Loading Sidebars */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="h-6 bg-muted rounded w-32 animate-pulse mb-4" />
                <div className="space-y-3">
                  {[...Array(4)]?.map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="h-6 bg-muted rounded w-32 animate-pulse mb-4" />
                <div className="space-y-3">
                  {[...Array(4)]?.map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Market Analytics Hub</h1>
              <p className="text-text-secondary">
                Comprehensive market trend analysis and model performance validation for quantitative research
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Icon name="Clock" size={16} />
                <span>Updated {lastUpdated?.toLocaleTimeString()}</span>
              </div>
              
              <button
                onClick={handleRefreshData}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
              >
                <Icon name="RefreshCw" size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Market Metrics Strip */}
          <MarketMetricsStrip />

          {/* Global Controls */}
          <GlobalControls onFiltersChange={handleFiltersChange} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-24 gap-6 mb-6">
            {/* Left Sidebar - Sector Breakdown */}
            <div className="xl:col-span-6">
              <SectorBreakdown />
            </div>

            {/* Main Visualization */}
            <div className="xl:col-span-12">
              <MarketVisualization />
            </div>

            {/* Right Sidebar - Model Performance */}
            <div className="xl:col-span-6">
              <ModelPerformance />
            </div>
          </div>

          {/* Correlation Matrix */}
          <div className="mb-6">
            <CorrelationMatrix />
          </div>

          {/* Additional Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Support & Resistance Levels */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Support & Resistance</h3>
                <Icon name="TrendingUp" size={20} className="text-primary" />
              </div>
              
              <div className="space-y-4">
                {[
                  { level: 'Strong Resistance', price: 4520, confidence: 92, type: 'resistance' },
                  { level: 'Support Level', price: 4380, confidence: 87, type: 'support' },
                  { level: 'Weak Resistance', price: 4450, confidence: 73, type: 'resistance' },
                  { level: 'Strong Support', price: 4320, confidence: 89, type: 'support' }
                ]?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item?.type === 'resistance' ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <div className="font-medium text-foreground">{item?.level}</div>
                        <div className="text-sm text-text-secondary">${item?.price?.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{item?.confidence}%</div>
                      <div className="text-xs text-text-secondary">Confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Risk Assessment</h3>
                <Icon name="Shield" size={20} className="text-primary" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Market Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div className="w-3/5 h-2 bg-yellow-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Medium</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Volatility Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div className="w-2/5 h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Low</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Liquidity Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div className="w-1/5 h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Very Low</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Model Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div className="w-3/5 h-2 bg-yellow-500 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Medium</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">Risk Alert</div>
                    <div className="text-text-secondary">
                      Increased volatility expected in Energy sector due to geopolitical factors.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export & Research Tools */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Research Tools & Export</h3>
              <div className="flex items-center space-x-2">
                <Icon name="Database" size={16} className="text-success" />
                <span className="text-sm text-success">Real-time data active</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center space-x-2 p-4 border border-border rounded-lg hover:border-primary/50 transition-smooth">
                <Icon name="Download" size={20} className="text-primary" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Export Dataset</div>
                  <div className="text-xs text-text-secondary">CSV, JSON, Excel</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-4 border border-border rounded-lg hover:border-primary/50 transition-smooth">
                <Icon name="FileText" size={20} className="text-primary" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Research Report</div>
                  <div className="text-xs text-text-secondary">PDF, DOCX</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-4 border border-border rounded-lg hover:border-primary/50 transition-smooth">
                <Icon name="BarChart3" size={20} className="text-primary" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Model Metrics</div>
                  <div className="text-xs text-text-secondary">Performance data</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-4 border border-border rounded-lg hover:border-primary/50 transition-smooth">
                <Icon name="Share2" size={20} className="text-primary" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Share Analysis</div>
                  <div className="text-xs text-text-secondary">Link, embed</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalyticsHub;