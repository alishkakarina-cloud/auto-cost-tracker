export default function KpiCard({ icon, value, label, accent }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className={`kpi-value ${accent ? 'accent' : ''}`}>{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
