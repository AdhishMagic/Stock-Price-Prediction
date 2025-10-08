@echo off
REM Reliable backend startup script with optional offline mode
SETLOCAL ENABLEDELAYEDEXPANSION

REM Detect python
where python >NUL 2>&1
IF ERRORLEVEL 1 (
  echo Python not found in PATH. Please install Python 3.13 and reopen terminal.
  EXIT /B 1
)

REM Enable offline mode by default (can override by passing ONLINE)
IF "%1"=="ONLINE" (
  set OFFLINE_MODE=0
) ELSE (
  set OFFLINE_MODE=1
)
echo OFFLINE_MODE=%OFFLINE_MODE%

REM Install backend dependencies if uvicorn missing
python - <<EOF
import importlib, subprocess, sys
missing = []
for pkg in ["fastapi","uvicorn","pandas","numpy","lightgbm","scikit_learn"]:
    try:
        importlib.import_module(pkg.replace('-', '_'))
    except Exception:
        missing.append(pkg)
if missing:
    print("Installing missing packages:", missing)
    subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
EOF
IF ERRORLEVEL 1 (
  echo Dependency installation failed.
  EXIT /B 1
)

REM Launch server
python -m uvicorn backend.predict_service:app --port 8000 --reload

ENDLOCAL