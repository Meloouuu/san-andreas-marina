import { THEME } from '../../theme';
export function StatCard({ label, value, icon, sub, highlight }) {
  return (
    <div
      className="sam-card sam-card-hover"
      style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}
    >
      {highlight && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${THEME.gold}, ${THEME.goldLight})`,
          }}
        />
      )}
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span className="sam-label" style={{ marginBottom: 0 }}>
          {label}
        </span>
        {icon && <div style={{ color: THEME.gold, opacity: 0.85 }}>{icon}</div>}
      </div>
      <div
        className="sam-display"
        style={{ fontSize: 30, fontWeight: 700, color: THEME.text, lineHeight: 1.1 }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
