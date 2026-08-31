import { statusTone } from '../../lib/utils';
import { THEME } from '../../theme';

/* Puce colorée rendue en CSS plutôt qu'en emoji : rendu identique sur tous
   les systèmes et cohérent avec le reste de l'interface (voir design.md). */
const DOT_COLOR = {
  success: THEME.success,
  error: THEME.error,
  warn: THEME.goldLight,
  info: '#8FC1F5',
  gold: THEME.gold,
  neutral: THEME.textMuted,
};

export function Badge({ status, label }) {
  const tone = statusTone(status);
  const color = DOT_COLOR[tone] || DOT_COLOR.neutral;
  return (
    <span className={`sam-badge sam-badge-${tone}`}>
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }}
      />
      {label || status}
    </span>
  );
}
