import { THEME } from '../../theme';
export function EmptyState({ icon, text, sub }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ padding: '50px 20px', color: THEME.textMuted, textAlign: 'center' }}
    >
      <div style={{ color: THEME.gold, opacity: 0.6, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text }}>{text}</div>
      {sub && <div style={{ fontSize: 13, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
