import { AlertTriangle } from 'lucide-react';
import { THEME } from '../../theme';
export function ConfirmDialog({ open, onCancel, onConfirm, title, message, danger, confirmLabel }) {
  if (!open) return null;
  const tone = danger ? THEME.error : THEME.gold;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sam-fade-in"
      style={{
        background: 'rgba(3,10,18,0.74)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 300,
      }}
      onClick={onCancel}
    >
      <div
        className="sam-card sam-modal-anim"
        style={{
          width: '100%',
          maxWidth: 410,
          padding: 26,
          background: 'linear-gradient(155deg, rgba(21,48,74,0.95), rgba(11,31,51,0.9))',
          boxShadow: '0 40px 90px -24px rgba(2,8,16,0.95), inset 0 1px 0 rgba(255,255,255,0.09)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tone}2E, ${tone}0A 70%)`,
            border: `1px solid ${tone}44`,
            boxShadow: `0 10px 30px -12px ${tone}99, inset 0 1px 0 rgba(255,255,255,0.1)`,
            marginBottom: 18,
          }}
        >
          <AlertTriangle size={22} color={tone} />
        </div>
        <h3 className="sam-display" style={{ fontSize: 21, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.2 }}>
          {title}
        </h3>
        <p style={{ color: THEME.textMuted, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>{message}</p>
        <div className="flex justify-end gap-3">
          <button className="sam-btn sam-btn-ghost" onClick={onCancel}>
            Annuler
          </button>
          <button className={`sam-btn ${danger ? 'sam-btn-danger' : 'sam-btn-gold'}`} onClick={onConfirm}>
            {confirmLabel || 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
