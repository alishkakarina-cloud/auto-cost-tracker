import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useData } from '../lib/DataContext';

export default function Handbook() {
  const { data, loading, update } = useData();
  const [text, setText] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data && !dirty) setText(data.notes || '');
  }, [data, dirty]);

  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  function save() {
    update((prev) => ({ ...prev, notes: text }));
    setDirty(false);
  }

  return (
    <Layout title="Справочник">
      <Head><title>Справочник — Auto Tracker</title></Head>
      <section className="card">
        <p className="hint" style={{ marginBottom: 10 }}>
          Свободные заметки: полезные контакты, правила растаможки, ссылки, пароли от площадок и всё, что стоит держать под рукой.
        </p>
        <textarea
          rows={16}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
          placeholder="Например: таможня КР — правила расчёта пошлины..."
        />
        <button type="button" className="btn-primary" style={{ marginTop: 12 }} onClick={save} disabled={!dirty}>
          {dirty ? 'Сохранить' : 'Сохранено'}
        </button>
      </section>
    </Layout>
  );
}
