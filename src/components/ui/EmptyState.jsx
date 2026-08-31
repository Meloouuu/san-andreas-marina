import { THEME } from '../../theme';
export function EmptyState({ icon, text, sub }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ padding: '58px 20px', color: THEME.textMuted, textAlign: 'center' }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 74,
          height: 74,
          borderRadius: '50%',
          marginBottom: 18,
          color: THEME.goldLight,
          background: 'radial-gradient(circle, rgba(212,167,44,0.16), rgba(212,167,44,0.02) 70%)',
          border: '1px solid rgba(212,167,44,0.18)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 600, color: THEME.text }}>{text}</div>
      {sub && <div style={{ fontSize: 13, marginTop: 6, maxWidth: 340, lineHeight: 1.6 }}>{sub}</div>}
    </div>
  );
}
