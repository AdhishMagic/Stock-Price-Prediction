"""FastAPI service exposing /api/predict using quantile LightGBM per-step models.
Usage:
  uvicorn predict_service:app --reload --port 8000

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

import pandas as pd
import joblib  # retained only if future per-call loading needed (can be removed later)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import yfinance as yf

from backend.feature_engineering import build_features
from backend.utils.model_loader import load_models, load_metadata

MODELS_DIR = Path(__file__).parent / 'models'

app = FastAPI(title='Stock Forecast API', version='0.1.0')

class PredictRequest(BaseModel):
    ticker: str
    horizon: int = Field(30, ge=1, le=365, description='Forecast horizon (business days)')
    recent: int = Field(200, ge=50, le=2000, description='Recent historical rows to return')


def download_latest(ticker: str):
    df = yf.download(ticker, period='3y', auto_adjust=True, progress=False)
    if df.empty:
        raise HTTPException(404, 'No market data returned')
    df.reset_index(inplace=True)
    df.rename(columns={c: c.lower() for c in df.columns}, inplace=True)
    keep = [c for c in ['date','open','high','low','close','adj close','volume'] if c in df.columns]
    df = df[keep]
    if 'adj close' in df.columns and 'close' in df.columns:
        df['close'] = df['adj close']
        df.drop(columns=['adj close'], inplace=True)
    return df


def forecast(ticker: str, horizon: int, recent: int):
    t = ticker.upper()
    meta = load_metadata(t)
    # multi-horizon aware
    if 'horizons' in meta:
        horizons = meta['horizons']
        if horizon not in horizons:
            raise HTTPException(400, f"Requested horizon {horizon} not in available horizons {horizons}")
        metrics_root = meta.get('metrics', {}).get(f'H{horizon}', {})
        bundle = load_models(t, horizon=horizon)
        feature_cols = meta['feature_cols']
    else:
        if horizon != meta['horizon']:
            raise HTTPException(400, f"Requested horizon {horizon} differs from trained horizon {meta['horizon']}")
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

    return {
        'ticker': t,
        'horizon': bundle.horizon,
        'historical': historical,
        'predictions': preds,
        'metrics': metrics_root
    }

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
