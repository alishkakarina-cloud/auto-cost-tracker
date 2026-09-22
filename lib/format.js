export function fmt(num, decimals = 2) {
  const n = Number(num) || 0;
  return n.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function toUsd(amount, currency, rates) {
  const n = Number(amount) || 0;
  if (currency === 'USD') return n;
  if (currency === 'AED') return n / rates.aedUsd;
  if (currency === 'KGS') return n / rates.usdKgs;
  return 0;
}

export function fromUsd(usd, rates) {
  return {
    aed: usd * rates.aedUsd,
    usd,
    kgs: usd * rates.usdKgs,
  };
}
