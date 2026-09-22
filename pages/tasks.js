import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';
import { makeId } from '../lib/id';


export default function Tasks() {
  const { data, loading, update } = useData();
  const [text, setText] = useState('');

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  function addTask(e) {
    e.preventDefault();
    if (!text.trim()) return;
    update((prev) => ({ ...prev, tasks: [{ id: makeId(), text: text.trim(), done: false }, ...prev.tasks] }));
    setText('');
  }

  function toggleTask(id) {
    update((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  }

  function removeTask(id) {
    update((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  }

  const active = data.tasks.filter((t) => !t.done);
  const done = data.tasks.filter((t) => t.done);

  return (
    <Layout title="Задачи">
      <Head><title>Задачи — Auto Tracker</title></Head>

      <form className="card" onSubmit={addTask} style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Новая задача..." style={{ flex: 1 }} />
        <button className="btn-secondary" type="submit" style={{ width: 'auto' }}>Добавить</button>
      </form>

      {data.tasks.length === 0 && <p className="empty-hint">Пока нет задач</p>}

      {active.map((t) => (
        <div className="list-item" key={t.id}>
          <div className="list-item-top">
            <span onClick={() => toggleTask(t.id)} style={{ cursor: 'pointer' }}>☐ {t.text}</span>
            <button className="btn-icon" onClick={() => removeTask(t.id)}>✕</button>
          </div>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <p className="hint" style={{ margin: '14px 0 8px' }}>Выполнено</p>
          {done.map((t) => (
            <div className="list-item" key={t.id}>
              <div className="list-item-top">
                <span className="badge done" onClick={() => toggleTask(t.id)} style={{ cursor: 'pointer' }}>☑ {t.text}</span>
                <button className="btn-icon" onClick={() => removeTask(t.id)}>✕</button>
              </div>
            </div>
          ))}
        </>
      )}
    </Layout>
  );
}
