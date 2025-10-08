import { useCallback, useEffect, useRef, useState } from 'react';
import { getModelMetadata, postForecast } from './client';

function normalizeTicker(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') return raw.trim();
  // Support objects like { value: 'AAPL' } or arrays
  if (typeof raw === 'object') {
    if (Array.isArray(raw)) return normalizeTicker(raw[0]);
    if ('value' in raw && typeof raw.value === 'string') return raw.value.trim();
    if ('ticker' in raw && typeof raw.ticker === 'string') return raw.ticker.trim();
  }
  try { return String(raw).trim(); } catch { return ''; }
}

// Basic stale cache (in-memory) keyed by ticker and horizon
const metaCache = new Map(); // key: ticker -> metadata
const forecastCache = new Map(); // key: `${ticker}|${horizon}` -> response

function useMounted() {
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  return mounted;
}

export function useModelMetadata(ticker, { enabled = true } = {}) {
  const normTicker = normalizeTicker(ticker);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const abortRef = useRef();
  const mounted = useMounted();

  const refetch = useCallback(() => {
    if (!normTicker || !enabled) return;
    if (abortRef.current) abortRef.current.abort();
    const cached = metaCache.get(normTicker.toUpperCase());
    if (cached) {
      setData(cached);
      setStatus('success');
      return;
    }
    setStatus('loading');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    getModelMetadata(normTicker.toUpperCase(), { signal: ctrl.signal })
      .then(res => {
        metaCache.set(normTicker.toUpperCase(), res);
        if (mounted.current) {
          setData(res);
          setStatus('success');
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        if (mounted.current) {
          setError(err);
          setStatus('error');
        }
      });
  }, [normTicker, enabled, mounted]);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
  }, [refetch]);

  return { data, status, error, refetch, isLoading: status === 'loading', ticker: normTicker };
}

export function useStockForecast({ ticker, horizon, recent = 200, enabled = true }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const abortRef = useRef();
  const mounted = useMounted();
  const normTicker = normalizeTicker(ticker);
  const key = normTicker && horizon ? `${normTicker.toUpperCase()}|${horizon}` : null;

  const refetch = useCallback(() => {
    if (!normTicker || !horizon || !enabled) return;
    if (abortRef.current) abortRef.current.abort();
    const cached = forecastCache.get(key);
    if (cached) {
      setData(cached);
      setStatus('success');
      return;
    }
    setStatus('loading');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    postForecast({ ticker: normTicker.toUpperCase(), horizon, recent }, { signal: ctrl.signal })
      .then(res => {
        forecastCache.set(key, res);
        if (mounted.current) {
          setData(res);
          setStatus('success');
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        if (mounted.current) {
          setError(err);
          setStatus('error');
        }
      });
  }, [normTicker, horizon, recent, enabled, key, mounted]);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
  }, [refetch]);

  return { data, status, error, refetch, isLoading: status === 'loading', ticker: normTicker };
}
