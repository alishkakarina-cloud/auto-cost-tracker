import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { isAuthenticated } from '../lib/auth';

export async function getServerSideProps(context) {
  if (isAuthenticated(context.req)) {
    return { redirect: { destination: '/', permanent: false } };
  }
  return { props: {} };
}

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/');
      } else {
        setError('Неверный пароль');
      }
    } catch (e) {
      setError('Ошибка сети');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <Head>
        <title>Вход — Auto Tracker</title>
      </Head>
      <form className="login-box" onSubmit={onSubmit}>
        <div className="brand-title" style={{ marginBottom: 4 }}>
          AUTO<span className="brand-accent">TRACKER</span>
        </div>
        <p className="hint" style={{ marginBottom: 20 }}>Личный трекер себестоимости авто</p>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="login-input"
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: 14 }}>
          {busy ? 'Проверка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
