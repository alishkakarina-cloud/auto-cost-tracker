import { put, list } from '@vercel/blob';

const STATE_PATH = 'data/state.json';

export function defaultState() {
  return {
    meta: { capital: 0 },
    rates: { aedUsd: 3.6725, usdKgs: 87.5, updatedAt: null },
    calcHistory: [],
    cars: [],
    deals: [],
    clients: [],
    suppliers: [],
    expenses: [],
    tasks: [],
    notes: '',
  };
}

function mergeWithDefaults(state) {
  const d = defaultState();
  return {
    meta: { ...d.meta, ...(state.meta || {}) },
    rates: { ...d.rates, ...(state.rates || {}) },
    calcHistory: Array.isArray(state.calcHistory) ? state.calcHistory : d.calcHistory,
    cars: Array.isArray(state.cars) ? state.cars : d.cars,
    deals: Array.isArray(state.deals) ? state.deals : d.deals,
    clients: Array.isArray(state.clients) ? state.clients : d.clients,
    suppliers: Array.isArray(state.suppliers) ? state.suppliers : d.suppliers,
    expenses: Array.isArray(state.expenses) ? state.expenses : d.expenses,
    tasks: Array.isArray(state.tasks) ? state.tasks : d.tasks,
    notes: typeof state.notes === 'string' ? state.notes : d.notes,
  };
}

export async function readState() {
  try {
    const { blobs } = await list({ prefix: STATE_PATH, limit: 1, token: process.env.BLOB_READ_WRITE_TOKEN });
    const blob = blobs.find((b) => b.pathname === STATE_PATH) || blobs[0];
    if (!blob) return defaultState();
    const res = await fetch(blob.url, { cache: 'no-store' });
    if (!res.ok) return defaultState();
    const json = await res.json();
    return mergeWithDefaults(json);
  } catch (err) {
    console.error('readState failed', err);
    return defaultState();
  }
}

export async function writeState(state) {
  const safe = mergeWithDefaults(state);
  await put(STATE_PATH, JSON.stringify(safe), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return safe;
}
