import { THEME } from '../../theme';
export function StatCard({ label, value, icon, sub, highlight }) {
  return (
    <div
      className="sam-card sam-card-hover"
      style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Halo d'ambiance : remplace l'ancien filet doré en haut de carte. */}
      <div
        style={{
          position: 'absolute',
          top: -70,
          right: -50,
          width: 190,
          height: 190,
          borderRadius: '50%',
          background: highlight
            ? 'radial-gradient(circle, rgba(212,167,44,0.26), transparent 70%)'
            : 'radial-gradient(circle, rgba(212,167,44,0.09), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="flex items-center justify-between" style={{ marginBottom: 14, position: 'relative' }}>
        <span className="sam-label" style={{ marginBottom: 0 }}>
          {label}
        </span>
        {icon && (
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              flexShrink: 0,
              color: THEME.goldLight,
              background: 'linear-gradient(140deg, rgba(212,167,44,0.2), rgba(212,167,44,0.05))',
              border: '1px solid rgba(212,167,44,0.24)',
              boxShadow: '0 6px 18px -8px rgba(212,167,44,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        className="sam-display"
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: THEME.text,
          lineHeight: 1.05,
          position: 'relative',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>

      {sub && (
        <div style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 8, position: 'relative' }}>{sub}</div>
      )}
    </div>
  );
}
