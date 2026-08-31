import { THEME } from '../../theme';
export function WaveDivider({ width }) {
  return (
    <svg width={width || 120} height="10" viewBox="0 0 120 10" fill="none" style={{ opacity: 0.9 }}>
      <defs>
        <linearGradient id="samWaveFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={THEME.goldLight} />
          <stop offset="55%" stopColor={THEME.gold} />
          <stop offset="100%" stopColor={THEME.gold} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 5 Q 10 0, 20 5 T 40 5 T 60 5 T 80 5 T 100 5 T 120 5"
        stroke="url(#samWaveFade)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
