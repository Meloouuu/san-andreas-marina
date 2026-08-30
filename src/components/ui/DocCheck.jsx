import { Check } from 'lucide-react';
import { THEME } from '../../theme';
export function DocCheck({ label, checked, onToggle, disabled }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ cursor: disabled ? 'default' : 'pointer', padding: '8px 0' }}
      onClick={disabled ? undefined : onToggle}
    >
      <div className={`sam-checkbox ${checked ? 'checked' : 'missing'}`}>
        {checked && <Check size={13} color="#071525" strokeWidth={3} />}
      </div>
      <span style={{ fontSize: 14, color: checked ? THEME.text : THEME.textMuted }}>{label}</span>
    </div>
  );
}
