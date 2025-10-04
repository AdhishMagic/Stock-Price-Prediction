import React, { useEffect } from 'react';
import Header from '../../components/ui/Header';
import PortfolioControls from './components/PortfolioControls';
import PortfolioKPICards from './components/PortfolioKPICards';
import PortfolioHeatmap from './components/PortfolioHeatmap';
import WatchlistPanel from './components/WatchlistPanel';
import PositionsTable from './components/PositionsTable';

const PortfolioOverview = () => {
  useEffect(() => {
    document.title = 'Portfolio Overview - StockPredict';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Portfolio Overview
            </h1>
            <p className="text-text-secondary">
              Monitor your portfolio performance with AI-powered predictions and risk analysis
            </p>
          </div>

          {/* Portfolio Controls */}
          <PortfolioControls />

          {/* KPI Cards */}
          <PortfolioKPICards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
            {/* Portfolio Heatmap - Takes 3 columns on xl screens */}
            <div className="xl:col-span-3">
              <PortfolioHeatmap />
            </div>

            {/* Watchlist Panel - Takes 1 column on xl screens */}
            <div className="xl:col-span-1">
              <WatchlistPanel />
            </div>
          </div>

          {/* Positions Table */}
          <PositionsTable />
        </div>
      </main>
    </div>
  );
};

export default PortfolioOverview;