"""Download historical OHLCV data for one or more tickers using yfinance.
Saves each ticker to backend/data/{TICKER}.csv
"""
from __future__ import annotations
import argparse
from pathlib import Path
import yfinance as yf
import pandas as pd

DATA_DIR = Path(__file__).parent / 'data'


def fetch_ticker(ticker: str, start: str = '2015-01-01', end: str | None = None, interval: str = '1d') -> pd.DataFrame:
    df = yf.download(ticker, start=start, end=end, interval=interval, auto_adjust=True, progress=False)
    if df.empty:
        raise ValueError(f"No data returned for {ticker}")
    df.reset_index(inplace=True)
    df.rename(columns={c: c.lower() for c in df.columns}, inplace=True)
    keep = [c for c in ['date','open','high','low','close','adj close','volume'] if c in df.columns]
    df = df[keep]
    if 'adj close' in df.columns and 'close' in df.columns:
        # prefer adjusted close
        df['close'] = df['adj close']
        df.drop(columns=['adj close'], inplace=True)
    return df


def save(df: pd.DataFrame, ticker: str):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out = DATA_DIR / f"{ticker.upper()}.csv"
    df.to_csv(out, index=False)
    return out


def main():
    ap = argparse.ArgumentParser(description='Download historical stock data')
    ap.add_argument('tickers', nargs='+', help='Ticker symbols e.g. AAPL MSFT GOOGL')
    ap.add_argument('--start', default='2015-01-01')
    ap.add_argument('--end', default=None)
    ap.add_argument('--interval', default='1d')
    args = ap.parse_args()

    for t in args.tickers:
        try:
            df = fetch_ticker(t, start=args.start, end=args.end, interval=args.interval)
            path = save(df, t)
            print(f"Saved {t} -> {path} ({len(df)} rows)")
        except Exception as e:
            print(f"Failed {t}: {e}")

if __name__ == '__main__':
    main()
