/*
 * useAsync - a custom hook that loads data when a page opens (and again whenever the
 * fetcher changes, e.g. a new search word). It returns { data, loading, error, reload }.
 * Pages call reload() after adding/editing/deleting so the screen always shows what is
 * really in the database. "fetcher" must be a stable function (defined outside the
 * component, or wrapped in useCallback).
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export default function useAsync(fetcher, initialData) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current; // ignore slow, older responses
    try {
      const result = await fetcher();
      if (mounted.current && requestId === latestRequest.current) {
        setData(result);
        setError('');
      }
    } catch (err) {
      if (mounted.current && requestId === latestRequest.current) setError(err.message);
    } finally {
      if (mounted.current && requestId === latestRequest.current) setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    mounted.current = true;
    reload();
    return () => {
      mounted.current = false; // stop updating state once the page is closed
    };
  }, [reload]);

  return { data, loading, error, reload };
}
