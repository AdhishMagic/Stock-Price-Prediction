import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const StockSearchBar = ({ selectedStock, onStockSelect, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Mock stock data for suggestions
  const mockStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
    { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery?.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = mockStocks?.filter(stock =>
          stock?.symbol?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          stock?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
        setSuggestions(filtered?.slice(0, 8));
        setShowSuggestions(true);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleStockSelect = (stock) => {
    setSearchQuery(stock?.symbol);
    setShowSuggestions(false);
    onStockSelect(stock);
  };

  const handleSearch = () => {
    if (searchQuery?.trim()) {
      const exactMatch = mockStocks?.find(
        stock => stock?.symbol?.toLowerCase() === searchQuery?.toLowerCase()
      );
      if (exactMatch) {
        handleStockSelect(exactMatch);
      } else {
        // Handle invalid ticker
        onStockSelect({ symbol: searchQuery?.toUpperCase(), name: 'Unknown Stock', exchange: 'N/A' });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search stocks (e.g., AAPL, Apple)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <Icon name="Loader2" size={16} className="animate-spin text-text-secondary" />
            ) : (
              <Icon name="Search" size={16} className="text-text-secondary" />
            )}
          </div>
        </div>
        <Button
          onClick={handleSearch}
          disabled={!searchQuery?.trim() || isLoading}
          className="px-4"
        >
          <Icon name="Search" size={16} />
        </Button>
      </div>
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions?.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-elevation z-50 max-h-64 overflow-y-auto">
          {suggestions?.map((stock) => (
            <button
              key={stock?.symbol}
              onClick={() => handleStockSelect(stock)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-micro border-b border-border last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">{stock?.symbol}</div>
                  <div className="text-sm text-text-secondary truncate">{stock?.name}</div>
                </div>
                <div className="text-xs text-text-secondary">{stock?.exchange}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {/* Selected Stock Display */}
      {selectedStock && (
        <div className="mt-2 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">{selectedStock?.symbol}</div>
              <div className="text-sm text-text-secondary">{selectedStock?.name}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onStockSelect(null)}
              className="w-6 h-6"
            >
              <Icon name="X" size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearchBar;