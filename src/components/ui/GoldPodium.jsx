export function GoldPodium({ rank }) {
  const medals = ['🥇', '🥈', '🥉'];
  return <span style={{ fontSize: 20 }}>{medals[rank] || `#${rank + 1}`}</span>;
}
