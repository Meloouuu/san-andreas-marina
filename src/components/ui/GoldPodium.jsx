import { THEME } from '../../theme';

/* Pastille de classement. Les médailles emoji ont été remplacées par une
   pastille rendue en CSS (voir design.md : pas d'emoji comme icône). */
const RANK_STYLE = [
  {
    background: `linear-gradient(140deg, ${THEME.goldLight}, ${THEME.gold})`,
    color: '#071525',
    border: '1px solid rgba(240,199,94,0.6)',
    shadow: '0 8px 22px -8px rgba(212,167,44,0.75)',
  },
  {
    background: 'linear-gradient(140deg, rgba(226,232,240,0.9), rgba(148,163,184,0.75))',
    color: '#071525',
    border: '1px solid rgba(226,232,240,0.55)',
    shadow: '0 8px 20px -10px rgba(226,232,240,0.5)',
  },
  {
    background: 'linear-gradient(140deg, rgba(212,167,44,0.5), rgba(146,110,32,0.6))',
    color: '#071525',
    border: '1px solid rgba(212,167,44,0.4)',
    shadow: '0 8px 20px -10px rgba(212,167,44,0.45)',
  },
];

export function GoldPodium({ rank }) {
  const style = RANK_STYLE[rank];
  return (
    <span
      className="flex items-center justify-center"
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        flexShrink: 0,
        fontSize: 12.5,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        background: style ? style.background : 'rgba(255,255,255,0.06)',
        color: style ? style.color : THEME.textMuted,
        border: style ? style.border : '1px solid rgba(255,255,255,0.1)',
        boxShadow: style ? `${style.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)` : 'none',
      }}
    >
      {rank + 1}
    </span>
  );
}
