import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';
import { requireAuth } from '../lib/requireAuth';
import { fmt, fmtDateTime, toUsd } from '../lib/format';
import { makeId } from '../lib/id';

export const getServerSideProps = requireAuth;

const LABELS = {
  carPrice: 'Цена авто',
  logistics: 'Логистика / доставка',
  customs: 'Растаможка / пошлины',
  other: 'Прочие расходы',
};

const DEFAULT_INPUTS = {
  carPrice: { amount: '', currency: 'AED' },
  logistics: { amount: '', currency: 'USD' },
  customs: { amount: '', currency: 'KGS' },
  other: { amount: '', currency: 'AED' },
};

export default function Calculator() {
  const { data, loading, update } = useData();
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [carTitle, setCarTitle] = useState('');
  const [result, setResult] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [rateFetching, setRateFetching] = useState(false);
  const [savedCarMsg, setSavedCarMsg] = useState('');

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  const rates = data.rates;

  function setRate(key, value) {
    update((prev) => ({ ...prev, rates: { ...prev.rates, [key]: parseFloat(value) || 0 } }));
  }

  async function fetchLiveRate() {
    setRateFetching(true);
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
      setRateFetching(false);
    }
  }

  function setInput(key, field, value) {
    setInputs((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  function calculate() {
    const items = [];
    let totalUsd = 0;
    for (const key of Object.keys(inputs)) {
      const amount = parseFloat(inputs[key].amount) || 0;
      const currency = inputs[key].currency;
      const usd = toUsd(amount, currency, rates);
      totalUsd += usd;
      items.push({ label: LABELS[key], amount, currency, usd });
    }
    const totalAed = totalUsd * rates.aedUsd;
    const totalKgs = totalUsd * rates.usdKgs;
    const record = {
      id: makeId(),
      timestamp: new Date().toISOString(),
      items,
      rates: { ...rates },
      totalAed,
      totalUsd,
      totalKgs,
    };
    setResult(record);
    setSavedCarMsg('');
    update((prev) => ({ ...prev, calcHistory: [record, ...prev.calcHistory].slice(0, 100) }));
  }

  function deleteHistoryItem(id) {
    update((prev) => ({ ...prev, calcHistory: prev.calcHistory.filter((r) => r.id !== id) }));
  }

  function clearHistory() {
    if (!confirm('Удалить всю историю расчётов?')) return;
    update((prev) => ({ ...prev, calcHistory: [] }));
  }

  function saveAsCar() {
    if (!result) return;
    const title = carTitle.trim() || 'Авто без названия';
    update((prev) => ({
      ...prev,
      cars: [
        {
          id: makeId(),
          title,
          status: 'in_progress',
          costUsd: result.totalUsd,
          costAed: result.totalAed,
          costKgs: result.totalKgs,
          createdAt: new Date().toISOString(),
          notes: '',
        },
        ...prev.cars,
      ],
    }));
    setSavedCarMsg(`Сохранено в «Мои авто»: ${title}`);
    setCarTitle('');
  }

  return (
    <Layout title="Калькулятор себестоимости">
      <Head>
        <title>Калькулятор — Auto Tracker</title>
      </Head>

      <section className="card">
        <h2 className="card-title">Курсы валют</h2>
        <div className="field-row">
          <label>AED → USD</label>
          <input type="number" step="0.0001" value={rates.aedUsd} onChange={(e) => setRate('aedUsd', e.target.value)} />
          <span className="hint">Фиксированный курс дирхама (можно менять вручную)</span>
        </div>
        <div className="field-row">
          <label>USD → KGS</label>
          <div className="amount-currency">
            <input type="number" step="0.01" value={rates.usdKgs} onChange={(e) => setRate('usdKgs', e.target.value)} />
            <button type="button" className="btn-secondary" onClick={fetchLiveRate} disabled={rateFetching}>
              {rateFetching ? 'Загрузка...' : 'Обновить курс'}
            </button>
          </div>
          <span className="hint">
            {rates.updatedAt ? `Обновлён: ${fmtDateTime(rates.updatedAt)}` : 'Курс не обновлялся из интернета'}
          </span>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Расходы</h2>
        {Object.keys(inputs).map((key) => (
          <div className="field-row" key={key}>
            <label>{LABELS[key]}</label>
            <div className="amount-currency">
              <input
                type="number"
                min="0"
                placeholder="0"
                value={inputs[key].amount}
                onChange={(e) => setInput(key, 'amount', e.target.value)}
              />
              <select value={inputs[key].currency} onChange={(e) => setInput(key, 'currency', e.target.value)}>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="KGS">KGS</option>
              </select>
            </div>
          </div>
        ))}
        <button type="button" className="btn-primary" onClick={calculate}>Рассчитать себестоимость</button>
      </section>

      {result && (
        <section className="card">
          <h2 className="card-title">Итоговая себестоимость</h2>
          <div className="result-grid">
            <div className="result-box">
              <span className="result-currency">AED</span>
              <span className="result-value">{fmt(result.totalAed)}</span>
            </div>
            <div className="result-box">
              <span className="result-currency">USD</span>
              <span className="result-value">{fmt(result.totalUsd)}</span>
            </div>
            <div className="result-box">
              <span className="result-currency">KGS</span>
              <span className="result-value">{fmt(result.totalKgs, 0)}</span>
            </div>
          </div>
          <button type="button" className="btn-link" onClick={() => setShowBreakdown((s) => !s)}>
            {showBreakdown ? 'Скрыть детали расчёта' : 'Показать детали расчёта'}
          </button>
          {showBreakdown && (
            <div className="breakdown">
              {result.items.filter((i) => i.amount > 0).map((i, idx) => (
                <div className="breakdown-row" key={idx}>
                  <span>{i.label} ({fmt(i.amount)} {i.currency})</span>
                  <span>${fmt(i.usd)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="field-row" style={{ marginTop: 14 }}>
            <label>Сохранить как авто в работе (необязательно)</label>
            <div className="amount-currency">
              <input placeholder="Например, BMW X5 2020" value={carTitle} onChange={(e) => setCarTitle(e.target.value)} />
              <button type="button" className="btn-secondary" onClick={saveAsCar}>Сохранить</button>
            </div>
            {savedCarMsg && <span className="hint" style={{ color: 'var(--accent)' }}>{savedCarMsg}</span>}
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">История расчётов</h2>
          <button type="button" className="btn-link btn-danger" onClick={clearHistory}>Очистить всё</button>
        </div>
        {data.calcHistory.length === 0 && <p className="empty-hint">Пока нет сохранённых расчётов</p>}
        {data.calcHistory.map((rec) => (
          <div className="list-item" key={rec.id}>
            <div className="list-item-top">
              <span className="list-item-sub">{fmtDateTime(rec.timestamp)}</span>
              <button className="btn-icon" onClick={() => deleteHistoryItem(rec.id)}>Удалить</button>
            </div>
            <div className="result-grid" style={{ marginTop: 8, marginBottom: 0 }}>
              <div className="result-box">
                <span className="result-currency">AED</span>
                <span className="result-value" style={{ fontSize: 13 }}>{fmt(rec.totalAed)}</span>
              </div>
              <div className="result-box">
                <span className="result-currency">USD</span>
                <span className="result-value" style={{ fontSize: 13 }}>{fmt(rec.totalUsd)}</span>
              </div>
              <div className="result-box">
                <span className="result-currency">KGS</span>
                <span className="result-value" style={{ fontSize: 13 }}>{fmt(rec.totalKgs, 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}
