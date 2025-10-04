"""Train LightGBM quantile models for multi-step forecasting.
Enhancements:
1. Pinball (quantile) loss logging per step & quantile
2. Optional multi-horizon training (e.g. 5,10,30) in a single run storing models in subfolders:
    backend/models/{TICKER}/H{h}/step_{step}_q{quant}.pkl
3. Backward compatible when single --horizon provided.

Metadata now stores: { ticker, horizons:[...], default_horizon, metrics:{Hxx:{step_1:{q10_mae,..,q10_pinball:..},...}}, quantiles }
"""
from __future__ import annotations
import argparse, json, time
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import mean_absolute_error
import lightgbm as lgb
from feature_engineering import build_features

MODELS_DIR = Path(__file__).parent / 'models'
DATA_DIR = Path(__file__).parent / 'data'

QUANTILES = [0.1, 0.5, 0.9]

def pinball_loss(y_true, y_pred, q: float):
    diff = y_true - y_pred
    return float(np.mean(np.maximum(q*diff, (q-1)*diff)))

def prepare(df: pd.DataFrame) -> pd.DataFrame:
    df = build_features(df)
    # drop rows with NA created by indicators
    df = df.dropna().reset_index(drop=True)
    return df


def make_targets(df: pd.DataFrame, horizon: int) -> list[pd.Series]:
    targets = []
    for h in range(1, horizon+1):
        targets.append(df['close'].shift(-h))
    # align sizes (drop last horizon rows)
    for i in range(len(targets)):
        targets[i] = targets[i].iloc[:-horizon]
    return targets


def align_features(df: pd.DataFrame, horizon: int) -> pd.DataFrame:
    return df.iloc[:-horizon].reset_index(drop=True)


def train_step(X: pd.DataFrame, y: pd.Series, quantile: float, step: int, out_dir: Path, params_base: dict):
    params = params_base.copy()
    params.update({
        'objective': 'quantile',
        'alpha': quantile,
    })
    lgb_train = lgb.Dataset(X, y)
    model = lgb.train(params, lgb_train, num_boost_round=500, verbose_eval=False)
    out_path = out_dir / f'step_{step}_q{int(quantile*100)}.pkl'
    joblib.dump(model, out_path)
    return model, out_path


def main():
    ap = argparse.ArgumentParser(description='Train LightGBM quantile models per horizon step (supports multi-horizon)')
    ap.add_argument('ticker')
    ap.add_argument('--horizon', type=int, default=None, help='Single horizon (deprecated if --horizons provided)')
    ap.add_argument('--horizons', type=str, default=None, help='Comma separated horizons e.g. 5,10,30')
    ap.add_argument('--learning_rate', type=float, default=0.05)
    ap.add_argument('--seed', type=int, default=42)
    args = ap.parse_args()

    csv_path = DATA_DIR / f"{args.ticker.upper()}.csv"
    if not csv_path.exists():
        raise SystemExit(f"Data file not found: {csv_path}. Run data_fetch.py first.")

    df = pd.read_csv(csv_path, parse_dates=['date'])
    df = prepare(df)

    feature_cols = [c for c in df.columns if c not in {'date'}]

    if args.horizons:
        horizons = sorted({int(h.strip()) for h in args.horizons.split(',') if h.strip()})
    else:
        if args.horizon is None:
            args.horizon = 30
        horizons = [args.horizon]
    default_horizon = horizons[-1]

    ticker_root = MODELS_DIR / args.ticker.upper()
    ticker_root.mkdir(parents=True, exist_ok=True)

    params_base = {
        'learning_rate': args.learning_rate,
        'feature_fraction': 0.9,
        'bagging_fraction': 0.9,
        'bagging_freq': 1,
        'num_leaves': 64,
        'min_data_in_leaf': 30,
        'max_depth': -1,
        'seed': args.seed,
        'verbosity': -1,
        'metric': 'quantile'
    }

    all_metrics = {}
    start_global = time.time()
    for H in horizons:
        print(f"=== Training horizon {H} ===")
        targets = make_targets(df, H)
        X_all = align_features(df[feature_cols], H)
        horizon_dir = ticker_root / f'H{H}'
        horizon_dir.mkdir(exist_ok=True)
        metrics = {}
        start = time.time()
        for step, y in enumerate(targets, start=1):
            step_metrics = {}
            split_idx = int(len(X_all) * 0.9)
            X_tr, X_val = X_all.iloc[:split_idx], X_all.iloc[split_idx:]
            y_tr, y_val = y.iloc[:split_idx], y.iloc[split_idx:]
            for q in QUANTILES:
                model, path = train_step(X_tr, y_tr, q, step, horizon_dir, params_base)
                pred_val = model.predict(X_val)
                mae = mean_absolute_error(y_val, pred_val)
                pb = pinball_loss(y_val.values, pred_val, q)
                prefix = f'q{int(q*100)}'
                step_metrics[f'{prefix}_mae'] = mae
                step_metrics[f'{prefix}_pinball'] = pb
            metrics[f'step_{step}'] = step_metrics
            print(f"H{H} step {step}/{H} metrics: {step_metrics}")
        all_metrics[f'H{H}'] = metrics
        print(f"Finished horizon {H} in {time.time()-start:.1f}s")

    meta = {
        'ticker': args.ticker.upper(),
        'horizons': horizons,
        'default_horizon': default_horizon,
        'quantiles': QUANTILES,
        'feature_cols': feature_cols,
        'metrics': all_metrics,
        'trained_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'rows': len(df)
    }
    with open(ticker_root / 'metadata.json', 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"Saved metadata to {ticker_root / 'metadata.json'} in {time.time()-start_global:.1f}s")

if __name__ == '__main__':
    main()
