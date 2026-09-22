import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';
import { makeId } from '../lib/id';


const EMPTY = { name: '', contact: '', notes: '' };

export default function Suppliers() {
  const { data, loading, update } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  function addSupplier(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    update((prev) => ({
      ...prev,
      suppliers: [{ id: makeId(), name: form.name.trim(), contact: form.contact.trim(), notes: form.notes }, ...prev.suppliers],
    }));
    setForm(EMPTY);
    setShowForm(false);
  }

  function removeSupplier(id) {
    if (!confirm('Удалить поставщика?')) return;
    update((prev) => ({ ...prev, suppliers: prev.suppliers.filter((s) => s.id !== id) }));
  }

  return (
    <Layout title="Дубай · Поставщики">
      <Head><title>Дубай — Auto Tracker</title></Head>

      <button className="btn-primary" style={{ marginBottom: 14 }} onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Отмена' : '+ Добавить поставщика'}
      </button>

      {showForm && (
        <form className="card" onSubmit={addSupplier}>
          <div className="field-row">
            <label>Название / имя</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="field-row">
            <label>Контакт</label>
            <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="телефон / WhatsApp" />
          </div>
          <div className="field-row">
            <label>Заметки</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button className="btn-primary" type="submit">Добавить</button>
        </form>
      )}

      {data.suppliers.length === 0 && <p className="empty-hint">Пока нет поставщиков</p>}
      {data.suppliers.map((s) => {
        const carsCount = data.cars.filter((c) => c.supplierId === s.id).length;
        return (
          <div className="list-item" key={s.id}>
            <div className="list-item-top">
              <div>
                <div className="list-item-title">{s.name}</div>
                <div className="list-item-sub">{s.contact || 'Без контакта'} · авто: {carsCount}</div>
              </div>
              <button className="btn-icon" onClick={() => removeSupplier(s.id)}>Удалить</button>
            </div>
            {s.notes && <div className="list-item-sub" style={{ marginTop: 6 }}>{s.notes}</div>}
          </div>
        );
      })}
    </Layout>
  );
}
