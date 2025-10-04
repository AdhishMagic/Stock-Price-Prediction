import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import json
import joblib
from unittest.mock import patch

# Import app
from backend.predict_service import app

client = TestClient(app)

DUMMY_META = {
    "ticker": "TEST",
    "horizons": [5],
    "default_horizon": 5,
    "quantiles": [0.1,0.5,0.9],
    "feature_cols": ["close"],
    "metrics": {"H5": {}},
    "trained_at": "2024-01-01T00:00:00Z",
    "rows": 10
}

@pytest.fixture(autouse=True)
def patch_metadata(tmp_path):
    # create dummy model folder structure
    models_dir = Path('backend/models/TEST/H5')
    models_dir.mkdir(parents=True, exist_ok=True)
    # Write metadata
    with open(Path('backend/models/TEST/metadata.json'), 'w') as f:
        json.dump(DUMMY_META, f)
    # Instead of dumping a class (pickle issues in local scope), dump a simple dict
    dummy_model = {"predict": 123.45}
    for step in range(1,6):
        for q in [10,50,90]:
            joblib.dump(dummy_model, models_dir / f'step_{step}_q{q}.pkl')

    # Patch joblib.load to return an object with predict method
    class LoaderMock:
        def __init__(self, val):
            self._val = val
        def predict(self, X):
            return [self._val]

    original_load = joblib.load
    def _load(path):
        obj = original_load(path)
        if isinstance(obj, dict) and 'predict' in obj:
            return LoaderMock(obj['predict'])
        return obj

    with patch('backend.utils.model_loader.joblib.load', side_effect=_load):
        yield

@pytest.mark.skip(reason="Requires network for yfinance unless mocked")
def test_predict_missing_model():
    # Example placeholder if adding network mocking later
    pass

def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'

def test_model_metadata():
    r = client.get('/api/models/TEST')
    assert r.status_code == 200
    body = r.json()
    assert body['ticker'] == 'TEST'
    assert 5 in body['horizons']
