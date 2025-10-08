@echo off
REM Startup Script for Stock Prediction Full Stack Application (Windows)
REM This script trains a model, starts backend and frontend

echo ========================================
echo Stock Prediction Full Stack Startup
echo ========================================
echo.

REM Check if virtual environment exists
if exist .venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo Warning: Virtual environment not found, using system Python
)

REM Step 1: Train model if not exists
echo.
echo [Step 1/3] Checking for trained model
if exist backend\models\MSFT\metadata.json (
    echo Model already exists, skipping training
) else (
    echo Training MSFT model with horizon 5 (will auto-download data)
    python backend\train_lightgbm.py MSFT --horizons 5 --horizon 5
    if errorlevel 1 (
        echo ERROR: Model training failed - check network connection
        echo You can train manually later with: python backend\train_lightgbm.py MSFT --horizons 5 --horizon 5
        pause
        exit /b 1
    )
)

REM Step 2: Start backend in new window
echo.
echo [Step 2/3] Starting backend server
start "Backend API" cmd /k "if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && uvicorn backend.predict_service:app --reload --port 8000"
timeout /t 5 /nobreak >nul

REM Step 3: Start frontend in new window
echo.
echo [Step 3/3] Starting frontend dev server
start "Frontend Dev Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo   Docs:  http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:5173

echo.
echo To stop services, close the Backend API and Frontend Dev Server windows.
echo.
