export function Select({ value, onChange, options, style }) {
  return (
    <select
      className="sam-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ cursor: 'pointer', borderRadius: 999, paddingRight: 14, ...style }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
