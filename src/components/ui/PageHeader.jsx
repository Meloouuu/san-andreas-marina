import { WaveDivider } from './WaveDivider';
import { THEME } from '../../theme';
export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4" style={{ marginBottom: 26 }}>
      <div>
        {eyebrow && (
          <div
            style={{
              color: THEME.gold,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1 className="sam-display" style={{ fontSize: 30, fontWeight: 700, color: THEME.text, margin: 0 }}>
          {title}
        </h1>
        <div style={{ margin: '10px 0' }}>
          <WaveDivider width={90} />
        </div>
        {subtitle && (
          <p style={{ color: THEME.textMuted, fontSize: 14.5, margin: 0, maxWidth: 560 }}>{subtitle}</p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
