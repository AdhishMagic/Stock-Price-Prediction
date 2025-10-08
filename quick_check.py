#!/usr/bin/env python
"""Quick health check for Stock Prediction stack (no training)"""
import sys
import requests
from pathlib import Path

GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
END = '\033[0m'

def check(name, func):
    try:
        result = func()
        print(f"{GREEN}✓{END} {name}: {result}")
        return True
    except Exception as e:
        print(f"{RED}✗{END} {name}: {e}")
        return False

print("=== Quick Stack Health Check ===\n")

# 1. Check files
check("Frontend entry", lambda: "exists" if Path("src/index.jsx").exists() else "missing")
check("Backend service", lambda: "exists" if Path("backend/predict_service.py").exists() else "missing")
check("API hooks", lambda: "exists" if Path("src/api/hooks.js").exists() else "missing")
check(".env file", lambda: "exists" if Path(".env").exists() else "missing")

# 2. Check if model exists
model_path = Path("backend/models/AAPL/metadata.json")
has_model = model_path.exists()
if has_model:
    print(f"{GREEN}✓{END} Model: AAPL trained")
else:
    print(f"{YELLOW}⚠{END} Model: No AAPL model (train with: python backend/train_lightgbm.py AAPL --horizons 5 --horizon 5)")

# 3. Check backend (if running)
try:
    r = requests.get("http://localhost:8000/health", timeout=2)
    if r.status_code == 200:
        print(f"{GREEN}✓{END} Backend: Running at http://localhost:8000")
        if has_model:
            r2 = requests.get("http://localhost:8000/api/models/AAPL", timeout=2)
            if r2.status_code == 200:
                meta = r2.json()
                print(f"{GREEN}✓{END} API: Metadata endpoint works (horizons: {meta.get('horizons', [])})")
    else:
        print(f"{RED}✗{END} Backend: Returned {r.status_code}")
except:
    print(f"{YELLOW}⚠{END} Backend: Not running (start with: uvicorn backend.predict_service:app --port 8000)")

# 4. Check frontend (if running)
try:
    r = requests.get("http://localhost:5173", timeout=2)
    if r.status_code == 200:
        print(f"{GREEN}✓{END} Frontend: Running at http://localhost:5173")
    else:
        print(f"{YELLOW}⚠{END} Frontend: Returned {r.status_code}")
except:
    print(f"{YELLOW}⚠{END} Frontend: Not running (start with: npm run dev)")

print("\n=== Summary ===")
print("To start the full stack:")
print("  1. Train model:  python backend/train_lightgbm.py AAPL --horizons 5 --horizon 5")
print("  2. Start backend: uvicorn backend.predict_service:app --reload --port 8000")
print("  3. Start frontend: npm run dev")
print("  4. Open: http://localhost:5173")
