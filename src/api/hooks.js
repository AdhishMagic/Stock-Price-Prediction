import { useCallback, useEffect, useRef, useState } from 'react';
import { getModelMetadata, postForecast } from './client';

// Basic stale cache (in-memory) keyed by ticker and horizon
const metaCache = new Map(); // key: ticker -> metadata
const forecastCache = new Map(); // key: `${ticker}|${horizon}` -> response

function useMounted() {
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  return mounted;
}

export function useModelMetadata(ticker, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const abortRef = useRef();
  const mounted = useMounted();

  const refetch = useCallback(() => {
    if (!ticker || !enabled) return;
    if (abortRef.current) abortRef.current.abort();
    const cached = metaCache.get(ticker.toUpperCase());
    if (cached) {
      setData(cached);
      setStatus('success');
      return;
    }
    setStatus('loading');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    getModelMetadata(ticker.toUpperCase(), { signal: ctrl.signal })
      .then(res => {
        metaCache.set(ticker.toUpperCase(), res);
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
  }, [ticker, enabled, mounted]);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
  }, [refetch]);

  return { data, status, error, refetch, isLoading: status === 'loading' };
}

export function useStockForecast({ ticker, horizon, recent = 200, enabled = true }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const abortRef = useRef();
  const mounted = useMounted();

  const key = ticker && horizon ? `${ticker.toUpperCase()}|${horizon}` : null;

  const refetch = useCallback(() => {
    if (!ticker || !horizon || !enabled) return;
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
    postForecast({ ticker: ticker.toUpperCase(), horizon, recent }, { signal: ctrl.signal })
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
  }, [ticker, horizon, recent, enabled, key, mounted]);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
  }, [refetch]);

  return { data, status, error, refetch, isLoading: status === 'loading' };
}
