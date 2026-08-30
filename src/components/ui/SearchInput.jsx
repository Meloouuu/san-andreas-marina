import { Search } from 'lucide-react';
import { THEME } from '../../theme';
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
      <Search
        size={15}
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: THEME.textMuted,
        }}
      />
      <input
        className="sam-input"
        style={{ paddingLeft: 36 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Rechercher...'}
      />
    </div>
  );
}
