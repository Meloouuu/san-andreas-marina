import { WaveDivider } from './WaveDivider';
import { THEME } from '../../theme';
export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4" style={{ marginBottom: 30 }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: THEME.goldLight,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              marginBottom: 12,
              padding: '5px 13px',
              borderRadius: 999,
              background: 'linear-gradient(120deg, rgba(212,167,44,0.16), rgba(212,167,44,0.04))',
              border: '1px solid rgba(212,167,44,0.24)',
              boxShadow: '0 6px 20px -10px rgba(212,167,44,0.5)',
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          className="sam-display"
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: THEME.text,
            margin: 0,
            lineHeight: 1.08,
            textShadow: '0 8px 30px rgba(2,8,16,0.6)',
          }}
        >
          {title}
        </h1>
        <div style={{ margin: '12px 0' }}>
          <WaveDivider width={110} />
        </div>
        {subtitle && (
          <p style={{ color: THEME.textMuted, fontSize: 14.5, margin: 0, maxWidth: 580, lineHeight: 1.6 }}>
            {subtitle}
          </p>
        )}
      </div>
      {/* maxWidth laisse les boutons passer à la ligne sur petit écran plutôt
          que de déborder : flexShrink 0 seul les garde en une seule rangée. */}
      {action && <div style={{ flexShrink: 0, maxWidth: '100%' }}>{action}</div>}
    </div>
  );
}
