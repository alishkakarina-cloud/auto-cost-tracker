import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';
import { fmtDateTime } from '../lib/format';


export default function Rates() {
  const { data, loading, update } = useData();
  const [fetching, setFetching] = useState(false);

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;
  const rates = data.rates;

  function setRate(key, value) {
    update((prev) => ({ ...prev, rates: { ...prev.rates, [key]: parseFloat(value) || 0 } }));
  }

  async function fetchLiveRate() {
    setFetching(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const json = await res.json();
      const kgs = json?.rates?.KGS;
      if (kgs) {
        update((prev) => ({ ...prev, rates: { ...prev.rates, usdKgs: Number(kgs.toFixed(2)), updatedAt: new Date().toISOString() } }));
      }
    } catch (e) {
      alert('Не удалось получить курс. Введите вручную.');
    } finally {
      setFetching(false);
    }
  }

  return (
    <Layout title="Курсы валют">
      <Head><title>Курсы — Auto Tracker</title></Head>

      <section className="card">
        <div className="field-row">
          <label>AED → USD</label>
          <input type="number" step="0.0001" value={rates.aedUsd} onChange={(e) => setRate('aedUsd', e.target.value)} />
          <span className="hint">Фиксированный курс дирхама к доллару (привязка ОАЭ). Меняется редко, но можно скорректировать вручную.</span>
        </div>
        <div className="field-row">
          <label>USD → KGS</label>
          <div className="amount-currency">
            <input type="number" step="0.01" value={rates.usdKgs} onChange={(e) => setRate('usdKgs', e.target.value)} />
            <button type="button" className="btn-secondary" onClick={fetchLiveRate} disabled={fetching}>
              {fetching ? 'Загрузка...' : 'Обновить курс'}
            </button>
          </div>
          <span className="hint">
            {rates.updatedAt ? `Обновлён: ${fmtDateTime(rates.updatedAt)}` : 'Курс не обновлялся из интернета'}
          </span>
        </div>
        <p className="hint">Эти курсы используются во всём приложении: в калькуляторе и при расчёте прибыли по сделкам.</p>
      </section>
    </Layout>
  );
}
