export function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="sam-label">{label}</label>
      {children}
    </div>
  );
}
