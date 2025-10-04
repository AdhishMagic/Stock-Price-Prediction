"""Utility helpers for loading quantile LightGBM step models & metadata.

Supports both legacy single-horizon layout:
    models/TICKER/step_{step}_q{quant}.pkl + metadata.json (with 'horizon')
and new multi-horizon layout:
    models/TICKER/H{H}/step_{step}_q{quant}.pkl + metadata.json (with 'horizons')
Use load_models(ticker, horizon=None) to pick a specific horizon. If not provided,
defaults to metadata['default_horizon'] if multi-horizon, else metadata['horizon'].
"""
from __future__ import annotations
from pathlib import Path
import json
import joblib
from functools import lru_cache

MODELS_DIR = Path(__file__).resolve().parent.parent / 'models'

class ModelBundle:
    def __init__(self, ticker: str, metadata: dict, horizon: int, model_map: dict):
        self.ticker = ticker
        self.metadata = metadata
        self.horizon = horizon
        self.model_map = model_map  # (step, quantile_int) -> model

    def predict_step_quantile(self, step: int, q: float, features_row):
        q_int = int(q*100)
        key = (step, q_int)
        model = self.model_map.get(key)
        if model is None:
            raise FileNotFoundError(f"Model missing for step {step} q{q} (horizon {self.horizon})")
        return float(model.predict(features_row)[0])

@lru_cache(maxsize=16)
def load_metadata(ticker: str) -> dict:
    meta_path = MODELS_DIR / ticker / 'metadata.json'
    if not meta_path.exists():
        raise FileNotFoundError(f"Metadata not found for {ticker}")
    with open(meta_path) as f:
        return json.load(f)

@lru_cache(maxsize=32)
def load_models(ticker: str, horizon: int | None = None):
    meta = load_metadata(ticker)

    # Determine horizon list & target horizon
    if 'horizons' in meta:
        horizons = meta['horizons']
        if horizon is None:
            horizon = meta.get('default_horizon', horizons[-1])
        if horizon not in horizons:
            raise ValueError(f"Requested horizon {horizon} not in trained horizons {horizons}")
        base_dir = MODELS_DIR / ticker / f'H{horizon}'
        effective_horizon = horizon
    else:  # legacy
        effective_horizon = meta['horizon']
        if horizon and horizon != effective_horizon:
            raise ValueError(f"Model only trained for horizon {effective_horizon}")
        base_dir = MODELS_DIR / ticker

    model_map = {}
    quantiles = meta['quantiles']
    for step in range(1, effective_horizon+1):
        for q in quantiles:
            q_int = int(q*100)
            p = base_dir / f'step_{step}_q{q_int}.pkl'
            if p.exists():
                model_map[(step, q_int)] = joblib.load(p)
            else:
                raise FileNotFoundError(f"Missing model file {p}")
    return ModelBundle(ticker, meta, effective_horizon, model_map)

__all__ = ['load_models','load_metadata','ModelBundle']
