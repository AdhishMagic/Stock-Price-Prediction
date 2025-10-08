"""Bootstrap model artifacts inside a container if missing.

Environment variables:
  BOOTSTRAP_TICKERS  Comma separated tickers (default: MSFT)
  BOOTSTRAP_HORIZONS Comma separated horizons (default: 5)
  OFFLINE_MODE       If '1' uses synthetic data generation when downloading fails

Runs quickly because horizons kept small by default. Adjust for production.
"""
from __future__ import annotations
import os, sys, subprocess
from pathlib import Path

HERE = Path(__file__).parent
MODELS = HERE / 'models'

def have_all(ticker: str, horizons: list[int]) -> bool:
    meta = MODELS / ticker / 'metadata.json'
    if not meta.exists():
        return False
    # quick heuristic: ensure each horizon dir exists
    for h in horizons:
        if not (MODELS / ticker / f'H{h}').exists():
            return False
    return True

def main():
    tickers = [t.strip().upper() for t in os.getenv('BOOTSTRAP_TICKERS', 'MSFT').split(',') if t.strip()]
    horizons = sorted({int(h.strip()) for h in os.getenv('BOOTSTRAP_HORIZONS', '5').split(',') if h.strip()})
    print(f"Bootstrap tickers={tickers} horizons={horizons} OFFLINE_MODE={os.getenv('OFFLINE_MODE','0')}")
    for t in tickers:
        if have_all(t, horizons):
            print(f"[bootstrap] Models already present for {t} -> skip")
            continue
        cmd = [sys.executable, str(HERE / 'train_lightgbm.py'), t, '--horizons', ','.join(map(str,horizons))]
        print(f"[bootstrap] Training {t}: {' '.join(cmd)}")
        try:
            subprocess.check_call(cmd, cwd=HERE)
        except subprocess.CalledProcessError as e:
            print(f"[bootstrap] Training failed for {t}: {e}")
    print("[bootstrap] Done")

if __name__ == '__main__':
    main()
