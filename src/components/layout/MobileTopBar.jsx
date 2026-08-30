import { Bell, Menu } from 'lucide-react';
import { THEME, LOGO } from '../../theme';

export function MobileTopBar({ onOpenMenu, onBell, notifCount }) {
  return (
    <div
      className="sam-hide-desktop flex items-center justify-between"
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${THEME.border}`,
        background: THEME.bg2,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <button
        onClick={onOpenMenu}
        style={{ background: 'none', border: 'none', color: THEME.text, cursor: 'pointer', padding: 6 }}
      >
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2">
        <img src={LOGO} alt="logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
        <span className="sam-display" style={{ fontSize: 16.5, fontWeight: 700 }}>
          San Andreas <span style={{ color: THEME.gold }}>Marina</span>
        </span>
      </div>
      <button
        onClick={onBell}
        style={{
          background: 'none',
          border: 'none',
          color: THEME.text,
          cursor: 'pointer',
          padding: 6,
          position: 'relative',
        }}
      >
        <Bell size={20} />
        {notifCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: THEME.error,
            }}
          />
        )}
      </button>
    </div>
  );
}

