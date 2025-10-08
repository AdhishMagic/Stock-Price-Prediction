"""FastAPI service exposing /api/predict using quantile LightGBM per-step models.
Usage (recommended offline-safe launch):
    set OFFLINE_MODE=1  (Windows cmd) or $env:OFFLINE_MODE=1 (PowerShell)
    python -m uvicorn backend.predict_service:app --port 8000 --reload

Endpoint:
POST /api/predict
{
  "ticker": "AAPL",
  "horizon": 30,
  "recent": 200  # number of recent historical rows to return
}
Response:
{
  "ticker": "AAPL",
  "historical": [{"date": "2024-09-01", "close": 123.4}, ...],
  "predictions": [
     {"date": "2024-10-01", "p10": 120.1, "p50": 123.0, "p90": 125.8}, ...
  ],
  "metrics": {"step_1": {"q10_mae": ..}, ...}
}
"""
from __future__ import annotations
from pathlib import Path
from datetime import datetime
import os

import pandas as pd
import joblib  # retained only if future per-call loading needed (can be removed later)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import yfinance as yf

import sys
if __package__ is None and __name__ != "backend.predict_service":
    # ensure project root and backend directory are on sys.path for direct execution
    root = Path(__file__).resolve().parent.parent
    if str(root) not in sys.path:
        sys.path.append(str(root))
    backend_dir = Path(__file__).resolve().parent
    if str(backend_dir) not in sys.path:
        sys.path.append(str(backend_dir))

from backend.feature_engineering import build_features
from backend.utils.model_loader import load_models, load_metadata

MODELS_DIR = Path(__file__).parent / 'models'

app = FastAPI(title='Stock Forecast API', version='0.1.0')

# Permissive CORS (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

class PredictRequest(BaseModel):
    ticker: str
    horizon: int = Field(30, ge=1, le=365, description='Forecast horizon (business days)')
    recent: int = Field(200, ge=50, le=2000, description='Recent historical rows to return')


def download_latest(ticker: str):
    offline_mode = os.getenv('OFFLINE_MODE', '0') in ('1','true','TRUE','yes','YES')
    if offline_mode:
        # Use local CSV if exists
        csv_path = Path(__file__).parent / 'data' / f'{ticker.upper()}.csv'
        if csv_path.exists():
            df = pd.read_csv(csv_path, parse_dates=['date'])
            return df
    try:
        df = yf.download(ticker, period='3y', auto_adjust=True, progress=False)
        if df.empty:
            raise ValueError('empty download')
        df.reset_index(inplace=True)
        df.rename(columns={c: c.lower() for c in df.columns}, inplace=True)
        keep = [c for c in ['date','open','high','low','close','adj close','volume'] if c in df.columns]
        df = df[keep]
        if 'adj close' in df.columns and 'close' in df.columns:
            df['close'] = df['adj close']
            df.drop(columns=['adj close'], inplace=True)
        return df
    except Exception:
        # fallback to local CSV or synthetic minimal stub
        csv_path = Path(__file__).parent / 'data' / f'{ticker.upper()}.csv'
        if csv_path.exists():
            df = pd.read_csv(csv_path, parse_dates=['date'])
            return df
        # synthetic small dataset (last resort)
        dates = pd.date_range(end=pd.Timestamp.today(), periods=120, freq='B')
        import numpy as np
        base = 100 + np.cumsum(np.random.normal(0, 1, size=len(dates))) * 0.3
        df = pd.DataFrame({
            'date': dates,
            'open': base + np.random.normal(0, 0.5, size=len(dates)),
            'high': base + np.random.random(len(dates)),
            'low': base - np.random.random(len(dates)),
            'close': base,
            'volume': np.random.randint(200_000, 1_000_000, size=len(dates))
        })
        return df


def forecast(ticker: str, horizon: int, recent: int):
    t = ticker.upper()
    meta = load_metadata(t)
    # multi-horizon aware
    if 'horizons' in meta:
        horizons = meta['horizons']
        chosen_h = horizon
        horizon_note = None
        if horizon not in horizons:
            # graceful fallback: pick closest larger; if none larger, pick max
            larger = [h for h in horizons if h >= horizon]
            if larger:
                chosen_h = min(larger)
            else:
                chosen_h = max(horizons)
            horizon_note = f"Requested horizon {horizon} not available; using {chosen_h} from {horizons}"
        metrics_root = meta.get('metrics', {}).get(f'H{chosen_h}', {})
        bundle = load_models(t, horizon=chosen_h)
        feature_cols = meta['feature_cols']
    else:
        if horizon != meta['horizon']:
            horizon_note = f"Model trained only for horizon {meta['horizon']}; overriding request {horizon}"
        else:
            horizon_note = None
        metrics_root = meta.get('metrics', {})
        bundle = load_models(t)
        feature_cols = meta['feature_cols']

    df = download_latest(t)
    df_feat = build_features(df).dropna().reset_index(drop=True)

    # We'll need the last full feature row as base for iterative approach is not required
    # since we trained direct step models: we just reuse the same last feature vector.
    # If you want step-dependent re-feature engineering, you'd need a recursive approach.

    latest_feat_row = df_feat.iloc[-1]
    X_last = latest_feat_row[feature_cols].values.reshape(1, -1)

    preds = []
    last_date = pd.to_datetime(df_feat.iloc[-1]['date'])
    for step in range(1, bundle.horizon+1):
        step_record = {'date': (last_date + pd.tseries.offsets.BDay(step)).date().isoformat()}
        for q in meta['quantiles']:
            val = bundle.predict_step_quantile(step, q, X_last)
            step_record[f'p{int(q*100)}'] = val
        preds.append(step_record)

    hist = df[['date','close']].tail(recent)
    hist['date'] = pd.to_datetime(hist['date']).dt.date.astype(str)
    historical = hist.to_dict(orient='records')

    resp = {
        'ticker': t,
        'horizon': bundle.horizon,
        'historical': historical,
        'predictions': preds,
        'metrics': metrics_root
    }
    if 'horizons' in meta and horizon not in meta['horizons']:
        resp['note'] = horizon_note
    if 'horizons' not in meta and horizon != meta.get('horizon'):
        resp['note'] = horizon_note
    return resp

@app.post('/api/predict')
async def predict(req: PredictRequest):
    try:
        return forecast(req.ticker, req.horizon, req.recent)
    except FileNotFoundError:
        raise HTTPException(404, 'Model not trained for this ticker – train first.')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get('/health')
async def health():
    return {'status': 'ok', 'time': datetime.utcnow().isoformat()}

@app.get('/api/models/{ticker}')
async def model_metadata(ticker: str):
    try:
        meta = load_metadata(ticker.upper())
        # hide large metrics optionally? keep full for now
        return meta
    except FileNotFoundError:
        raise HTTPException(404, 'Metadata not found for ticker')

@app.get('/api/models')
async def list_models():
    results = []
    if not MODELS_DIR.exists():
        return results
    for tdir in MODELS_DIR.iterdir():
        if not tdir.is_dir():
            continue
        mfile = tdir / 'metadata.json'
        if mfile.exists():
            try:
                meta = load_metadata(tdir.name.upper())
                results.append({
                    'ticker': meta.get('ticker', tdir.name.upper()),
                    'horizons': meta.get('horizons') or [meta.get('horizon')],
                    'default_horizon': meta.get('default_horizon', meta.get('horizon')),
                    'rows': meta.get('rows')
                })
            except Exception:
                continue
    return results
