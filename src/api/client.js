// Lightweight API client wrapper
function normalizeBase(raw) {
  if (!raw) return 'http://localhost:8000';
  let v = String(raw).trim();
  if (v.startsWith(':')) {
    // e.g. ':8000' -> assume localhost
    v = 'http://localhost' + v;
  }
  if (!/^https?:\/\//i.test(v)) {
    v = 'http://' + v; // force protocol if missing
  }
  // remove trailing slashes
  v = v.replace(/\/+$/,'');
  return v;
}
const BASE_URL = normalizeBase(import.meta.env.VITE_API_BASE_URL);

async function apiFetch(path, { method = 'GET', body, signal, headers } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined,
    signal
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} ${res.status}: ${text}`);
  }
  return res.json();
}

export function getModelMetadata(ticker, { signal } = {}) {
  return apiFetch(`/api/models/${encodeURIComponent(ticker)}`, { signal });
}

export function postForecast({ ticker, horizon, recent = 200 }, { signal } = {}) {
  return apiFetch('/api/predict', {
    method: 'POST',
    body: { ticker, horizon, recent },
    signal
  });
}

export function getHealth({ signal } = {}) {
  return apiFetch('/health', { signal });
}

export { BASE_URL };
