import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import BarChart from '../components/BarChart';
import { useData } from '../lib/DataContext';
import { requireAuth } from '../lib/requireAuth';
import { fmt, fmtDateTime } from '../lib/format';

export const getServerSideProps = requireAuth;

const HUB_TILES = [
  { href: '/calculator', icon: '🧮', label: 'Калькулятор' },
  { href: '/cars', icon: '🚗', label: 'Мои авто' },
  { href: '/deals', icon: '🤝', label: 'Сделки' },
  { href: '/clients', icon: '👥', label: 'Клиенты' },
  { href: '/suppliers', icon: '📦', label: 'Дубай' },
  { href: '/expenses', icon: '🧾', label: 'Расходы' },
  { href: '/analytics', icon: '📊', label: 'Аналитика' },
  { href: '/tasks', icon: '✅', label: 'Задачи' },
];

function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${dt.getMonth()}`;
}

function last6Months() {
  const out = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('ru-RU', { month: 'short' }) });
  }
  return out;
}

export default function Home() {
  const { data, loading, update } = useData();

  if (loading || !data) {
    return <div className="loading-screen">Загрузка…</div>;
  }

  const inProgressCars = data.cars.filter((c) => c.status === 'in_progress').length;
  const openDeals = data.deals.filter((d) => d.status === 'open');
  const potentialProfit = openDeals.reduce((s, d) => s + (Number(d.profitUsd) || 0), 0);

  const now = new Date();
  const dealsThisMonth = data.deals.filter((d) => {
    if (!d.date) return false;
    const dd = new Date(d.date);
    return dd.getFullYear() === now.getFullYear() && dd.getMonth() === now.getMonth();
  }).length;

  const months = last6Months();
  const profitByMonth = months.map((m) => {
    const sum = data.deals
      .filter((d) => d.status === 'closed' && d.date && monthKey(d.date) === m.key)
      .reduce((s, d) => s + (Number(d.profitUsd) || 0), 0);
    return { label: m.label, value: Math.max(0, sum) };
  });

  const currentMonthProfit = profitByMonth[profitByMonth.length - 1]?.value || 0;

  function editCapital() {
    const v = prompt('Капитал, USD', String(data.meta.capital || 0));
    if (v === null) return;
    const num = parseFloat(v.replace(',', '.'));
    update((prev) => ({ ...prev, meta: { ...prev.meta, capital: Number.isFinite(num) ? num : 0 } }));
  }

  const recentCalcs = [...data.calcHistory].slice(0, 3);

  return (
    <Layout>
      <Head>
        <title>Auto Tracker</title>
      </Head>

      <div className="kpi-grid">
        <div onClick={editCapital} style={{ cursor: 'pointer' }}>
          <KpiCard icon="💰" value={`$${fmt(data.meta.capital, 0)}`} label="Капитал (нажмите, чтобы изменить)" accent />
        </div>
        <KpiCard icon="🚗" value={inProgressCars} label="Авто в работе" />
        <KpiCard icon="📈" value={`$${fmt(potentialProfit, 0)}`} label="Потенц. прибыль" accent />
        <KpiCard icon="🧾" value={dealsThisMonth} label="Сделок за месяц" />
      </div>

      <Link href="/calculator" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginBottom: 18 }}>
        + Рассчитать авто
      </Link>

      <div className="nav-grid">
        {HUB_TILES.map((t) => (
          <Link key={t.href} href={t.href} className="nav-tile">
            <span className="nav-tile-icon">{t.icon}</span>
            <span className="nav-tile-label">{t.label}</span>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Последние расчёты</h2>
          <Link href="/calculator" className="btn-link">Все →</Link>
        </div>
        {recentCalcs.length === 0 && <p className="empty-hint">Пока нет расчётов</p>}
        {recentCalcs.map((c) => (
          <div className="list-item" key={c.id}>
            <div className="list-item-top">
              <div>
                <div className="list-item-title">{fmtDateTime(c.timestamp)}</div>
                <div className="list-item-sub">${fmt(c.totalUsd)} · {fmt(c.totalAed)} AED · {fmt(c.totalKgs, 0)} KGS</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Финансы</h2>
          <Link href="/analytics" className="btn-link">Аналитика →</Link>
        </div>
        <div className="kpi-value accent">${fmt(currentMonthProfit, 0)}</div>
        <div className="kpi-label" style={{ marginBottom: 4 }}>Чистая прибыль (закрытые сделки), этот месяц</div>
        <BarChart bars={profitByMonth} />
      </div>
    </Layout>
  );
}
