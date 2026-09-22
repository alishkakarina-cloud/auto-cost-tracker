import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const router = useRouter();
  const [data, setDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.pathname === '/login') {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/state')
      .then((res) => {
        if (res.status === 401) {
          router.replace('/login');
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setDataState(json);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [router.pathname]);

  const persist = useCallback(async (next) => {
    setSaving(true);
    try {
      const res = await fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      const saved = await res.json();
      setDataState(saved);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }, [router]);

  const update = useCallback(
    (updater) => {
      setDataState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return (
    <DataContext.Provider value={{ data, loading, saving, error, update }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
