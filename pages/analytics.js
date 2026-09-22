import Head from 'next/head';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import BarChart from '../components/BarChart';
import { useData } from '../lib/DataContext';
import { fmt, toUsd } from '../lib/format';


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

export default function Analytics() {
  const { data, loading } = useData();
  if (loading || !data) return <div className="loading-screen">Загрузка…</div>;

  const closedDeals = data.deals.filter((d) => d.status === 'closed');
  const totalRevenue = closedDeals.reduce((s, d) => s + (Number(d.saleUsd) || 0), 0);
  const totalCost = closedDeals.reduce((s, d) => s + (Number(d.costUsd) || 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalExpenses = data.expenses.reduce((s, e) => s + toUsd(e.amount, e.currency, data.rates), 0);

  const months = last6Months();
  const profitByMonth = months.map((m) => ({
    label: m.label,
    value: Math.max(
      0,
      closedDeals.filter((d) => d.date && monthKey(d.date) === m.key).reduce((s, d) => s + (Number(d.profitUsd) || 0), 0)
    ),
  }));

  const byClient = {};
  closedDeals.forEach((d) => {
    if (!d.clientId) return;
    byClient[d.clientId] = (byClient[d.clientId] || 0) + (Number(d.profitUsd) || 0);
  });
  const topClients = Object.entries(byClient)
    .map(([id, profit]) => ({ client: data.clients.find((c) => c.id === id), profit }))
    .filter((x) => x.client)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  return (
    <Layout title="Аналитика">
      <Head><title>Аналитика — Auto Tracker</title></Head>

      <div className="kpi-grid">
        <KpiCard icon="💰" value={`$${fmt(data.meta.capital, 0)}`} label="Капитал" accent />
        <KpiCard icon="📈" value={`$${fmt(totalProfit, 0)}`} label="Прибыль (закрытые сделки)" accent />
        <KpiCard icon="🧾" value={`$${fmt(totalExpenses, 0)}`} label="Общие расходы" />
        <KpiCard icon="🤝" value={closedDeals.length} label="Закрытых сделок" />
      </div>

      <div className="card">
        <h2 className="card-title">Прибыль по месяцам (закрытые сделки)</h2>
        <BarChart bars={profitByMonth} />
      </div>

      <div className="card">
        <h2 className="card-title">Топ клиентов по прибыли</h2>
        {topClients.length === 0 && <p className="empty-hint">Пока нет данных</p>}
        {topClients.map(({ client, profit }) => (
          <div className="list-item" key={client.id}>
            <div className="list-item-top">
              <div className="list-item-title">{client.name}</div>
              <div className="list-item-value">${fmt(profit, 0)}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
