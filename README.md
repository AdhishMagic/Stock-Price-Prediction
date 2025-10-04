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



