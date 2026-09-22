export default function BarChart({ bars }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="bar-chart">
      {bars.map((b, i) => (
        <div className="bar-col" key={i}>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${Math.max(4, (b.value / max) * 100)}%` }}
              title={String(b.value)}
            />
          </div>
          <span className="bar-label">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
