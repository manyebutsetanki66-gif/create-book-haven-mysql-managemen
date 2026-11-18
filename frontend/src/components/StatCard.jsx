// One number on the dashboard. "tone" can be "warning" to draw attention (low stock).
export default function StatCard({ icon, label, value, tone = '' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <span className="stat-icon"><i className={`fa-solid ${icon}`} aria-hidden="true" /></span>
      <div>
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}
