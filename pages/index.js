import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import BarChart from '../components/BarChart';
import {
  IconWallet,
  IconCar,
  IconTrendUp,
  IconFile,
  IconPlus,
  IconArrowRight,
  IconCalculator,
  IconHandshake,
  IconUsers,
  IconPlane,
  IconReceipt,
  IconBarChart,
  IconBook,
  IconBuilding,
  IconClock,
  IconCheckSquare,
} from '../components/Icons';
import { useData } from '../lib/DataContext';
import { fmt, fmtDateTime } from '../lib/format';

const HUB_TILES = [
  { href: '/calculator', Icon: IconCalculator, label: 'Калькулятор' },
  { href: '/cars', Icon: IconCar, label: 'Мои авто' },
  { href: '/deals', Icon: IconHandshake, label: 'Сделки' },
  { href: '/clients', Icon: IconUsers, label: 'Клиенты' },
  { href: '/suppliers', Icon: IconPlane, label: 'Дубай' },
  { href: '/expenses', Icon: IconReceipt, label: 'Расходы' },
  { href: '/analytics', Icon: IconBarChart, label: 'Аналитика' },
  { href: '/handbook', Icon: IconBook, label: 'Справочник' },
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

  const inProgressCars = data.cars.filter((c) => c.status === 'in_progress');
  const carsFromSuppliers = inProgressCars.filter((c) => c.supplierId).length;
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
  const carsFromSuppliersTotal = data.cars.filter((c) => c.supplierId).length;
  const previewTasks = data.tasks.slice(0, 4);

  return (
    <Layout>
      <Head>
        <title>Auto Tracker</title>
      </Head>

      <div className="kpi-grid">
        <div onClick={editCapital} style={{ cursor: 'pointer' }}>
          <KpiCard icon={<IconWallet />} value={`$${fmt(data.meta.capital, 0)}`} label="Капитал" sub="нажмите, чтобы изменить" />
        </div>
        <KpiCard
          icon={<IconCar />}
          value={inProgressCars.length}
          label="В работе"
          sub={carsFromSuppliers > 0 ? `${carsFromSuppliers} от поставщика` : undefined}
        />
        <KpiCard
          icon={<IconTrendUp />}
          value={`$${fmt(potentialProfit, 0)}`}
          label="Потенц. прибыль"
          sub={openDeals.length > 0 ? `${openDeals.length} сделок в работе` : undefined}
        />
        <KpiCard icon={<IconFile />} value={dealsThisMonth} label="Сделок за месяц" />
      </div>

      <Link href="/calculator" className="cta-pill">
        <IconPlus size={18} />
        Рассчитать авто
        <IconArrowRight size={18} className="cta-arrow" />
      </Link>

      <div className="nav-grid">
        {HUB_TILES.map((t) => (
          <Link key={t.href} href={t.href} className="nav-tile">
            <span className="nav-tile-icon"><t.Icon size={22} /></span>
            <span className="nav-tile-label">{t.label}</span>
          </Link>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Последние расчёты</h2>
            <Link href="/calculator" className="btn-link">Все →</Link>
          </div>
          {recentCalcs.length === 0 && <p className="empty-hint">Пока нет расчётов</p>}
          {recentCalcs.map((c) => (
            <div className="list-item-row" style={{ marginBottom: 10 }} key={c.id}>
              <span className="list-item-icon"><IconCar size={16} /></span>
              <div>
                <div className="list-item-title" style={{ fontSize: 12.5 }}>{fmtDateTime(c.timestamp)}</div>
                <div className="list-item-sub">${fmt(c.totalUsd, 0)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Дубай</h2>
            <Link href="/suppliers" className="btn-link">Все →</Link>
          </div>
          <div className="mini-stat-row">
            <span className="mini-stat-icon"><IconBuilding size={15} /></span>
            <div>
              <div className="mini-stat-value">{data.suppliers.length}</div>
              <div className="mini-stat-label">Поставщиков</div>
            </div>
          </div>
          <div className="mini-stat-row">
            <span className="mini-stat-icon"><IconCar size={15} /></span>
            <div>
              <div className="mini-stat-value">{carsFromSuppliersTotal}</div>
              <div className="mini-stat-label">Авто от поставщиков</div>
            </div>
          </div>
          <div className="mini-stat-row">
            <span className="mini-stat-icon"><IconClock size={15} /></span>
            <div>
              <div className="mini-stat-value">{openDeals.length}</div>
              <div className="mini-stat-label">Открытых сделок</div>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Финансы</h2>
            <Link href="/analytics" className="btn-link">→</Link>
          </div>
          <div className="kpi-value accent" style={{ fontSize: 18 }}>${fmt(currentMonthProfit, 0)}</div>
          <div className="kpi-label" style={{ marginBottom: 4 }}>Прибыль, этот месяц</div>
          <BarChart bars={profitByMonth} />
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Задачи</h2>
            <Link href="/tasks" className="btn-link">Все →</Link>
          </div>
          {previewTasks.length === 0 && <p className="empty-hint">Пока нет задач</p>}
          {previewTasks.map((t) => (
            <div className={`task-mini ${t.done ? 'done' : ''}`} key={t.id}>
              <IconCheckSquare size={14} />
              {t.text}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
