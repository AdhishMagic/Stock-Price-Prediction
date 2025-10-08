# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build
```

### GitHub Pages (Frontend Only)
This repo includes a workflow `.github/workflows/frontend-deploy.yml` that builds the Vite app and publishes the static `dist/` folder to the `gh-pages` branch.

Steps to enable:
1. Push changes to `main` (workflow triggers automatically) or run manually via Actions tab (workflow_dispatch).
2. In the repository Settings → Pages, set Source = Deploy from a branch → `gh-pages` / root.
3. Access your site at: `https://<your-username>.github.io/<repo-name>/`.

Because the backend is dynamic, the static frontend must know where to reach the API. In production you should set during build:
```bash
VITE_API_BASE_URL=https://your-backend-host.example.com npm run build
```

If hosting only the static frontend (no backend), the forecast features will fail unless you also deploy the API somewhere (see below) and point `VITE_API_BASE_URL` to it.

### Backend Deployment Options
The backend requires a Python environment to run FastAPI + Uvicorn. Options:

| Platform | Quick Steps | Notes |
|----------|-------------|-------|
| Docker + VPS | `docker-compose up -d --build` on a Linux VM | Mount `backend/models` volume to persist retrained models |
| Render.com | New Web Service → Python → Start command: `uvicorn backend.predict_service:app --host 0.0.0.0 --port $PORT` | Add build command: `pip install -r backend/requirements.txt` |
| Fly.io | Create `fly.toml` with internal port 8000; `fly launch` | Can add volume for models |
| Google Cloud Run | Build image: `gcloud builds submit --tag gcr.io/PROJECT/stock-api` then deploy | Set `PORT=8000` env |
| Railway | Provision service from repo | Automatic deploy on push |

### Example Minimal Docker Run (Backend Only)
```bash
docker build -f Dockerfile.backend -t stock-api .
docker run -p 8000:8000 -e OFFLINE_MODE=1 stock-api
```

### Multi-Container (Frontend + Backend)
Provided `docker-compose.yml` runs both:
```bash
docker-compose up --build
```
Frontend: http://localhost:5173  
Backend:  http://localhost:8000/health

If deploying behind a reverse proxy (Nginx/Traefik), terminate TLS at proxy and forward traffic to backend service port 8000.

### GitHub Actions CI
Workflow `.github/workflows/ci.yml` runs:
- Backend tests (pytest)
- Frontend build
- Docker image build (both backend & frontend)

You can extend it by adding image push:
```yaml
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Push images
        run: |
          docker tag stock-backend:ci ghcr.io/${{ github.repository }}-backend:latest
          docker push ghcr.io/${{ github.repository }}-backend:latest
```

### Environment Variables Summary
| Variable | Scope | Purpose | Default |
|----------|-------|---------|---------|
| VITE_API_BASE_URL | Frontend build/runtime | Base URL for API calls | http://localhost:8000 |
| OFFLINE_MODE | Backend runtime | Use synthetic data if downloads fail | 0 (disabled) |

### Production Hardening Checklist
- Pin Python dependency versions tightly (avoid accidental major bumps)
- Add logging & monitoring (e.g. `uvicorn --log-level info` or structlog)
- Restrict CORS origins instead of `*`
- Serve behind HTTPS
- Add a retraining job (cron / GitHub Action) if live data forecasting required
- Persist models (volume, object storage) across container restarts


---

## 🧠 Backend (Quantile LightGBM Forecast API)

This repo now includes a backend (FastAPI) for multi-step stock price forecasting with prediction intervals using per-horizon LightGBM quantile models.

### Frontend Integration Hooks

Added lightweight API client in `src/api/client.js` and React hooks in `src/api/hooks.js`:

- `useModelMetadata(ticker)` loads `/api/models/{ticker}` and caches results.
- `useStockForecast({ ticker, horizon, recent })` posts to `/api/predict` and caches per (ticker,horizon).

Configure backend URL via environment variable:

Add to a `.env` file at project root (Vite will expose variables prefixed with `VITE_`):

```
VITE_API_BASE_URL=http://localhost:8000
```

Example usage inside a component:

```jsx
import { useModelMetadata, useStockForecast } from '@/api/hooks';

function ForecastPanel({ ticker }) {
  const { data: meta } = useModelMetadata(ticker, { enabled: !!ticker });
  const horizon = meta?.horizons?.[0] || 5;
  const { data: fc, isLoading } = useStockForecast({ ticker, horizon, enabled: !!ticker });
  if (!ticker) return <div>Select a ticker</div>;
  if (isLoading) return <div>Loading…</div>;
  return <pre>{JSON.stringify(fc.predictions.slice(0,3), null, 2)}</pre>;
}
```

The stock analysis dashboard page now demonstrates a basic integration snippet showing model output.

### Offline / No Network Mode

If Yahoo Finance is unavailable or you are in an offline environment, set:

```
OFFLINE_MODE=1
```

Effects:
- `backend/train_lightgbm.py` will generate synthetic OHLCV data if download fails.
- `backend/predict_service.py` will fall back to existing CSV in `backend/data/` or create a small synthetic series.
- You can also pre-generate larger synthetic datasets:

```
python backend/generate_sample_data.py AAPL MSFT TSLA --days 1500
```

Then train as usual:
```
python backend/train_lightgbm.py AAPL --horizons 5,10 --horizon 10
```
### Directory
```
backend/
  requirements.txt
  data/                # downloaded raw CSVs (AAPL.csv, etc.)
  data_fetch.py        # yfinance downloader
  feature_engineering.py
  train_lightgbm.py    # trains quantile models per horizon step
  predict_service.py   # FastAPI app exposing /api/predict
  models/              # saved models (ignored by git)
```

### Install Backend Deps
```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

### 1. Download Data
```bash
python data_fetch.py AAPL MSFT GOOGL --start 2018-01-01
```

### 2. Train Models
Trains quantile models (0.1 / 0.5 / 0.9) for each horizon step (default 30 future business days):
```bash
python train_lightgbm.py AAPL --horizon 30
```
Artifacts saved under `backend/models/AAPL/`:
```
step_1_q10.pkl
step_1_q50.pkl
step_1_q90.pkl
...
step_30_q10.pkl
step_30_q50.pkl
step_30_q90.pkl
metadata.json
```

### 3. Run API Server
```bash
uvicorn predict_service:app --reload --port 8000
```
Health check: http://localhost:8000/health

### 4. Endpoint
POST http://localhost:8000/api/predict
```json
{
  "ticker": "AAPL",
  "horizon": 30,
  "recent": 200
}
```
Response shape:
```json
{
  "ticker": "AAPL",
  "historical": [{"date":"2025-09-01","close":189.12}, ...],
  "predictions": [
     {"date":"2025-10-01","p10":185.1,"p50":189.3,"p90":193.2},
     ...
  ],
  "metrics": {"step_1": {"q10_mae": 1.23, "q50_mae": 0.95, "q90_mae": 1.40}, ...}
}
```

### 5. Frontend Integration
Add an environment variable in the React app `.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```
Then create a helper:
```js
export async function fetchForecast(ticker, horizon=30) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ ticker, horizon, recent: 200 })
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### 6. Confidence Intervals
Provided via quantile models (p10 / p50 / p90). Use p10 & p90 to render an area band around the median line in charts.

### Running the API Locally
1. Install dependencies: `pip install -r backend/requirements.txt`
2. (Optional) Train models for a ticker (offline synthetic if failed): `python backend/train_lightgbm.py MSFT --horizon 5`
3. Recommended start (handles PATH issues):
   - Windows PowerShell:
     ```powershell
     $env:OFFLINE_MODE=1
     python -m uvicorn backend.predict_service:app --port 8000 --reload
     ```
   - Or simply run the helper batch script (offline by default):
     ```cmd
     start_backend.bat
     ```
   - To force online mode with the batch script: `start_backend.bat ONLINE`

If you previously saw 'uvicorn not recognized', using `python -m uvicorn ...` ensures the correct interpreter module is used even when Scripts\ is not on PATH.
### 6.1 Model Loading Optimization
`backend/utils/model_loader.py` caches loaded models & metadata (LRU cache) so repeated `/api/predict` calls avoid re-reading each LightGBM file. If you retrain models, restart the API process to clear the cache.

### 6.2 Multi-Horizon & Pinball Loss
You can now train multiple horizons in one run:
```bash
python train_lightgbm.py AAPL --horizons 5,10,30
```
Models stored under:
```
backend/models/AAPL/H5/step_1_q10.pkl ...
backend/models/AAPL/H10/...
backend/models/AAPL/H30/...
backend/models/AAPL/metadata.json
```
Metadata contains `horizons`, `default_horizon`, and metrics nested by horizon key (e.g. `H30`). Each step logs both MAE and pinball (quantile) loss:
```json
"metrics": { "H30": { "step_1": { "q10_mae": 1.1, "q10_pinball": 0.7, ... }}}
```
Request a different horizon by passing `horizon` in the predict body (must match a trained one).

### 6.3 Model Metadata Endpoint
Retrieve raw metadata:
```
GET /api/models/AAPL
```
Returns horizons, quantiles, feature list, metrics, timestamps.

### 6.4 Docker Deployment
Two Dockerfiles provided:
- `Dockerfile.backend` (FastAPI + Uvicorn)
- `Dockerfile.frontend` (Vite build -> Nginx static)

Compose everything:
```bash
docker-compose up --build
```
Frontend: http://localhost:5173  (proxy environment variable points backend at http://localhost:8000)
Backend:  http://localhost:8000/health

Production tip: Put Nginx reverse proxy in front and enable caching of `/api/predict` responses for short TTL if traffic is high.

### 7. Retraining
Run the same training script again after refreshing data; metadata is overwritten.

### 8. Extending
Ideas:
- Add more technical indicators
- Train different horizons (e.g., 5, 10, 60) and choose dynamically
- Add caching layer (Redis) for downloaded yfinance data
- Persist evaluation metrics history

---

## ❓ Troubleshooting
| Issue | Fix |
|-------|-----|
| API 404 model not found | Run data fetch + training for that ticker |
| Horizon mismatch | Retrain with desired horizon or adjust frontend |
| Slow first response | yfinance download latency—consider local cache |
| Missing p10/p90 | Ensure all quantile model files exist; retrain |

---

## 🛡️ Disclaimer
This forecasting setup is for educational purposes; not financial advice.



