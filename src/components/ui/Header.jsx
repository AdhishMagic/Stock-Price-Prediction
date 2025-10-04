import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [marketStatus, setMarketStatus] = useState('closed');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Stock Analysis',
      path: '/stock-analysis-dashboard',
      icon: 'TrendingUp',
      analyticsId: 'stock-analysis'
    },
    {
      label: 'Portfolio',
      path: '/portfolio-overview',
      icon: 'PieChart',
      analyticsId: 'portfolio'
    },
    {
      label: 'Market Research',
      path: '/market-analytics-hub',
      icon: 'BarChart3',
      analyticsId: 'market-research'
    }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement?.classList?.toggle('dark', savedTheme === 'dark');

    const checkMarketStatus = () => {
      const now = new Date();
      const currentHour = now?.getHours();
      const currentDay = now?.getDay();
      
      const isWeekday = currentDay >= 1 && currentDay <= 5;
      const isMarketHours = currentHour >= 9 && currentHour < 16;
      
      setMarketStatus(isWeekday && isMarketHours ? 'open' : 'closed');
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement?.classList?.toggle('dark', newTheme === 'dark');
  };

  const handleNavigation = (path, analyticsId) => {
    navigate(path);
    if (window.gtag) {
      window.gtag('event', 'navigation', {
        event_category: 'header',
        event_label: analyticsId
      });
    }
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-background border-b border-border">
      <div className="flex items-center h-16 px-6">
        {/* Logo */}
        <div className="flex items-center mr-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              StockPredict
            </span>
          </div>
        </div>

        {/* Market Status Indicator */}
        <div className="flex items-center space-x-2 mr-6">
          <div className={`w-2 h-2 rounded-full ${
            marketStatus === 'open' ? 'bg-success' : 'bg-warning'
          }`} />
          <span className="text-sm text-text-secondary hidden sm:inline">
            Market {marketStatus === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="flex items-center space-x-1 flex-1">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path, item?.analyticsId)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                isActivePath(item?.path)
                  ? 'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span className="hidden md:inline">{item?.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9"
          >
            <Icon 
              name={theme === 'dark' ? 'Sun' : 'Moon'} 
              size={16} 
            />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-9 h-9"
            >
              <Icon name="User" size={16} />
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-elevation z-[1010]">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-text-secondary border-b border-border mb-2">
                    Session Active
                  </div>
                  <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-micro">
                    API Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-micro">
                    Preferences
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-micro">
                    Help & Support
                  </button>
                  <div className="border-t border-border mt-2 pt-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-micro">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-4">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path, item?.analyticsId)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-smooth ${
                isActivePath(item?.path)
                  ? 'text-primary' :'text-text-secondary'
              }`}
            >
              <Icon name={item?.icon} size={20} />
              <span className="text-xs font-medium">{item?.label?.split(' ')?.[0]}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Click outside handler for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-[999]"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;