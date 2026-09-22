import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/state')
      .then((res) => res.json())
      .then((json) => {
        if (json) setDataState(json);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (next) => {
    setSaving(true);
    try {
      const res = await fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      const saved = await res.json();
      setDataState(saved);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }, []);

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
