import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';
import { makeId } from '../lib/id';


const EMPTY = { name: '', phone: '', notes: '' };

export default function Clients() {
  const { data, loading, update } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  function addClient(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    update((prev) => ({
      ...prev,
      clients: [{ id: makeId(), name: form.name.trim(), phone: form.phone.trim(), notes: form.notes }, ...prev.clients],
    }));
    setForm(EMPTY);
    setShowForm(false);
  }

  function removeClient(id) {
    if (!confirm('Удалить клиента?')) return;
    update((prev) => ({ ...prev, clients: prev.clients.filter((c) => c.id !== id) }));
  }

  return (
    <Layout title="Клиенты">
      <Head><title>Клиенты — Auto Tracker</title></Head>

      <button className="btn-primary" style={{ marginBottom: 14 }} onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Отмена' : '+ Добавить клиента'}
      </button>

      {showForm && (
        <form className="card" onSubmit={addClient}>
          <div className="field-row">
            <label>Имя</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="field-row">
            <label>Телефон</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+996..." />
          </div>
          <div className="field-row">
            <label>Заметки</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button className="btn-primary" type="submit">Добавить</button>
        </form>
      )}

      {data.clients.length === 0 && <p className="empty-hint">Пока нет клиентов</p>}
      {data.clients.map((c) => {
        const dealCount = data.deals.filter((d) => d.clientId === c.id).length;
        return (
          <div className="list-item" key={c.id}>
            <div className="list-item-top">
              <div>
                <div className="list-item-title">{c.name}</div>
                <div className="list-item-sub">{c.phone || 'Без телефона'} · сделок: {dealCount}</div>
              </div>
              <button className="btn-icon" onClick={() => removeClient(c.id)}>Удалить</button>
            </div>
            {c.notes && <div className="list-item-sub" style={{ marginTop: 6 }}>{c.notes}</div>}
          </div>
        );
      })}
    </Layout>
  );
}
