import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';
import { fmt, fmtDate, toUsd } from '../lib/format';
import { makeId } from '../lib/id';


const EMPTY = {
  carId: '',
  clientId: '',
  saleAmount: '',
  saleCurrency: 'USD',
  costUsd: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'open',
};

export default function Deals() {
  const { data, loading, update } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState('all');

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  function onCarChange(carId) {
    const car = data.cars.find((c) => c.id === carId);
    setForm((f) => ({ ...f, carId, costUsd: car ? String(car.costUsd) : f.costUsd }));
  }

  function addDeal(e) {
    e.preventDefault();
    const saleUsd = toUsd(parseFloat(form.saleAmount) || 0, form.saleCurrency, data.rates);
    const costUsd = parseFloat(form.costUsd) || 0;
    update((prev) => ({
      ...prev,
      deals: [
        {
          id: makeId(),
          carId: form.carId || null,
          clientId: form.clientId || null,
          saleUsd,
          costUsd,
          profitUsd: saleUsd - costUsd,
          date: form.date,
          status: form.status,
        },
        ...prev.deals,
      ],
    }));
    setForm(EMPTY);
    setShowForm(false);
  }

  function toggleStatus(id) {
    update((prev) => ({
      ...prev,
      deals: prev.deals.map((d) => (d.id === id ? { ...d, status: d.status === 'open' ? 'closed' : 'open' } : d)),
    }));
  }

  function removeDeal(id) {
    if (!confirm('Удалить сделку?')) return;
    update((prev) => ({ ...prev, deals: prev.deals.filter((d) => d.id !== id) }));
  }

  const deals = data.deals.filter((d) => (filter === 'all' ? true : d.status === filter));

  return (
    <Layout title="Сделки">
      <Head><title>Сделки — Auto Tracker</title></Head>

      <div className="tabs">
        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
        <button className={`tab-btn ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>Открытые</button>
        <button className={`tab-btn ${filter === 'closed' ? 'active' : ''}`} onClick={() => setFilter('closed')}>Закрытые</button>
      </div>

      <button className="btn-primary" style={{ marginBottom: 14 }} onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Отмена' : '+ Добавить сделку'}
      </button>

      {showForm && (
        <form className="card" onSubmit={addDeal}>
          <div className="field-row">
            <label>Авто</label>
            <select value={form.carId} onChange={(e) => onCarChange(e.target.value)}>
              <option value="">Не указано</option>
              {data.cars.map((c) => <option value={c.id} key={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="field-row">
            <label>Клиент</label>
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">Не указан</option>
              {data.clients.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field-row">
            <label>Цена продажи</label>
            <div className="amount-currency">
              <input type="number" value={form.saleAmount} onChange={(e) => setForm({ ...form, saleAmount: e.target.value })} placeholder="0" />
              <select value={form.saleCurrency} onChange={(e) => setForm({ ...form, saleCurrency: e.target.value })}>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="KGS">KGS</option>
              </select>
            </div>
          </div>
          <div className="field-row">
            <label>Себестоимость, USD</label>
            <input type="number" value={form.costUsd} onChange={(e) => setForm({ ...form, costUsd: e.target.value })} placeholder="Заполнится из авто" />
          </div>
          <div className="form-row-2">
            <div className="field-row">
              <label>Дата</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="field-row">
              <label>Статус</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Открыта</option>
                <option value="closed">Закрыта</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" type="submit">Добавить</button>
        </form>
      )}

      {deals.length === 0 && <p className="empty-hint">Пока нет сделок</p>}
      {deals.map((d) => {
        const car = data.cars.find((c) => c.id === d.carId);
        const client = data.clients.find((c) => c.id === d.clientId);
        return (
          <div className="list-item" key={d.id}>
            <div className="list-item-top">
              <div>
                <div className="list-item-title">{car?.title || 'Без авто'}</div>
                <div className="list-item-sub">{client?.name || 'Без клиента'} · {fmtDate(d.date)}</div>
              </div>
              <div className="list-item-value">${fmt(d.profitUsd, 0)}</div>
            </div>
            <div className="list-item-sub" style={{ marginTop: 6 }}>
              Продажа ${fmt(d.saleUsd)} · Себестоимость ${fmt(d.costUsd)}
            </div>
            <div className="list-item-actions" style={{ marginTop: 10 }}>
              <span className={`badge ${d.status}`} onClick={() => toggleStatus(d.id)} style={{ cursor: 'pointer' }}>
                {d.status === 'open' ? 'Открыта' : 'Закрыта'}
              </span>
              <button className="btn-icon" onClick={() => removeDeal(d.id)}>Удалить</button>
            </div>
          </div>
        );
      })}
    </Layout>
  );
}
