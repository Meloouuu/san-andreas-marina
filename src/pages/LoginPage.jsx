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
    setTimeout(async () => {
      const res = await onLogin(email.trim(), password);
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
      {/* --- Décor : nappes lumineuses --- */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 1000px 620px at 50% -12%, rgba(212,167,44,0.16), transparent 62%),' +
            'radial-gradient(circle 620px at 12% 88%, rgba(21,48,74,0.9), transparent 65%),' +
            'radial-gradient(circle 520px at 92% 22%, rgba(212,167,44,0.07), transparent 65%),' +
            'linear-gradient(180deg, #071525, #050f1c 72%)',
        }}
      />

      {/* Anneaux concentriques diffus, à la manière d'une rose des vents */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 940,
          height: 940,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1px solid rgba(212,167,44,0.07)',
          boxShadow: 'inset 0 0 120px rgba(212,167,44,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 620,
          height: 620,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '1px solid rgba(212,167,44,0.09)',
          pointerEvents: 'none',
        }}
      />

      {/* Vagues du bas */}
      <svg
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 240, opacity: 0.6 }}
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <path
          d="M0,120 C 240,200 480,40 720,120 C 960,200 1200,40 1440,120 L1440,220 L0,220 Z"
          fill="rgba(212,167,44,0.05)"
        />
        <path
          d="M0,160 C 240,80 480,220 720,160 C 960,100 1200,200 1440,140 L1440,220 L0,220 Z"
          fill="rgba(16,40,63,0.72)"
        />
      </svg>

      {/* --- Carte de connexion --- */}
      <div
        className="sam-card sam-modal-anim"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '44px 38px 34px',
          position: 'relative',
          zIndex: 2,
          borderRadius: 28,
          background: 'linear-gradient(160deg, rgba(21,48,74,0.82), rgba(11,31,51,0.66))',
          boxShadow: '0 50px 100px -30px rgba(2,8,16,0.95), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="flex flex-col items-center" style={{ marginBottom: 28 }}>
          <div style={{ position: 'relative', marginBottom: 18, width: 132, height: 132 }}>
            <div
              style={{
                position: 'absolute',
                inset: -26,
                background: 'radial-gradient(circle, rgba(212,167,44,0.38), transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            <img
              src={LOGO}
              alt="San Andreas Marina"
              style={{ width: 132, height: 132, objectFit: 'contain', position: 'relative' }}
            />
          </div>
          <h1
            className="sam-display"
            style={{
              fontSize: 30,
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: '.01em',
              textShadow: '0 10px 34px rgba(2,8,16,0.7)',
            }}
          >
            Bienvenue à San Andreas Marina
          </h1>
          <p
            style={{
              color: THEME.textMuted,
              fontSize: 13.5,
              textAlign: 'center',
              margin: '10px 0 0',
              lineHeight: 1.6,
            }}
          >
            Connectez-vous à votre espace professionnel.
          </p>
        </div>

        <div>
          <FieldRow label="Adresse e-mail">
            <input
              className="sam-input"
              style={{ borderRadius: 999 }}
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
                style={{ paddingRight: 48, borderRadius: 999 }}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKey}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: THEME.textMuted,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
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
                padding: '11px 15px',
                borderRadius: 14,
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="sam-btn sam-btn-gold"
            style={{ width: '100%', padding: '15px', fontSize: 13.5, letterSpacing: '.14em' }}
            disabled={loading}
          >
            {loading ? 'CONNEXION...' : 'SE CONNECTER'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span
            style={{
              color: THEME.textMuted,
              fontSize: 13,
              cursor: 'pointer',
              borderBottom: '1px solid rgba(170,183,196,0.25)',
              paddingBottom: 2,
            }}
            onClick={() =>
              notify('Contactez un administrateur pour réinitialiser votre mot de passe.', 'info')
            }
          >
            Mot de passe oublié ?
          </span>
        </div>

        <div
          style={{
            marginTop: 28,
            paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.07)',
            fontSize: 11.5,
            color: THEME.textMuted,
            textAlign: 'center',
            letterSpacing: '.06em',
            lineHeight: 1.8,
          }}
        >
          Bienvenue dans l'équipage ⚓🚁
        </div>
      </div>
    </div>
  );
}
