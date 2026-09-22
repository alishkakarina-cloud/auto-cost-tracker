import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';
import { fmt, fmtDate } from '../lib/format';
import { makeId } from '../lib/id';


const EMPTY = { title: '', status: 'in_progress', costUsd: '', supplierId: '', notes: '' };

export default function Cars() {
  const { data, loading, update } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState('all');

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  function addCar(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    update((prev) => ({
      ...prev,
      cars: [
        {
          id: makeId(),
          title: form.title.trim(),
          status: form.status,
          costUsd: parseFloat(form.costUsd) || 0,
          supplierId: form.supplierId || null,
          notes: form.notes,
          createdAt: new Date().toISOString(),
        },
        ...prev.cars,
      ],
    }));
    setForm(EMPTY);
    setShowForm(false);
  }

  function toggleStatus(id) {
    update((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => (c.id === id ? { ...c, status: c.status === 'in_progress' ? 'sold' : 'in_progress' } : c)),
    }));
  }

  function removeCar(id) {
    if (!confirm('Удалить это авто?')) return;
    update((prev) => ({ ...prev, cars: prev.cars.filter((c) => c.id !== id) }));
  }

  const cars = data.cars.filter((c) => (filter === 'all' ? true : c.status === filter));

  return (
    <Layout title="Мои авто">
      <Head><title>Мои авто — Auto Tracker</title></Head>

      <div className="tabs">
        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
        <button className={`tab-btn ${filter === 'in_progress' ? 'active' : ''}`} onClick={() => setFilter('in_progress')}>В работе</button>
        <button className={`tab-btn ${filter === 'sold' ? 'active' : ''}`} onClick={() => setFilter('sold')}>Проданы</button>
      </div>

      <button className="btn-primary" style={{ marginBottom: 14 }} onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Отмена' : '+ Добавить авто'}
      </button>

      {showForm && (
        <form className="card" onSubmit={addCar}>
          <div className="field-row">
            <label>Название (марка, модель, год)</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="BMW X5 2020" autoFocus />
          </div>
          <div className="field-row">
            <label>Себестоимость, USD</label>
            <input type="number" value={form.costUsd} onChange={(e) => setForm({ ...form, costUsd: e.target.value })} placeholder="0" />
          </div>
          <div className="field-row">
            <label>Поставщик (Дубай)</label>
            <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">Не указан</option>
              {data.suppliers.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field-row">
            <label>Заметки</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button className="btn-primary" type="submit">Добавить</button>
        </form>
      )}

      {cars.length === 0 && <p className="empty-hint">Пока нет авто в этой категории</p>}
      {cars.map((c) => {
        const supplier = data.suppliers.find((s) => s.id === c.supplierId);
        return (
          <div className="list-item" key={c.id}>
            <div className="list-item-top">
              <div>
                <div className="list-item-title">{c.title}</div>
                <div className="list-item-sub">
                  {fmtDate(c.createdAt)}{supplier ? ` · ${supplier.name}` : ''}
                </div>
              </div>
              <div className="list-item-value">${fmt(c.costUsd, 0)}</div>
            </div>
            {c.notes && <div className="list-item-sub" style={{ marginTop: 6 }}>{c.notes}</div>}
            <div className="list-item-actions" style={{ marginTop: 10 }}>
              <span className={`badge ${c.status === 'in_progress' ? 'open' : 'closed'}`} onClick={() => toggleStatus(c.id)} style={{ cursor: 'pointer' }}>
                {c.status === 'in_progress' ? 'В работе' : 'Продано'}
              </span>
              <button className="btn-icon" onClick={() => removeCar(c.id)}>Удалить</button>
            </div>
          </div>
        );
      })}
    </Layout>
  );
}
