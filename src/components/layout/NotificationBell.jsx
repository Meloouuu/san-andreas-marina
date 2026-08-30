import { Bell } from 'lucide-react';
import { THEME } from '../../theme';

export function NotificationBell({ log, open, setOpen }) {
  return (
    <div style={{ position: 'relative' }} className="sam-hide-mobile">
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: THEME.card,
          border: `1px solid ${THEME.border}`,
          borderRadius: 10,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: THEME.text,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <Bell size={18} />
        {log.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 7,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: THEME.error,
            }}
          />
        )}
      </button>
      {open && (
        <div
          className="sam-card sam-modal-anim"
          style={{
            position: 'absolute',
            right: 0,
            top: 48,
            width: 320,
            maxHeight: 380,
            overflowY: 'auto',
            zIndex: 60,
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${THEME.border}`,
              fontWeight: 700,
              fontSize: 13.5,
            }}
          >
            Notifications
          </div>
          {log.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
              Aucune notification récente.
            </div>
          ) : (
            log
              .slice()
              .reverse()
              .map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '11px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: 13,
                    color: THEME.text,
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <span>
                    {n.type === 'error' ? '⚠️' : n.type === 'warn' ? '🔔' : n.type === 'info' ? 'ℹ️' : '✅'}
                  </span>
                  <span>{n.message}</span>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
