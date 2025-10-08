"""
Generate sample stock data for testing when yfinance is unavailable.
Creates synthetic but realistic OHLCV data with trends and volatility.
"""
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

def generate_stock_data(ticker: str, start_price: float = 100, days: int = 1000, trend: float = 0.0002, volatility: float = 0.02):
    """Generate synthetic stock data with realistic patterns"""
    np.random.seed(hash(ticker) % (2**32))
    
    dates = pd.date_range(end=datetime.now(), periods=days, freq='B')
    
    # Generate returns with trend and volatility
    returns = np.random.normal(trend, volatility, days)
    prices = start_price * np.exp(np.cumsum(returns))
    
    # Generate OHLC from close prices
    data = []
    for i, (date, close) in enumerate(zip(dates, prices)):
        # Add intraday volatility
        daily_vol = abs(np.random.normal(0, volatility * close * 0.5))
        high = close + abs(np.random.normal(0, daily_vol))
        low = close - abs(np.random.normal(0, daily_vol))
        open_price = close + np.random.normal(0, daily_vol * 0.5)
        
        # Ensure OHLC logic is correct
        high = max(high, open_price, close)
        low = min(low, open_price, close)
        
        # Volume with some randomness
        base_volume = 1_000_000
        volume = int(base_volume * (1 + np.random.normal(0, 0.3)))
        
        data.append({
            'date': date,
            'open': round(open_price, 2),
            'high': round(high, 2),
            'low': round(low, 2),
            'close': round(close, 2),
            'volume': max(100_000, volume)
        })
    
    return pd.DataFrame(data)


def main():
    import argparse
    ap = argparse.ArgumentParser(description='Generate sample stock data for testing')
    ap.add_argument('tickers', nargs='+', help='Ticker symbols to generate')
    ap.add_argument('--days', type=int, default=1000, help='Number of trading days')
    ap.add_argument('--start-price', type=float, default=100, help='Starting price')
    args = ap.parse_args()
    
    data_dir = Path(__file__).parent / 'data'
    data_dir.mkdir(parents=True, exist_ok=True)
    
    ticker_configs = {
        'AAPL': {'start_price': 150, 'trend': 0.0003, 'volatility': 0.025},
        'MSFT': {'start_price': 300, 'trend': 0.0004, 'volatility': 0.02},
        'GOOGL': {'start_price': 140, 'trend': 0.0003, 'volatility': 0.022},
        'TSLA': {'start_price': 250, 'trend': 0.0005, 'volatility': 0.04},
        'AMZN': {'start_price': 180, 'trend': 0.0003, 'volatility': 0.025},
        'META': {'start_price': 350, 'trend': 0.0004, 'volatility': 0.03},
        'TEST': {'start_price': 100, 'trend': 0.0002, 'volatility': 0.02},
    }
    
    for ticker in args.tickers:
        ticker_upper = ticker.upper()
        config = ticker_configs.get(ticker_upper, {
            'start_price': args.start_price,
            'trend': 0.0002,
            'volatility': 0.02
        })
        
        df = generate_stock_data(
            ticker_upper,
            days=args.days,
            **config
        )
        
        output_path = data_dir / f'{ticker_upper}.csv'
        df.to_csv(output_path, index=False)
        
        print(f"✓ Generated {ticker_upper}: {len(df)} rows → {output_path}")
        print(f"  Price range: ${df['close'].min():.2f} - ${df['close'].max():.2f}")
        print(f"  Latest close: ${df['close'].iloc[-1]:.2f}")


if __name__ == '__main__':
    main()
