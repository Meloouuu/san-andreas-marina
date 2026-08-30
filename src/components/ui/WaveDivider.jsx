import { THEME } from '../../theme';
export function WaveDivider({ width }) {
  return (
    <svg width={width || 120} height="10" viewBox="0 0 120 10" fill="none" style={{ opacity: 0.85 }}>
      <path
        d="M0 5 Q 10 0, 20 5 T 40 5 T 60 5 T 80 5 T 100 5 T 120 5"
        stroke={THEME.gold}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   COMPOSANTS RÉUTILISABLES
   ============================================================ */
