import { X } from 'lucide-react';
import { THEME } from '../../theme';
export function Modal({ open, onClose, title, subtitle, children, width }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sam-fade-in"
      style={{ background: 'rgba(3,10,18,0.72)', backdropFilter: 'blur(3px)', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        className="sam-card sam-modal-anim"
        style={{
          width: '100%',
          maxWidth: width || 560,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: '18px 22px', borderBottom: `1px solid ${THEME.border}`, flexShrink: 0 }}
        >
          <div>
            <h3
              className="sam-display"
              style={{ fontSize: 21, fontWeight: 700, color: THEME.goldLight, margin: 0 }}
            >
              {title}
            </h3>
            {subtitle && (
              <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '3px 0 0' }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              color: THEME.textMuted,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
