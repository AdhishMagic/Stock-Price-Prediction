# Stock Prediction E2E Testing Guide

## Automated Validation

Run the full end-to-end validation script:

```powershell
python e2e_validation.py
```

This script will:
1. ✓ Check Python environment and dependencies
2. ✓ Check Node.js environment  
3. ✓ Train a test model (AAPL, horizon 5) if not present
4. ✓ Start backend API and test all endpoints
5. ✓ Build frontend and verify configuration
6. ✓ Run backend unit tests

**Expected output**: All checks pass with green ✓ marks.

---

## Quick Startup (Windows)

```cmd
start_app.bat
```

This will:
- Train AAPL model if missing
- Start backend in new window (port 8000)
- Start frontend in new window (port 5173)
- Open browser automatically

---

## Manual Testing Checklist

### 1. Environment Setup

**Backend dependencies:**
```powershell
python -m pip install -r backend/requirements.txt
```

**Frontend dependencies:**
```powershell
npm install
```

**Environment variables:**
Create `.env` in project root:
```
VITE_API_BASE_URL=http://localhost:8000
```

---

### 2. Train a Model

```powershell
python backend/train_lightgbm.py AAPL --horizons 5,10,30 --horizon 30
```

**Verify:**
- Creates `backend/models/AAPL/metadata.json`
- Creates `backend/models/AAPL/H5/`, `H10/`, `H30/` folders with `.pkl` files

---

### 3. Start Backend

```powershell
uvicorn backend.predict_service:app --reload --port 8000
```

**Test endpoints:**

Health check:
```powershell
curl http://localhost:8000/health
```
Expected: `{"status":"ok","time":"2025-10-07T..."}`

Model metadata:
```powershell
curl http://localhost:8000/api/models/AAPL
```
Expected: JSON with `ticker`, `horizons`, `metrics`

Prediction:
```powershell
curl -X POST http://localhost:8000/api/predict -H "Content-Type: application/json" -d "{\"ticker\":\"AAPL\",\"horizon\":5,\"recent\":100}"
```
Expected: JSON with `historical[]` and `predictions[]` (5 rows with p10, p50, p90)

---

### 4. Start Frontend

```powershell
npm run dev
```

**Open browser:** http://localhost:5173

---

### 5. Frontend Integration Tests

**In Stock Analysis Dashboard:**

1. **Search for stock:**
   - Type "AAPL" in search bar
   - Click "Apple Inc. (AAPL)"
   - Wait for loading spinner

2. **Check API integration:**
   - Open browser DevTools (F12) → Network tab
   - Should see:
     - GET `/api/models/AAPL` → 200 OK
     - POST `/api/predict` → 200 OK
   - Console should not show errors

3. **Verify data display:**
   - "Model Output" panel should show:
     - Horizon: 5 (or closest to selected)
     - Predictions: three numbers (p50 values)
     - Quantiles: p10, p50, p90

4. **Change horizon:**
   - Click "1 Week" (7 days) button
   - If not trained, shows closest available horizon
   - New prediction request fires

---

### 6. Error Handling Tests

**Test 404 - Model not found:**
```powershell
curl http://localhost:8000/api/models/INVALID
```
Expected: 404 with error message

**Test untrained ticker:**
- In dashboard, search for "TSLA" (if not trained)
- Should see error or "No forecast available"

**Backend offline:**
- Stop backend server
- Refresh dashboard with AAPL selected
- Should show loading indefinitely or timeout error in console

---

### 7. Backend Unit Tests

```powershell
python -m pytest backend/tests -v
```

**Expected output:**
```
test_feature_engineering.py::test_build_features_basic PASSED
test_feature_engineering.py::test_feature_target_alignment PASSED
test_predict_service.py::test_health PASSED
test_predict_service.py::test_model_metadata PASSED
test_predict_service.py::test_predict_missing_model SKIPPED
```

4 passed, 1 skipped = SUCCESS

---

### 8. Production Build Test

```powershell
npm run build
```

**Verify:**
- No errors
- Creates `build/` directory
- `build/index.html` exists
- Warning about chunk size is non-critical

**Test build locally:**
```powershell
npm install -g serve
serve -s build -p 3000
```
Open: http://localhost:3000

---

## Common Issues & Fixes

### Backend

**ModuleNotFoundError: No module named 'backend'**
- Run from project root, not inside backend/
- Ensure `backend/__init__.py` exists

**Model not found (404)**
- Train the model first: `python backend/train_lightgbm.py AAPL --horizons 5 --horizon 5`

**Pandas build error**
- Already fixed: using pandas==2.2.3 and numpy==2.1.2 with wheels

**Horizon mismatch**
- Request only horizons listed in metadata.json (e.g., 5, 10, 30)

### Frontend

**API calls fail (CORS/network error)**
- Check `.env` has `VITE_API_BASE_URL=http://localhost:8000`
- Restart dev server after changing .env
- Verify backend is running on port 8000

**Empty predictions**
- Check browser console for errors
- Verify API response in Network tab
- Ensure backend returned 200 status

**Build warnings (chunk size)**
- Non-critical, app still works
- Future optimization: code-split with lazy imports

---

## Success Criteria

### Backend ✓
- [x] Health endpoint returns 200
- [x] Metadata endpoint returns model info
- [x] Prediction endpoint returns forecasts with p10/p50/p90
- [x] Unit tests pass
- [x] No import errors

### Frontend ✓
- [x] Dev server starts
- [x] Production build succeeds
- [x] API hooks fetch data
- [x] Dashboard displays model output
- [x] No console errors (except warnings)

### Integration ✓
- [x] Frontend calls backend APIs
- [x] API responses populate UI
- [x] Horizon selection triggers new requests
- [x] Caching prevents duplicate calls

---

## Next Enhancements

After validation passes:

1. **Chart integration** - Plot forecasts with confidence bands
2. **Error toasts** - User-friendly error messages
3. **Model availability filter** - Only show trained tickers in search
4. **Real-time updates** - WebSocket for live data
5. **Multi-ticker comparison** - Side-by-side analysis

---

## Contact

For issues or questions, check:
- Backend logs in terminal
- Browser console (F12)
- Network tab for API responses
- `backend/models/TICKER/metadata.json` for model details
