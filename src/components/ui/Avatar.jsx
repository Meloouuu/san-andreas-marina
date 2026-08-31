import { initials } from '../../lib/utils';
import { THEME } from '../../theme';
export function Avatar({ name, photo, size, square }) {
  const s = size || 38;
  const radius = square ? Math.max(10, Math.round(s * 0.28)) : '50%';
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{
          width: s,
          height: s,
          flexShrink: 0,
          borderRadius: radius,
          objectFit: 'cover',
          border: '1px solid rgba(212,167,44,0.28)',
          boxShadow: '0 8px 22px -10px rgba(2,8,16,0.9)',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: radius,
        flexShrink: 0,
        background: 'linear-gradient(140deg, rgba(212,167,44,0.28), rgba(212,167,44,0.06))',
        border: '1px solid rgba(212,167,44,0.28)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 22px -12px rgba(212,167,44,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: THEME.goldLight,
        fontWeight: 700,
        fontSize: s * 0.38,
        letterSpacing: '.02em',
      }}
    >
      {initials(...(name || '').split(' '))}
    </div>
  );
}
