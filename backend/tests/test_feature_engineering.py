import pandas as pd
from backend.feature_engineering import build_features, feature_target

def test_build_features_basic():
    data = {
        'date': pd.date_range('2024-01-01', periods=120, freq='B'),
        'close': [100 + i*0.1 for i in range(120)],
        'open': [100 + i*0.1 for i in range(120)],
        'high': [100 + i*0.1 + 1 for i in range(120)],
        'low': [100 + i*0.1 - 1 for i in range(120)],
        'volume': [1_000_000 + i*10 for i in range(120)],
    }
    df = pd.DataFrame(data)
    feats = build_features(df)
    assert 'rsi' in feats.columns
    assert 'macd' in feats.columns
    assert feats['rsi'].notna().sum() > 0

def test_feature_target_alignment():
    data = {
        'date': pd.date_range('2024-01-01', periods=50, freq='B'),
        'close': [100 + i for i in range(50)],
        'open': [100 + i for i in range(50)],
        'high': [101 + i for i in range(50)],
        'low': [99 + i for i in range(50)],
        'volume': [1_000_000 for _ in range(50)],
    }
    df = pd.DataFrame(data)
    feats = build_features(df).dropna().reset_index(drop=True)
    X, y = feature_target(feats, horizon=5)
    assert len(X) == len(y)
    # ensure horizon shift
    assert y.iloc[0] == feats['close'].iloc[0+5]
