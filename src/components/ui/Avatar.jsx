import { THEME } from '../../theme';
export function Avatar({ name, photo, size, square }) {
  const s = size || 38;
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{
          width: s,
          height: s,
          borderRadius: square ? 10 : '50%',
          objectFit: 'cover',
          border: `1px solid ${THEME.border}`,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: square ? 10 : '50%',
        flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(212,167,44,0.25), rgba(212,167,44,0.08))',
        border: `1px solid ${THEME.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: THEME.goldLight,
        fontWeight: 700,
        fontSize: s * 0.38,
      }}
    >
      {initials(...(name || '').split(' '))}
    </div>
  );
}
