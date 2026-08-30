import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { THEME, LOGO } from '../theme';
import { FieldRow } from '../components/ui';

export function LoginPage({ onLogin, notify }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit() {
    setError('');
    if (!email.trim() || !password) {
      setError('Veuillez saisir votre adresse e-mail et votre mot de passe.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = onLogin(email.trim(), password);
      if (!res.ok) setError(res.error);
      setLoading(false);
    }, 300);
  }

  function onKey(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div
      className="sam-root sam-fade-in"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 20,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 900px 500px at 50% 0%, rgba(212,167,44,0.09), transparent 60%), linear-gradient(180deg, #071525, #050f1c 70%)`,
        }}
      />
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: 220,
          opacity: 0.5,
        }}
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <path
          d="M0,120 C 240,200 480,40 720,120 C 960,200 1200,40 1440,120 L1440,220 L0,220 Z"
          fill="rgba(212,167,44,0.045)"
        />
        <path
          d="M0,160 C 240,80 480,220 720,160 C 960,100 1200,200 1440,140 L1440,220 L0,220 Z"
          fill="rgba(16,40,63,0.7)"
        />
      </svg>
      <svg
        style={{ position: 'absolute', top: 40, left: 40, opacity: 0.12 }}
        width="90"
        height="90"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke={THEME.gold} strokeWidth="0.7" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke={THEME.gold} strokeWidth="0.7" />
        <path d="M12 12 L16 8 M12 12 L10 15" stroke={THEME.gold} strokeWidth="1" strokeLinecap="round" />
      </svg>

      <div
        className="sam-card sam-modal-anim"
        style={{ width: '100%', maxWidth: 420, padding: '40px 34px', position: 'relative', zIndex: 2 }}
      >
        <div className="flex flex-col items-center" style={{ marginBottom: 22 }}>
          <div style={{ position: 'relative', marginBottom: 14, width: 128, height: 128 }}>
            <div
              style={{
                position: 'absolute',
                inset: -20,
                background: 'radial-gradient(circle, rgba(212,167,44,0.30), transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
            <img
              src={LOGO}
              alt="San Andreas Marina"
              style={{ width: 128, height: 128, objectFit: 'contain', position: 'relative' }}
            />
          </div>
          <h1
            className="sam-display"
            style={{ fontSize: 25, fontWeight: 700, textAlign: 'center', margin: 0, letterSpacing: '.01em' }}
          >
            Bienvenue à San Andreas Marina
          </h1>
          <p style={{ color: THEME.textMuted, fontSize: 13.5, textAlign: 'center', margin: '8px 0 0' }}>
            Connectez-vous à votre espace professionnel.
          </p>
        </div>

        <div>
          <FieldRow label="Adresse e-mail">
            <input
              className="sam-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={onKey}
              placeholder="prenom.nom@sanandreasmarina.com"
            />
          </FieldRow>
          <FieldRow label="Mot de passe">
            <div style={{ position: 'relative' }}>
              <input
                className="sam-input"
                style={{ paddingRight: 40 }}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKey}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: THEME.textMuted,
                  cursor: 'pointer',
                }}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </FieldRow>

          {error && (
            <div
              style={{
                background: 'rgba(224,82,82,0.12)',
                border: '1px solid rgba(224,82,82,0.3)',
                color: '#F3A5A5',
                fontSize: 13,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="sam-btn sam-btn-gold"
            style={{ width: '100%', padding: '12px', fontSize: 14, letterSpacing: '.04em' }}
            disabled={loading}
          >
            {loading ? 'CONNEXION...' : 'SE CONNECTER'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span
            style={{ color: THEME.textMuted, fontSize: 13, cursor: 'pointer' }}
            onClick={() =>
              notify('Contactez un administrateur pour réinitialiser votre mot de passe.', 'info')
            }
          >
            Mot de passe oublié ?
          </span>
        </div>

        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: `1px solid ${THEME.border}`,
            fontSize: 11.5,
            color: THEME.textMuted,
            textAlign: 'center',
            lineHeight: 1.8,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: THEME.goldLight,
              marginBottom: 4,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              fontSize: 10,
            }}
          ></div>
          Bienvenue dans l'équipage ⚓🚁 <br />
        </div>
      </div>
    </div>
  );
}
