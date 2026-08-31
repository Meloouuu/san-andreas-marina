import { Search } from 'lucide-react';
import { THEME } from '../../theme';
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
      <Search
        size={15}
        style={{
          position: 'absolute',
          left: 17,
          top: '50%',
          transform: 'translateY(-50%)',
          color: THEME.textMuted,
          pointerEvents: 'none',
        }}
      />
      <input
        className="sam-input"
        style={{ paddingLeft: 42, borderRadius: 999 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Rechercher...'}
      />
    </div>
  );
}
