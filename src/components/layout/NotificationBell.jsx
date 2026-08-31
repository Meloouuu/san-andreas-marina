import { Bell } from 'lucide-react';
import { THEME } from '../../theme';

/* Teinte de la puce selon le type de notification (mêmes couleurs que les toasts). */
function toneOf(type) {
  if (type === 'error') return THEME.error;
  if (type === 'warn') return THEME.goldLight;
  if (type === 'info') return '#8FC1F5';
  return THEME.success;
}

export function NotificationBell({ log, open, setOpen }) {
  return (
    <div style={{ position: 'relative' }} className="sam-hide-mobile">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{
          background: open ? 'rgba(212,167,44,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(212,167,44,0.4)' : 'rgba(255,255,255,0.09)'}`,
          borderRadius: 999,
          width: 42,
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: open ? THEME.goldLight : THEME.text,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: open ? '0 8px 26px -12px rgba(212,167,44,0.6)' : 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all .22s cubic-bezier(.22,.8,.3,1)',
        }}
      >
        <Bell size={18} />
        {log.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 9,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: THEME.error,
              boxShadow: `0 0 8px ${THEME.error}`,
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
            top: 52,
            width: 330,
            maxHeight: 380,
            overflowY: 'auto',
            zIndex: 60,
            background: 'linear-gradient(155deg, rgba(21,48,74,0.96), rgba(11,31,51,0.93))',
            boxShadow: '0 34px 70px -22px rgba(2,8,16,0.95), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: THEME.textMuted,
            }}
          >
            Notifications
          </div>
          {log.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
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
                    padding: '12px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: 13,
                    color: THEME.text,
                    display: 'flex',
                    gap: 11,
                    alignItems: 'flex-start',
                    lineHeight: 1.45,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      marginTop: 6,
                      flexShrink: 0,
                      background: toneOf(n.type),
                      boxShadow: `0 0 8px ${toneOf(n.type)}`,
                    }}
                  />
                  <span>{n.message}</span>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
