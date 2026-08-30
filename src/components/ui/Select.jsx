export function Select({ value, onChange, options, style }) {
  return (
    <select
      className="sam-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ cursor: 'pointer', ...style }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
