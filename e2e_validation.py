#!/usr/bin/env python
"""
E2E Validation Script for Stock Prediction Full Stack Application
Tests the complete flow: training → backend API → frontend readiness
"""
import sys
import subprocess
import time
import json
from pathlib import Path
import requests

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def log(msg, color=None):
    if color:
        print(f"{color}{msg}{Colors.END}")
    else:
        print(msg)

def log_step(step, msg):
    print(f"\n{Colors.BOLD}{Colors.BLUE}[Step {step}]{Colors.END} {msg}")

def log_success(msg):
    log(f"✓ {msg}", Colors.GREEN)

def log_error(msg):
    log(f"✗ {msg}", Colors.RED)

def log_warning(msg):
    log(f"⚠ {msg}", Colors.YELLOW)

def run_command(cmd, shell=True, cwd=None, timeout=300):
    """Run command and return (success, output)"""
    try:
        result = subprocess.run(
            cmd,
            shell=shell,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check_python_env():
    """Verify Python environment and dependencies"""
    log_step(1, "Checking Python Environment")
    
    # Check Python version
    success, stdout, _ = run_command("python --version")
    if success:
        log_success(f"Python installed: {stdout.strip()}")
    else:
        log_error("Python not found")
        return False
    
    # Check if backend requirements installed
    required_packages = ['fastapi', 'uvicorn', 'pandas', 'lightgbm', 'yfinance']
    missing = []
    
    for pkg in required_packages:
        success, _, _ = run_command(f"python -m pip show {pkg}")
        if success:
            log_success(f"Package installed: {pkg}")
        else:
            missing.append(pkg)
            log_warning(f"Package missing: {pkg}")
    
    if missing:
        log_warning(f"Missing packages: {', '.join(missing)}")
        log("Run: python -m pip install -r backend/requirements.txt")
        return False
    
    return True

def check_node_env():
    """Verify Node.js environment"""
    log_step(2, "Checking Node.js Environment")
    
    success, stdout, _ = run_command("node --version")
    if success:
        log_success(f"Node.js installed: {stdout.strip()}")
    else:
        log_error("Node.js not found")
        return False
    
    success, stdout, _ = run_command("npm --version")
    if success:
        log_success(f"npm installed: {stdout.strip()}")
    else:
        log_error("npm not found")
        return False
    
    # Check if node_modules exists
    if Path("node_modules").exists():
        log_success("node_modules present")
    else:
        log_warning("node_modules not found")
        log("Run: npm install")
        return False
    
    return True

def train_test_model():
    """Train a test model for validation"""
    log_step(3, "Training Test Model (AAPL, horizon 5)")
    
    ticker = "AAPL"
    models_dir = Path("backend/models") / ticker
    
    # Check if model already exists
    if (models_dir / "metadata.json").exists():
        log_warning(f"Model for {ticker} already exists, skipping training")
        return True
    
    log(f"Training {ticker} with horizon 5 (this may take 2-3 minutes)...")
    
    cmd = "python backend/train_lightgbm.py AAPL --horizons 5 --horizon 5"
    success, stdout, stderr = run_command(cmd, timeout=300)
    
    if success and (models_dir / "metadata.json").exists():
        log_success(f"Model trained successfully: {models_dir}")
        return True
    else:
        log_error(f"Training failed")
        if stderr:
            log(f"Error: {stderr[:500]}")
        return False

def test_backend_api():
    """Test backend API endpoints"""
    log_step(4, "Testing Backend API")
    
    base_url = "http://localhost:8000"
    
    # Check if backend is already running
    try:
        response = requests.get(f"{base_url}/health", timeout=2)
        if response.status_code == 200:
            log_success("Backend already running")
            backend_running = True
        else:
            backend_running = False
    except:
        backend_running = False
        log_warning("Backend not running, attempting to start...")
    
    # Start backend if not running
    backend_process = None
    if not backend_running:
        try:
            backend_process = subprocess.Popen(
                ["uvicorn", "backend.predict_service:app", "--port", "8000"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            log("Waiting for backend to start...")
            time.sleep(5)
            
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                log_success("Backend started successfully")
                backend_running = True
            else:
                log_error("Backend failed to start")
                return False, backend_process
        except Exception as e:
            log_error(f"Failed to start backend: {e}")
            return False, backend_process
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            log_success(f"Health check: {response.json()}")
        else:
            log_error(f"Health check failed: {response.status_code}")
            return False, backend_process
    except Exception as e:
        log_error(f"Health check error: {e}")
        return False, backend_process
    
    # Test metadata endpoint
    try:
        response = requests.get(f"{base_url}/api/models/AAPL", timeout=5)
        if response.status_code == 200:
            meta = response.json()
            log_success(f"Metadata: ticker={meta['ticker']}, horizons={meta.get('horizons', [])}")
        else:
            log_error(f"Metadata endpoint failed: {response.status_code}")
            return False, backend_process
    except Exception as e:
        log_error(f"Metadata error: {e}")
        return False, backend_process
    
    # Test prediction endpoint
    try:
        payload = {"ticker": "AAPL", "horizon": 5, "recent": 50}
        response = requests.post(f"{base_url}/api/predict", json=payload, timeout=30)
        if response.status_code == 200:
            data = response.json()
            pred_count = len(data.get('predictions', []))
            log_success(f"Prediction API: {pred_count} predictions returned")
            if pred_count > 0:
                first_pred = data['predictions'][0]
                log(f"  Sample: {first_pred.get('date')} → p50={first_pred.get('p50', 'N/A')}")
        else:
            log_error(f"Prediction endpoint failed: {response.status_code}")
            log(f"Response: {response.text[:200]}")
            return False, backend_process
    except Exception as e:
        log_error(f"Prediction error: {e}")
        return False, backend_process
    
    return True, backend_process

def test_frontend_build():
    """Test frontend build"""
    log_step(5, "Testing Frontend Build")
    
    # Check .env file
    env_path = Path(".env")
    if env_path.exists():
        env_content = env_path.read_text()
        if "VITE_API_BASE_URL" in env_content:
            log_success(".env file configured")
        else:
            log_warning(".env missing VITE_API_BASE_URL")
    else:
        log_warning(".env file not found")
    
    # Try to build
    log("Running production build (this may take a few minutes)...")
    success, stdout, stderr = run_command("npm run build", timeout=300)
    
    if success and Path("build/index.html").exists():
        log_success("Frontend build successful")
        return True
    else:
        log_error("Frontend build failed")
        if stderr:
            log(f"Error: {stderr[:500]}")
        return False

def run_unit_tests():
    """Run backend unit tests"""
    log_step(6, "Running Backend Unit Tests")
    
    success, stdout, stderr = run_command("python -m pytest backend/tests -q", timeout=60)
    
    if success:
        log_success("All backend tests passed")
        log(stdout)
        return True
    else:
        log_error("Some tests failed")
        if stderr:
            log(stderr)
        return False

def main():
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}Stock Prediction E2E Validation{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    results = {}
    backend_process = None
    
    try:
        # Step 1: Python environment
        results['python_env'] = check_python_env()
        if not results['python_env']:
            log_error("Python environment check failed. Fix dependencies first.")
            return False
        
        # Step 2: Node environment
        results['node_env'] = check_node_env()
        if not results['node_env']:
            log_error("Node.js environment check failed. Run npm install.")
            return False
        
        # Step 3: Train model
        results['model_training'] = train_test_model()
        if not results['model_training']:
            log_error("Model training failed. Check data fetch and feature engineering.")
            return False
        
        # Step 4: Backend API
        results['backend_api'], backend_process = test_backend_api()
        if not results['backend_api']:
            log_error("Backend API validation failed.")
            return False
        
        # Step 5: Frontend build
        results['frontend_build'] = test_frontend_build()
        if not results['frontend_build']:
            log_error("Frontend build failed.")
            return False
        
        # Step 6: Unit tests
        results['unit_tests'] = run_unit_tests()
        if not results['unit_tests']:
            log_warning("Unit tests had failures (non-critical)")
        
        # Summary
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.GREEN}E2E Validation Summary{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")
        
        for test, passed in results.items():
            status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
            print(f"{test.replace('_', ' ').title():.<40} {status}")
        
        all_passed = all(results.values())
        
        if all_passed:
            print(f"\n{Colors.BOLD}{Colors.GREEN}🎉 Full stack application is fully functional!{Colors.END}\n")
            print("Next steps:")
            print("  1. Start backend: uvicorn backend.predict_service:app --reload --port 8000")
            print("  2. Start frontend: npm run dev")
            print("  3. Open browser: http://localhost:5173")
            print("  4. Search for AAPL in the dashboard")
        else:
            print(f"\n{Colors.BOLD}{Colors.RED}❌ Some checks failed. Review errors above.{Colors.END}\n")
        
        return all_passed
        
    finally:
        # Cleanup: stop backend if we started it
        if backend_process:
            log("\nStopping test backend server...")
            backend_process.terminate()
            try:
                backend_process.wait(timeout=5)
            except:
                backend_process.kill()

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        log_warning("\nValidation interrupted by user")
        sys.exit(1)
    except Exception as e:
        log_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
