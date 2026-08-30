import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { THEME } from '../../theme';
export function ToastStack({ toasts }) {
  const iconMap = {
    success: <CheckCircle2 size={17} color={THEME.success} />,
    error: <AlertTriangle size={17} color={THEME.error} />,
    warn: <AlertTriangle size={17} color={THEME.goldLight} />,
    info: <Info size={17} color="#8FC1F5" />,
  };
  return (
    <div
      className="fixed sam-hide-mobile"
      style={{
        top: 18,
        right: 18,
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 340,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="sam-card sam-toast-in"
          style={{
            padding: '13px 16px',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            borderLeft: `3px solid ${t.type === 'error' ? THEME.error : t.type === 'warn' ? THEME.goldLight : t.type === 'info' ? '#8FC1F5' : THEME.success}`,
          }}
        >
          {iconMap[t.type] || iconMap.success}
          <span style={{ fontSize: 13.5, color: THEME.text, lineHeight: 1.4 }}>{t.message}</span>
        </div>
      ))}
      <div className="sam-hide-desktop" />
    </div>
  );
}

export function MobileToasts({ toasts }) {
  return (
    <div
      className="sam-hide-desktop fixed"
      style={{ top: 14, left: 14, right: 14, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {toasts.slice(-2).map((t) => (
        <div
          key={t.id}
          className="sam-card sam-toast-in"
          style={{
            padding: '11px 14px',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            borderLeft: `3px solid ${t.type === 'error' ? THEME.error : THEME.success}`,
          }}
        >
          <span style={{ fontSize: 12.5, color: THEME.text }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
