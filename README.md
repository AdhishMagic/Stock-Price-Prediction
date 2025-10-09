<div align="center">

# Stock Price Prediction Platform

End‑to‑end stock forecasting web application combining a React/Tailwind frontend with a FastAPI + LightGBM backend that serves multi‑step quantile forecasts (prediction intervals). Supports fully offline synthetic data mode, multi‑horizon training, containerized deployment, and CI workflows.

</div>

---

## 1. Key Features

### Frontend
- React 18 + Vite (fast dev + HMR)
- TailwindCSS utility styling + animation plugins
- Recharts / D3 available for visualization
- Custom hooks (`useModelMetadata`, `useStockForecast`) with in‑memory caching
- Graceful horizon fallback messaging from backend
- BASE_URL sanitation + robust ticker normalization

### Backend / ML
- FastAPI + Uvicorn ASGI service
- LightGBM quantile models (p10 / p50 / p90) per forecast step
- Direct multi‑step strategy (one model per horizon step & quantile)
- Multi‑horizon training in a single invocation (`--horizons 5,10,30`)
- Pinball loss + MAE metrics stored in metadata
- Model & metadata caching (LRU) for faster subsequent predictions
- Synthetic data fallback (OFFLINE_MODE) for training & inference resilience

### Dev Tooling
- Local-first dev workflow (no Docker required)
- Configurable via environment variables (API base URL, offline mode)

---

## 2. Architecture Overview

```
┌──────────────────────┐      fetch /api/*            ┌──────────────────────────┐
│  React Frontend      │  ─────────────────────────▶  │  FastAPI Prediction API │
│  (Vite Dev / Nginx)  │  ◀─────────────────────────  │  /api/predict /api/models│
└─────────┬────────────┘                              └───────────┬──────────────┘
					│  VITE_API_BASE_URL                                   │
					│                                                       │ loads
					▼                                                       ▼
	Browser Hooks / Caching                                LightGBM Quantile Models
																												 (step_i_q{quantile}.pkl)
																												 + metadata.json
```

Training pipeline builds one model per (step, quantile) for each requested horizon. Metadata records metrics (MAE, pinball) for quick analysis and to enable backend fallback logic.

---

## 3. Technologies Used

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite, TailwindCSS, Recharts/D3, React Router v6, Framer Motion |
| Backend | FastAPI, Uvicorn, Pydantic |
| ML | LightGBM (quantile), scikit-learn metrics, NumPy, Pandas |
| Tooling | Node 20, Python 3.11/3.13 compatible |

---

## 4. Project Structure (Key Directories)

```
backend/
	feature_engineering.py      # Feature builders
	train_lightgbm.py           # Multi-horizon quantile training script
	predict_service.py          # FastAPI app
	bootstrap_models.py         # Auto-trains default models in container
	utils/model_loader.py       # Cached loader for models & metadata
	models/<TICKER>/H<h>/...    # Persisted models + metadata.json
src/
	api/client.js               # Fetch wrapper with BASE_URL normalization
	api/hooks.js                # React hooks (metadata + forecast) with caching
	pages/stock-analysis-dashboard/ ... UI pages
# (Deployment artifacts removed)
```

---

## 5. Environment Variables

| Variable | Scope | Default | Purpose |
|----------|-------|---------|---------|
| `VITE_API_BASE_URL` | Frontend build/runtime | `http://localhost:8000` | API root for client.js |
| `OFFLINE_MODE` | Backend runtime | `0` | Use synthetic data if download fails / force offline |
| `BOOTSTRAP_TICKERS` | Backend container | `MSFT` | Auto-train tickers at container start |
| `BOOTSTRAP_HORIZONS` | Backend container | `5` | Horizons for bootstrap training |
| `VITE_ENABLE_STOCK_SIDEBAR` | Frontend build | `false` | If truthy (`1,true,yes,on`) shows right metrics sidebar |

---

## 6. Quick Start (Local – No Docker)

```bash
# Clone repo then:
python -m venv .venv
source .venv/bin/activate            # Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
npm install

# (Optional) Train models (offline synthetic)
export OFFLINE_MODE=1                 # Windows: set OFFLINE_MODE=1
python backend/train_lightgbm.py MSFT --horizon 5

# Start backend
python -m uvicorn backend.predict_service:app --port 8000 --reload

# In another terminal (frontend)
npm run start
```

Navigate to:
- Backend docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

---

<!-- Section removed: Docker Compose quick start (deployment artifacts removed) -->

---

## 8. Model Training Workflow

Command examples:
```bash
# Single horizon (30 business days)
python backend/train_lightgbm.py AAPL --horizon 30

# Multiple horizons at once
python backend/train_lightgbm.py AAPL --horizons 5,10,30
```

For each horizon H and each future step s=1..H and quantile q∈{0.1,0.5,0.9} a model file is saved:
```
backend/models/AAPL/H10/step_1_q10.pkl
backend/models/AAPL/H10/step_1_q50.pkl
...
backend/models/AAPL/metadata.json
```

`metadata.json` schema (abridged):
```json
{
	"ticker": "AAPL",
	"horizons": [5,10,30],
	"quantiles": [0.1,0.5,0.9],
	"feature_cols": [...],
	"metrics": { "H10": { "step_1": { "q10_mae": 1.23, "q10_pinball": 0.75 }, ... } }
}
```

### Metrics
- MAE per step & quantile
- Pinball loss (quantile regression objective quality)

---

## 9. Offline / Synthetic Mode

Set `OFFLINE_MODE=1` to bypass yfinance dependency or network outages.
- Training: generates deterministic synthetic OHLCV series using seeded noise.
- Prediction: falls back to local CSV or a small synthetic series if download fails.

Benefits: reproducible CI, local demos without network, consistent container startup.

---

## 10. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Basic liveness check |
| GET | `/api/models` | List available tickers + horizons |
| GET | `/api/models/{ticker}` | Metadata for ticker |
| POST | `/api/predict` | Forecast with quantile intervals |

### POST /api/predict Request
```json
{ "ticker": "MSFT", "horizon": 5, "recent": 120 }
```

### Response (excerpt)
```json
{
	"ticker": "MSFT",
	"horizon": 5,
	"historical": [{"date":"2025-10-01","close":312.45}, ...],
	"predictions": [
		{"date":"2025-10-08","p10":310.1,"p50":312.0,"p90":314.2},
		...
	],
	"metrics": {"step_1": {"q10_mae": 1.2, "q10_pinball": 0.7}},
	"note": "Requested horizon 7 not available; using 10 from [5,10]"  // present only on fallback
}
```

---

## 11. React Hooks Usage

```jsx
import { useModelMetadata, useStockForecast } from '@/api/hooks';

function ForecastPanel({ ticker }) {
	const { data: meta } = useModelMetadata(ticker, { enabled: !!ticker });
	const horizon = meta?.horizons?.[0] || meta?.horizon || 5;
	const { data: fc, isLoading, error } = useStockForecast({ ticker, horizon, enabled: !!ticker });
	if (!ticker) return <div>Select a ticker</div>;
	if (isLoading) return <div>Loading…</div>;
	if (error) return <pre>{String(error)}</pre>;
	return <pre>{JSON.stringify(fc.predictions.slice(0,2), null, 2)}</pre>;
}
```

Caching: In-memory Maps keyed by normalized `TICKER|HORIZON`. Errors returned through hook's `error` state.

---

## 12. Deployment Paths

<!-- Deployment sections removed (Docker, CI/CD, Pages, Cloud hosting) -->

---

## 13. Testing

### Backend Unit Tests
```
pytest -q
```
Install dev deps already included in `backend/requirements.txt` (pytest + httpx).

### Smoke Test Script (Manual)
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/models
curl -X POST http://localhost:8000/api/predict -H 'Content-Type: application/json' \
	-d '{"ticker":"MSFT","horizon":5,"recent":120}'
```

---

## 14. Retraining & Updating Models

1. (Optional) Refresh raw CSVs or rely on synthetic offline mode.
2. Run training with new horizons.
3. Restart backend (model cache is in-memory) to pick up new artifact set.

Automated container bootstrap prevents missing model errors in ephemeral environments.

---

## 15. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `API ... net::ERR_CONNECTION_REFUSED` | Backend not running or wrong BASE_URL | Start backend / correct `VITE_API_BASE_URL` |
| `Model not trained` 404 | Missing metadata/models | Train (`train_lightgbm.py`) or allow bootstrap |
| Horizon error | Unavailable horizon requested | Fallback now automatic – inspect `note` in response |
| `uvicorn not recognized` | Using scripts path not exported | Use `python -m uvicorn backend.predict_service:app ...` |
| Slow first call | yfinance delay / network | Use `OFFLINE_MODE=1` or warm up container |
| Memory bloat training | Large horizons + many quantiles | Limit horizons or steps (smaller set) |

---

## 16. Production Hardening Checklist
- Restrict CORS origins (current config is permissive: `*`).
- Add proper logging & structured metrics.
- Mount persistent volume / object storage for `backend/models`.
- Implement scheduled retraining & artifact versioning.
- Add authentication / rate limiting if exposed publicly.
- Replace synthetic fallback with robust data caching layer (Redis / DB).

---

## 17. Disclaimer / License

This project & forecasts are for educational purposes only and not financial advice. Ensure compliance with any data provider terms when enabling live downloads.

---

## 18. Quick Command Reference

```bash
# Local dev (backend + frontend)
OFFLINE_MODE=1 python -m uvicorn backend.predict_service:app --port 8000 --reload
npm run start

# Train multi-horizon
python backend/train_lightgbm.py AAPL --horizons 5,10,30

<!-- Deployment command removed -->

# Predict (manual)
curl -X POST http://localhost:8000/api/predict -H 'Content-Type: application/json' \
	-d '{"ticker":"MSFT","horizon":5,"recent":120}'
```

---

**Happy Building & Forecasting!**

