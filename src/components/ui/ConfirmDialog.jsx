import { AlertTriangle } from 'lucide-react';
import { THEME } from '../../theme';
export function ConfirmDialog({ open, onCancel, onConfirm, title, message, danger, confirmLabel }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sam-fade-in"
      style={{ background: 'rgba(3,10,18,0.72)', zIndex: 300 }}
      onClick={onCancel}
    >
      <div
        className="sam-card sam-modal-anim"
        style={{ width: '100%', maxWidth: 400, padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(224,82,82,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <AlertTriangle size={22} color={THEME.error} />
        </div>
        <h3 className="sam-display" style={{ fontSize: 19, fontWeight: 700, margin: '0 0 8px' }}>
          {title}
        </h3>
        <p style={{ color: THEME.textMuted, fontSize: 14, margin: '0 0 20px', lineHeight: 1.5 }}>{message}</p>
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
