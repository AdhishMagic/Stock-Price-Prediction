import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExportControls = ({ selectedStock, historicalData, predictionData, isLoading }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportType, setExportType] = useState('all');

  const exportFormats = [
    { id: 'csv', label: 'CSV', icon: 'FileText', description: 'Comma-separated values' },
    { id: 'json', label: 'JSON', icon: 'Code', description: 'JavaScript Object Notation' },
    { id: 'xlsx', label: 'Excel', icon: 'FileSpreadsheet', description: 'Microsoft Excel format' }
  ];

  const exportTypes = [
    { id: 'all', label: 'All Data', description: 'Historical + Predictions' },
    { id: 'historical', label: 'Historical Only', description: 'Past price data' },
    { id: 'predictions', label: 'Predictions Only', description: 'Future forecasts' }
  ];

  const generateMockData = () => {
    const mockHistorical = [];
    const mockPredictions = [];
    
    // Generate mock historical data
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date?.setDate(date?.getDate() - i);
      
      mockHistorical?.push({
        date: date?.toISOString()?.split('T')?.[0],
        symbol: selectedStock?.symbol || 'AAPL',
        open: (150 + Math.random() * 10)?.toFixed(2),
        high: (155 + Math.random() * 10)?.toFixed(2),
        low: (145 + Math.random() * 10)?.toFixed(2),
        close: (150 + Math.random() * 10)?.toFixed(2),
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    
    // Generate mock prediction data
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date?.setDate(date?.getDate() + i);
      
      mockPredictions?.push({
        date: date?.toISOString()?.split('T')?.[0],
        symbol: selectedStock?.symbol || 'AAPL',
        predicted_price: (150 + Math.random() * 10)?.toFixed(2),
        upper_bound: (160 + Math.random() * 5)?.toFixed(2),
        lower_bound: (140 + Math.random() * 5)?.toFixed(2),
        confidence: (85 + Math.random() * 10)?.toFixed(1)
      });
    }
    
    return { historical: mockHistorical, predictions: mockPredictions };
  };

  const convertToCSV = (data, type) => {
    if (!data || data?.length === 0) return '';
    
    const headers = Object.keys(data?.[0])?.join(',');
    const rows = data?.map(row => Object.values(row)?.join(','));
    
    return [headers, ...rows]?.join('\n');
  };

  const convertToJSON = (data, type) => {
    return JSON.stringify({
      symbol: selectedStock?.symbol || 'N/A',
      export_date: new Date()?.toISOString(),
      data_type: type,
      data: data
    }, null, 2);
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!selectedStock) return;
    
    setIsExporting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = generateMockData();
      let dataToExport = [];
      let filename = '';
      
      switch (exportType) {
        case 'historical':
          dataToExport = mockData?.historical;
          filename = `${selectedStock?.symbol}_historical`;
          break;
        case 'predictions':
          dataToExport = mockData?.predictions;
          filename = `${selectedStock?.symbol}_predictions`;
          break;
        case 'all':
        default:
          dataToExport = {
            historical: mockData?.historical,
            predictions: mockData?.predictions
          };
          filename = `${selectedStock?.symbol}_complete`;
          break;
      }
      
      const timestamp = new Date()?.toISOString()?.split('T')?.[0];
      filename += `_${timestamp}`;
      
      let content = '';
      let mimeType = '';
      
      switch (exportFormat) {
        case 'csv':
          if (exportType === 'all') {
            content = 'HISTORICAL DATA\n' + convertToCSV(dataToExport?.historical, 'historical') + 
                     '\n\nPREDICTION DATA\n' + convertToCSV(dataToExport?.predictions, 'predictions');
          } else {
            content = convertToCSV(dataToExport, exportType);
          }
          mimeType = 'text/csv';
          filename += '.csv';
          break;
        case 'json':
          content = convertToJSON(dataToExport, exportType);
          mimeType = 'application/json';
          filename += '.json';
          break;
        case 'xlsx':
          // For demo purposes, export as CSV with Excel extension
          if (exportType === 'all') {
            content = 'HISTORICAL DATA\n' + convertToCSV(dataToExport?.historical, 'historical') + 
                     '\n\nPREDICTION DATA\n' + convertToCSV(dataToExport?.predictions, 'predictions');
          } else {
            content = convertToCSV(dataToExport, exportType);
          }
          mimeType = 'application/vnd.ms-excel';
          filename += '.xlsx';
          break;
      }
      
      downloadFile(content, filename, mimeType);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Download" size={20} className="text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Export Data</h3>
          <p className="text-sm text-text-secondary">
            Download analysis data for {selectedStock?.symbol || 'selected stock'}
          </p>
        </div>
      </div>
      {!selectedStock ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon name="FileX" size={48} className="text-text-secondary mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No Stock Selected</h4>
          <p className="text-text-secondary">Select a stock to enable data export</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="FileType" size={16} className="text-text-secondary" />
              <span className="text-sm font-medium text-foreground">Export Format</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {exportFormats?.map((format) => (
                <button
                  key={format?.id}
                  onClick={() => setExportFormat(format?.id)}
                  disabled={isLoading || isExporting}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-smooth text-left ${
                    exportFormat === format?.id
                      ? 'bg-primary/10 border-primary/20 text-primary' :'bg-muted border-border text-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon name={format?.icon} size={16} />
                  <div className="flex-1">
                    <div className="font-medium">{format?.label}</div>
                    <div className="text-xs text-text-secondary">{format?.description}</div>
                  </div>
                  {exportFormat === format?.id && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Export Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="Database" size={16} className="text-text-secondary" />
              <span className="text-sm font-medium text-foreground">Data Type</span>
            </div>
            
            <div className="space-y-2">
              {exportTypes?.map((type) => (
                <button
                  key={type?.id}
                  onClick={() => setExportType(type?.id)}
                  disabled={isLoading || isExporting}
                  className={`flex items-center justify-between w-full p-3 rounded-lg border transition-smooth text-left ${
                    exportType === type?.id
                      ? 'bg-primary/10 border-primary/20 text-primary' :'bg-muted border-border text-foreground hover:bg-muted/80'
                  }`}
                >
                  <div>
                    <div className="font-medium">{type?.label}</div>
                    <div className="text-xs text-text-secondary">{type?.description}</div>
                  </div>
                  {exportType === type?.id && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4 border-t border-border">
            <Button
              onClick={handleExport}
              disabled={isLoading || isExporting || !selectedStock}
              loading={isExporting}
              className="w-full"
              iconName="Download"
              iconPosition="left"
            >
              {isExporting ? 'Exporting...' : `Export ${exportFormat?.toUpperCase()}`}
            </Button>
          </div>

          {/* Export Info */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div className="text-xs text-text-secondary">
                <div className="font-medium text-foreground mb-1">Export Information</div>
                <div className="space-y-1">
                  <div>• Historical data includes OHLCV (Open, High, Low, Close, Volume)</div>
                  <div>• Prediction data includes forecasted prices with confidence intervals</div>
                  <div>• All timestamps are in UTC format</div>
                  <div>• File will be downloaded to your default download folder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportControls;