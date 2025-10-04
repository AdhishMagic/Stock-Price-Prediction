"""Feature engineering for stock time-series suitable for tree-based models.
Generates lag features, rolling statistics, technical indicators.
"""
from __future__ import annotations
import pandas as pd
import numpy as np

LAGS = [1,2,3,5,7,10,14,21,30]
ROLLS = [5,10,14,20,30]


def add_returns(df: pd.DataFrame) -> pd.DataFrame:
    df['return_1'] = df['close'].pct_change()
    df['log_return_1'] = np.log1p(df['return_1'])
    df['return_5'] = df['close'].pct_change(5)
    return df


def add_lags(df: pd.DataFrame) -> pd.DataFrame:
    for l in LAGS:
        df[f'lag_{l}'] = df['close'].shift(l)
    return df


def add_rolling(df: pd.DataFrame) -> pd.DataFrame:
    for w in ROLLS:
        df[f'roll_mean_{w}'] = df['close'].rolling(w).mean()
        df[f'roll_std_{w}'] = df['close'].rolling(w).std()
    return df


def add_rsi(df: pd.DataFrame, window: int = 14) -> pd.DataFrame:
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    return df


def add_macd(df: pd.DataFrame, fast: int =12, slow: int =26, signal: int =9) -> pd.DataFrame:
    ema_fast = df['close'].ewm(span=fast, adjust=False).mean()
    ema_slow = df['close'].ewm(span=slow, adjust=False).mean()
    macd = ema_fast - ema_slow
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    df['macd'] = macd
    df['macd_signal'] = signal_line
    df['macd_hist'] = macd - signal_line
    return df


def add_bollinger(df: pd.DataFrame, window: int =20, k: float =2.0) -> pd.DataFrame:
    ma = df['close'].rolling(window).mean()
    std = df['close'].rolling(window).std()
    df['bb_mid'] = ma
    df['bb_upper'] = ma + k * std
    df['bb_lower'] = ma - k * std
    return df


def add_calendar(df: pd.DataFrame) -> pd.DataFrame:
    df['dayofweek'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    return df


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # ensure date type
    if not np.issubdtype(df['date'].dtype, np.datetime64):
        df['date'] = pd.to_datetime(df['date'])
    df = add_returns(df)
    df = add_lags(df)
    df = add_rolling(df)
    df = add_rsi(df)
    df = add_macd(df)
    df = add_bollinger(df)
    df = add_calendar(df)
    df.sort_values('date', inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


def feature_target(df: pd.DataFrame, horizon: int = 1) -> tuple[pd.DataFrame, pd.Series]:
    # target: close shifted -horizon forward (predict future close)
    df['target'] = df['close'].shift(-horizon)
    feat_cols = [c for c in df.columns if c not in {'target'} and df[c].dtype != 'O']
    X = df[feat_cols]
    y = df['target']
    X = X.iloc[:-horizon]
    y = y.iloc[:-horizon]
    return X, y

__all__ = ['build_features','feature_target']
