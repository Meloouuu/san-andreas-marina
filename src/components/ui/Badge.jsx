export function Badge({ status, label }) {
  const tone = statusTone(status);
  const dotMap = { success: '🟢', error: '🔴', warn: '🟠', info: '🔵', gold: '🟡', neutral: '⚪' };
  return (
    <span className={`sam-badge sam-badge-${tone}`}>
      <span style={{ fontSize: 9 }}>{dotMap[tone]}</span>
      {label || status}
    </span>
  );
}
