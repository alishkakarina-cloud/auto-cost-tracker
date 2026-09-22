import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';
import { requireAuth } from '../lib/requireAuth';
import { fmt, fmtDate, toUsd } from '../lib/format';
import { makeId } from '../lib/id';

export const getServerSideProps = requireAuth;

const EMPTY = { category: '', amount: '', currency: 'USD', date: new Date().toISOString().slice(0, 10), note: '' };

export default function Expenses() {
  const { data, loading, update } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  function addExpense(e) {
    e.preventDefault();
    if (!form.category.trim()) return;
    update((prev) => ({
      ...prev,
      expenses: [
        { id: makeId(), category: form.category.trim(), amount: parseFloat(form.amount) || 0, currency: form.currency, date: form.date, note: form.note },
        ...prev.expenses,
      ],
    }));
    setForm(EMPTY);
    setShowForm(false);
  }

  function removeExpense(id) {
    if (!confirm('Удалить расход?')) return;
    update((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));
  }

  const totalUsd = data.expenses.reduce((s, e) => s + toUsd(e.amount, e.currency, data.rates), 0);

  return (
    <Layout title="Расходы">
      <Head><title>Расходы — Auto Tracker</title></Head>

      <div className="card">
        <div className="kpi-label">Итого расходов</div>
        <div className="kpi-value accent" style={{ fontSize: 24 }}>${fmt(totalUsd, 0)}</div>
      </div>

      <button className="btn-primary" style={{ marginBottom: 14 }} onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Отмена' : '+ Добавить расход'}
      </button>

      {showForm && (
        <form className="card" onSubmit={addExpense}>
          <div className="field-row">
            <label>Категория</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Офис, поездка, реклама..." autoFocus />
          </div>
          <div className="field-row">
            <label>Сумма</label>
            <div className="amount-currency">
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="KGS">KGS</option>
              </select>
            </div>
          </div>
          <div className="field-row">
            <label>Дата</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="field-row">
            <label>Заметка</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <button className="btn-primary" type="submit">Добавить</button>
        </form>
      )}

      {data.expenses.length === 0 && <p className="empty-hint">Пока нет расходов</p>}
      {data.expenses.map((e) => (
        <div className="list-item" key={e.id}>
          <div className="list-item-top">
            <div>
              <div className="list-item-title">{e.category}</div>
              <div className="list-item-sub">{fmtDate(e.date)}{e.note ? ` · ${e.note}` : ''}</div>
            </div>
            <div className="list-item-value">{fmt(e.amount)} {e.currency}</div>
          </div>
          <div className="list-item-actions" style={{ marginTop: 10 }}>
            <button className="btn-icon" onClick={() => removeExpense(e.id)}>Удалить</button>
          </div>
        </div>
      ))}
    </Layout>
  );
}
