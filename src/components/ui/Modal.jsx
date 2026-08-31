import { X } from 'lucide-react';
import { THEME } from '../../theme';
export function Modal({ open, onClose, title, subtitle, children, width }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sam-fade-in"
      style={{
        background: 'rgba(3,10,18,0.74)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 200,
      }}
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
          background: 'linear-gradient(155deg, rgba(21,48,74,0.94), rgba(11,31,51,0.9))',
          boxShadow: '0 40px 90px -24px rgba(2,8,16,0.95), inset 0 1px 0 rgba(255,255,255,0.09)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Halo doré diffus en haut de la modale */}
        <div
          style={{
            position: 'absolute',
            top: -110,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 340,
            height: 220,
            background: 'radial-gradient(circle, rgba(212,167,44,0.18), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="flex items-center justify-between"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h3
              className="sam-display"
              style={{ fontSize: 23, fontWeight: 700, color: THEME.goldLight, margin: 0, lineHeight: 1.15 }}
            >
              {title}
            </h3>
            {subtitle && (
              <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '5px 0 0', lineHeight: 1.5 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex items-center justify-center"
            style={{
              color: THEME.textMuted,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 999,
              width: 34,
              height: 34,
              flexShrink: 0,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '22px 24px', overflowY: 'auto', position: 'relative' }}>{children}</div>
      </div>
    </div>
  );
}
