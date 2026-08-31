import { Bell, Menu } from 'lucide-react';
import { THEME, LOGO } from '../../theme';

/* Bouton rond translucide de la barre mobile. */
const iconButton = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  color: THEME.text,
  cursor: 'pointer',
  padding: 0,
  position: 'relative',
};

export function MobileTopBar({ onOpenMenu, onBell, notifCount }) {
  return (
    <div
      className="sam-hide-desktop flex items-center justify-between"
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(11,31,51,0.92), rgba(7,21,37,0.82))',
        backdropFilter: 'blur(20px) saturate(120%)',
        WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        boxShadow: '0 14px 40px -24px rgba(2,8,16,0.95)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <button onClick={onOpenMenu} aria-label="Ouvrir le menu" style={iconButton}>
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
        <span style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
          <span
            style={{
              position: 'absolute',
              inset: -8,
              background: 'radial-gradient(circle, rgba(212,167,44,0.28), transparent 70%)',
              filter: 'blur(6px)',
            }}
          />
          <img
            src={LOGO}
            alt="San Andreas Marina"
            style={{ width: 34, height: 34, objectFit: 'contain', position: 'relative' }}
          />
        </span>
        <span className="sam-display" style={{ fontSize: 16.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
          San Andreas <span style={{ color: THEME.gold }}>Marina</span>
        </span>
      </div>

      <button onClick={onBell} aria-label="Notifications" style={iconButton}>
        <Bell size={18} />
        {notifCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: THEME.error,
              boxShadow: `0 0 8px ${THEME.error}`,
            }}
          />
        )}
      </button>
    </div>
  );
}
