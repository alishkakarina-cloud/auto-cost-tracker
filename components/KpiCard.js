export default function KpiCard({ icon, value, label, delta, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {delta && <div className="kpi-delta">{delta}</div>}
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
