import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import MarketAnalyticsHub from './pages/market-analytics-hub';
import StockAnalysisDashboard from './pages/stock-analysis-dashboard';
import PortfolioOverview from './pages/portfolio-overview';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<StockAnalysisDashboard />} />
        <Route path="/market-analytics-hub" element={<MarketAnalyticsHub />} />
        <Route path="/stock-analysis-dashboard" element={<StockAnalysisDashboard />} />
        <Route path="/portfolio-overview" element={<PortfolioOverview />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
