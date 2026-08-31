import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { THEME } from '../../theme';

/* Teinte associée à chaque type de notification. */
function toneOf(type) {
  if (type === 'error') return THEME.error;
  if (type === 'warn') return THEME.goldLight;
  if (type === 'info') return '#8FC1F5';
  return THEME.success;
}

export function ToastStack({ toasts }) {
  const iconMap = {
    success: <CheckCircle2 size={16} color={THEME.success} />,
    error: <AlertTriangle size={16} color={THEME.error} />,
    warn: <AlertTriangle size={16} color={THEME.goldLight} />,
    info: <Info size={16} color="#8FC1F5" />,
  };
  return (
    <div
      className="fixed sam-hide-mobile"
      style={{
        top: 20,
        right: 20,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
        maxWidth: 350,
      }}
    >
      {toasts.map((t) => {
        const tone = toneOf(t.type);
        return (
          <div
            key={t.id}
            className="sam-card sam-toast-in"
            style={{
              padding: '14px 17px',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              background: 'linear-gradient(150deg, rgba(21,48,74,0.95), rgba(11,31,51,0.9))',
              boxShadow: `0 20px 46px -18px rgba(2,8,16,0.95), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${tone}22`,
            }}
          >
            <span
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                flexShrink: 0,
                background: `${tone}1F`,
                border: `1px solid ${tone}44`,
              }}
            >
              {iconMap[t.type] || iconMap.success}
            </span>
            <span style={{ fontSize: 13.5, color: THEME.text, lineHeight: 1.45, paddingTop: 4 }}>
              {t.message}
            </span>
          </div>
        );
      })}
      <div className="sam-hide-desktop" />
    </div>
  );
}

export function MobileToasts({ toasts }) {
  return (
    <div
      className="sam-hide-desktop fixed"
      style={{ top: 14, left: 14, right: 14, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 9 }}
    >
      {toasts.slice(-2).map((t) => {
        const tone = toneOf(t.type);
        return (
          <div
            key={t.id}
            className="sam-card sam-toast-in"
            style={{
              padding: '12px 15px',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: 'linear-gradient(150deg, rgba(21,48,74,0.96), rgba(11,31,51,0.92))',
              boxShadow: `0 18px 40px -16px rgba(2,8,16,0.95), 0 0 0 1px ${tone}30`,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: tone,
                boxShadow: `0 0 10px ${tone}`,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12.5, color: THEME.text }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
