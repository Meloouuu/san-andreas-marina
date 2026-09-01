import { THEME } from '../../theme';
export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Manrope:wght@400;500;600;700;800&display=swap');

      /* ============================================================
         JETONS DE DESIGN
         Rayons, ombres et halos dérivés uniquement de THEME.
         ============================================================ */
      .sam-root {
        --sam-r-sm: 12px;
        --sam-r-md: 16px;
        --sam-r-lg: 22px;
        --sam-r-xl: 28px;
        --sam-pill: 999px;

        --sam-glass: linear-gradient(155deg, rgba(21,48,74,0.78), rgba(16,40,63,0.52));
        --sam-glass-strong: linear-gradient(155deg, rgba(21,48,74,0.94), rgba(11,31,51,0.88));
        --sam-rim: inset 0 1px 0 rgba(255,255,255,0.07);
        --sam-hairline: 1px solid rgba(255,255,255,0.07);

        --sam-shadow-sm: 0 2px 10px rgba(2,8,16,0.35);
        --sam-shadow-md: 0 16px 40px -14px rgba(2,8,16,0.72);
        --sam-shadow-lg: 0 34px 70px -22px rgba(2,8,16,0.9);
        --sam-glow-gold: 0 10px 34px -10px rgba(212,167,44,0.5);
        --sam-glow-gold-soft: 0 6px 26px -12px rgba(212,167,44,0.42);

        --sam-ease: cubic-bezier(.22,.8,.3,1);
      }

      /* ============================================================
         FOND AMBIANT
         Nappes lumineuses diffuses + grain léger : c'est ce qui donne
         la profondeur "rendu 3D" plutôt qu'un aplat marine.
         ============================================================ */
      .sam-root {
        position: relative;
        isolation: isolate;
        font-family: 'Manrope', sans-serif;
        color: ${THEME.text};
        min-height: 100vh;
        background-color: ${THEME.bg};
        background-image:
          radial-gradient(1100px 720px at 6% -8%, rgba(212,167,44,0.13), transparent 62%),
          radial-gradient(900px 620px at 102% 2%, rgba(21,48,74,0.95), transparent 58%),
          radial-gradient(820px 820px at 88% 106%, rgba(212,167,44,0.07), transparent 60%),
          radial-gradient(700px 500px at 40% 52%, rgba(11,31,51,0.75), transparent 70%);
        background-attachment: fixed;
      }
      .sam-root::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: -1;
        opacity: 0.035;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
      }
      .sam-root * { box-sizing: border-box; }
      .sam-display { font-family: 'Cormorant Garamond', serif; letter-spacing: .005em; }

      .sam-root ::-webkit-scrollbar { width: 7px; height: 7px; }
      .sam-root ::-webkit-scrollbar-track { background: transparent; }
      .sam-root ::-webkit-scrollbar-thumb {
        background: linear-gradient(${THEME.goldLight}, rgba(212,167,44,0.4));
        border-radius: var(--sam-pill);
      }
      .sam-root ::-webkit-scrollbar-thumb:hover { background: linear-gradient(${THEME.goldLight}, ${THEME.gold}); }

      /* ============================================================
         SURFACES
         Panneaux de verre : fond translucide, flou d'arrière-plan,
         liseré clair sur l'arête haute, ombre portée profonde.
         ============================================================ */
      .sam-card {
        position: relative;
        background: var(--sam-glass);
        border: var(--sam-hairline);
        border-radius: var(--sam-r-lg);
        backdrop-filter: blur(20px) saturate(125%);
        -webkit-backdrop-filter: blur(20px) saturate(125%);
        box-shadow: var(--sam-shadow-md), var(--sam-rim);
      }
      .sam-card-hover {
        transition: transform .28s var(--sam-ease), border-color .28s var(--sam-ease), box-shadow .28s var(--sam-ease);
      }
      .sam-card-hover:hover {
        transform: translateY(-3px);
        border-color: rgba(212,167,44,0.34);
        box-shadow: var(--sam-shadow-lg), var(--sam-rim), var(--sam-glow-gold-soft);
      }

      /* ============================================================
         CHAMPS DE SAISIE
         ============================================================ */
      .sam-input {
        background: rgba(7,21,37,0.55);
        border: 1px solid rgba(255,255,255,0.09);
        color: ${THEME.text};
        border-radius: var(--sam-r-sm);
        padding: 12px 16px;
        font-size: 14px;
        font-family: inherit;
        width: 100%;
        outline: none;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: inset 0 1px 2px rgba(2,8,16,0.4);
        transition: border-color .2s var(--sam-ease), box-shadow .2s var(--sam-ease), background .2s var(--sam-ease);
      }
      .sam-input::placeholder { color: rgba(170,183,196,0.65); }
      .sam-input:hover { border-color: rgba(255,255,255,0.16); }
      .sam-input:focus {
        border-color: rgba(212,167,44,0.65);
        background: rgba(7,21,37,0.72);
        box-shadow: 0 0 0 3px rgba(212,167,44,0.16), 0 8px 24px -12px rgba(212,167,44,0.5);
      }
      .sam-label {
        color: ${THEME.textMuted};
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        margin-bottom: 8px;
        display: block;
      }

      /* ============================================================
         BOUTONS — pilules, l'action principale porte le halo doré
         ============================================================ */
      .sam-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        font-family: inherit; font-weight: 700; font-size: 13.5px; letter-spacing: .01em;
        border-radius: var(--sam-pill);
        padding: 12px 22px;
        cursor: pointer; border: none; white-space: nowrap;
        transition: transform .18s var(--sam-ease), box-shadow .24s var(--sam-ease),
                    background .2s var(--sam-ease), border-color .2s var(--sam-ease), filter .2s var(--sam-ease);
      }
      .sam-btn:active { transform: scale(0.975); }
      .sam-btn-gold {
        background: linear-gradient(135deg, ${THEME.goldLight}, ${THEME.gold});
        color: #071525;
        box-shadow: var(--sam-glow-gold), inset 0 1px 0 rgba(255,255,255,0.35);
      }
      .sam-btn-gold:hover {
        filter: brightness(1.06);
        transform: translateY(-1px);
        box-shadow: 0 16px 42px -10px rgba(212,167,44,0.62), inset 0 1px 0 rgba(255,255,255,0.4);
      }
      .sam-btn-ghost {
        background: rgba(255,255,255,0.045);
        color: ${THEME.text};
        border: 1px solid rgba(255,255,255,0.12);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      .sam-btn-ghost:hover {
        border-color: rgba(212,167,44,0.45);
        background: rgba(212,167,44,0.08);
        transform: translateY(-1px);
      }
      .sam-btn-danger {
        background: rgba(224,82,82,0.14);
        color: #F3A5A5;
        border: 1px solid rgba(224,82,82,0.32);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      .sam-btn-danger:hover {
        background: rgba(224,82,82,0.22);
        border-color: rgba(224,82,82,0.5);
        transform: translateY(-1px);
      }
      .sam-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; filter: none; }
      .sam-btn-sm { padding: 9px 15px; font-size: 12.5px; }

      /* ============================================================
         BADGES DE STATUT
         ============================================================ */
      .sam-badge {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 11.5px; font-weight: 700; letter-spacing: .015em;
        padding: 5px 12px;
        border-radius: var(--sam-pill);
        white-space: nowrap;
        border: 1px solid transparent;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .sam-badge-success { background: rgba(32,199,122,0.14); color: #4CDB9B; border-color: rgba(32,199,122,0.26); }
      .sam-badge-error { background: rgba(224,82,82,0.14); color: #F3A5A5; border-color: rgba(224,82,82,0.26); }
      .sam-badge-warn { background: rgba(240,199,94,0.14); color: ${THEME.goldLight}; border-color: rgba(240,199,94,0.26); }
      .sam-badge-info { background: rgba(93,163,240,0.14); color: #8FC1F5; border-color: rgba(93,163,240,0.26); }
      .sam-badge-gold {
        background: rgba(212,167,44,0.16); color: ${THEME.goldLight};
        border-color: rgba(212,167,44,0.3); box-shadow: 0 4px 16px -8px rgba(212,167,44,0.5);
      }
      .sam-badge-neutral { background: rgba(170,183,196,0.12); color: ${THEME.textMuted}; border-color: rgba(170,183,196,0.2); }

      /* ============================================================
         TABLEAUX
         ============================================================ */
      .sam-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
      .sam-table thead th {
        text-align: left; color: rgba(170,183,196,0.85);
        font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .11em;
        padding: 14px 16px; white-space: nowrap;
        background: rgba(7,21,37,0.35);
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }
      .sam-table tbody td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.045); vertical-align: middle; }
      .sam-table tbody tr:last-child td { border-bottom: none; }
      .sam-table tbody tr { transition: background .18s var(--sam-ease); }
      .sam-table tbody tr:hover { background: rgba(212,167,44,0.06); }
      .sam-table-wrap { overflow-x: auto; border-radius: var(--sam-r-lg); }

      /* ============================================================
         ANIMATIONS
         ============================================================ */
      .sam-modal-anim { animation: samModalIn .32s var(--sam-ease); }
      @keyframes samModalIn {
        from { opacity: 0; transform: translateY(14px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .sam-fade-in { animation: samFadeIn .38s var(--sam-ease); }
      @keyframes samFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .sam-toast-in { animation: samToastIn .3s var(--sam-ease); }
      @keyframes samToastIn {
        from { opacity: 0; transform: translateX(20px) scale(0.97); }
        to { opacity: 1; transform: translateX(0) scale(1); }
      }

      /* ============================================================
         IDENTITÉ — haut de la barre latérale
         ============================================================ */
      .sam-brand { display: flex; align-items: center; gap: 14px; padding: 26px 20px 20px; }
      .sam-brand-logo { position: relative; flex-shrink: 0; display: flex; }
      .sam-brand-logo::before {
        content: ''; position: absolute; inset: -12px;
        background: radial-gradient(circle, rgba(212,167,44,0.3), transparent 68%);
        filter: blur(8px);
      }
      .sam-brand-name { font-size: 19px; font-weight: 700; line-height: 1.06; color: ${THEME.text}; letter-spacing: .01em; }
      .sam-brand-name.gold {
        background: linear-gradient(120deg, ${THEME.goldLight}, ${THEME.gold});
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent; color: ${THEME.gold};
      }
      .sam-brand-tag {
        font-size: 9px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase;
        color: rgba(170,183,196,0.55); margin-top: 6px; white-space: nowrap;
      }

      /* ============================================================
         NAVIGATION — pilules, l'état actif porte le halo
         ============================================================ */
      .sam-nav-item {
        display: flex; align-items: center; gap: 12px; width: 100%;
        padding: 11px 15px; margin-bottom: 3px;
        border-radius: var(--sam-pill);
        background: transparent; border: 1px solid transparent;
        color: ${THEME.textMuted}; font-family: inherit; font-size: 13.5px; font-weight: 600;
        cursor: pointer; text-align: left;
        transition: background .22s var(--sam-ease), color .22s var(--sam-ease),
                    border-color .22s var(--sam-ease), box-shadow .22s var(--sam-ease), transform .22s var(--sam-ease);
      }
      .sam-nav-item:hover { background: rgba(255,255,255,0.05); color: ${THEME.text}; transform: translateX(2px); }
      .sam-nav-item:hover .sam-nav-icon { color: ${THEME.goldLight}; }
      .sam-nav-item.active {
        background: linear-gradient(100deg, rgba(212,167,44,0.22), rgba(212,167,44,0.05));
        border-color: rgba(212,167,44,0.3);
        color: ${THEME.goldLight};
        box-shadow: var(--sam-glow-gold-soft), var(--sam-rim);
      }
      .sam-nav-icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 20px; flex-shrink: 0; color: ${THEME.textMuted};
        transition: color .22s var(--sam-ease);
      }
      .sam-nav-item.active .sam-nav-icon { color: ${THEME.gold}; }
      .sam-nav-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sam-nav-dot {
        width: 6px; height: 6px; border-radius: 50%; background: ${THEME.gold}; flex-shrink: 0;
        box-shadow: 0 0 10px rgba(212,167,44,0.9);
      }
      .sam-nav-section-label {
        color: rgba(170,183,196,0.45); font-size: 9.5px; font-weight: 800;
        letter-spacing: .2em; text-transform: uppercase; padding: 20px 17px 8px;
      }

      /* ============================================================
         CARTE PROFIL — bas de la barre latérale
         ============================================================ */
      .sam-profile-card {
        display: flex; align-items: center; gap: 12px; width: 100%;
        padding: 11px 12px; border-radius: var(--sam-r-md); cursor: pointer;
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        font-family: inherit;
        transition: background .22s var(--sam-ease), border-color .22s var(--sam-ease), box-shadow .22s var(--sam-ease);
      }
      .sam-profile-card:hover {
        background: rgba(212,167,44,0.09);
        border-color: rgba(212,167,44,0.3);
        box-shadow: var(--sam-glow-gold-soft);
      }

      /* ============================================================
         CONTRÔLES
         ============================================================ */
      /* Utilisée aussi bien sur un <div> (DocCheck) que sur un <button>
         (to-do list) : padding remis à zéro pour garder la même case de 20px. */
      .sam-checkbox {
        width: 20px; height: 20px; border-radius: 7px; padding: 0;
        border: 1.5px solid rgba(255,255,255,0.24);
        display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0;
        background: rgba(7,21,37,0.4);
        transition: all .2s var(--sam-ease);
      }
      .sam-checkbox.checked {
        background: ${THEME.success}; border-color: ${THEME.success};
        box-shadow: 0 4px 16px -6px rgba(32,199,122,0.7);
      }
      .sam-checkbox.missing { border-color: rgba(224,82,82,0.5); }

      .sam-tab {
        padding: 10px 18px; border-radius: var(--sam-pill);
        font-size: 13px; font-weight: 700; cursor: pointer;
        color: ${THEME.textMuted};
        border: 1px solid transparent;
        transition: all .22s var(--sam-ease);
      }
      .sam-tab.active {
        background: linear-gradient(135deg, ${THEME.goldLight}, ${THEME.gold});
        color: #071525;
        box-shadow: var(--sam-glow-gold-soft);
      }
      .sam-tab:not(.active):hover { color: ${THEME.text}; background: rgba(255,255,255,0.05); }

      /* Option d'un menu déroulant maison (composant Select). */
      .sam-select-option {
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
        width: 100%; padding: 10px 14px; border: none; border-radius: 12px;
        font-family: inherit; font-size: 13.5px; font-weight: 600; text-align: left;
        cursor: pointer;
        transition: background .16s var(--sam-ease), color .16s var(--sam-ease);
      }
      .sam-select-option:hover { background: rgba(255,255,255,0.07) !important; }
      .sam-select-option:focus-visible {
        outline: none;
        background: rgba(212,167,44,0.16) !important;
        box-shadow: inset 0 0 0 1px rgba(212,167,44,0.5);
      }

      .sam-scrollbar-none::-webkit-scrollbar { display: none; }

      /* ============================================================
         ONGLETS SEGMENTÉS — panneau Admin
         ============================================================ */
      .sam-segmented {
        display: flex; gap: 5px; padding: 6px;
        background: rgba(7,21,37,0.5);
        border: var(--sam-hairline);
        border-radius: var(--sam-pill);
        margin-bottom: 22px;
        overflow-x: auto; scrollbar-width: none;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: inset 0 2px 8px rgba(2,8,16,0.45);
      }
      .sam-segment {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 18px; border-radius: var(--sam-pill); border: none;
        background: transparent; color: ${THEME.textMuted};
        font-family: inherit; font-size: 13px; font-weight: 700;
        cursor: pointer; white-space: nowrap; flex: 1; justify-content: center;
        transition: background .22s var(--sam-ease), color .22s var(--sam-ease), box-shadow .22s var(--sam-ease);
      }
      .sam-segment:hover { color: ${THEME.text}; background: rgba(255,255,255,0.05); }
      .sam-segment.active {
        background: linear-gradient(135deg, ${THEME.goldLight}, ${THEME.gold});
        color: #071525;
        box-shadow: var(--sam-glow-gold), inset 0 1px 0 rgba(255,255,255,0.35);
      }
      .sam-segment.active:hover { color: #071525; }
      @media (max-width: 640px) {
        .sam-segment { flex: 0 0 auto; padding: 10px 14px; }
        .sam-segment span { display: none; }
        .sam-segment.active span { display: inline; }
      }

      /* ============================================================
         EN-TÊTE DE SECTION
         ============================================================ */
      .sam-section-head {
        display: flex; align-items: flex-start; justify-content: space-between;
        flex-wrap: wrap; gap: 14px; margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      /* ============================================================
         PASTILLES DOCUMENTS
         ============================================================ */
      .sam-doc-pill {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 11px; font-weight: 700; padding: 4px 11px;
        border-radius: var(--sam-pill); white-space: nowrap; width: fit-content;
        border: 1px solid transparent;
      }
      .sam-doc-pill.ok { background: rgba(32,199,122,0.13); color: #4CDB9B; border-color: rgba(32,199,122,0.24); }
      .sam-doc-pill.ko { background: rgba(224,82,82,0.13); color: #F3A5A5; border-color: rgba(224,82,82,0.24); }

      /* ============================================================
         LIGNES D'INFORMATION
         ============================================================ */
      .sam-info-row {
        display: flex; align-items: center; justify-content: space-between;
        gap: 16px; padding: 13px 0;
        border-bottom: 1px solid rgba(255,255,255,0.055);
      }
      .sam-info-row:last-child { border-bottom: none; }
      .sam-info-label {
        display: inline-flex; align-items: center; gap: 9px;
        color: ${THEME.textMuted}; font-size: 13px; flex-shrink: 0;
      }
      .sam-info-value {
        font-size: 13.5px; font-weight: 600; color: ${THEME.text};
        text-align: right; word-break: break-word; min-width: 0;
      }

      /* ============================================================
         PHOTO DE PROFIL
         ============================================================ */
      .sam-avatar-edit {
        position: relative; width: 108px; height: 108px; border-radius: 50%;
        cursor: pointer; flex-shrink: 0;
        box-shadow: 0 0 0 1px rgba(212,167,44,0.3), 0 0 0 6px rgba(16,40,63,0.9), 0 18px 44px -16px rgba(2,8,16,0.95);
      }
      .sam-avatar-overlay {
        position: absolute; inset: 0; border-radius: 50%;
        background: rgba(7,21,37,0.78); color: ${THEME.goldLight};
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
        font-size: 11px; font-weight: 700;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        opacity: 0; transition: opacity .22s var(--sam-ease);
      }
      .sam-avatar-edit:hover .sam-avatar-overlay { opacity: 1; }
      .sam-avatar-edit:focus-visible .sam-avatar-overlay { opacity: 1; }

      /* ============================================================
         DOCUMENTS COCHABLES
         ============================================================ */
      .sam-doc-toggle {
        display: flex; align-items: center; gap: 14px; width: 100%;
        padding: 15px 17px; border-radius: var(--sam-r-md); cursor: pointer;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        font-family: inherit;
        transition: border-color .22s var(--sam-ease), background .22s var(--sam-ease), box-shadow .22s var(--sam-ease);
      }
      .sam-doc-toggle:hover {
        background: rgba(255,255,255,0.055);
        border-color: rgba(212,167,44,0.4);
        box-shadow: var(--sam-glow-gold-soft);
      }
      .sam-doc-toggle.ok { border-color: rgba(32,199,122,0.24); }

      /* ============================================================
         RESPONSIVE
         ============================================================ */
      @media (max-width: 768px) {
        .sam-hide-mobile { display: none !important; }
        /* Pilules un peu plus compactes : sur 390px de large, deux boutons
           d'action côte à côte débordaient sinon de la rangée d'en-tête. */
        .sam-btn { padding: 11px 17px; font-size: 13px; }
        .sam-btn-sm { padding: 8px 13px; font-size: 12px; }
      }
      @media (min-width: 769px) {
        .sam-hide-desktop { display: none !important; }
      }
      .sam-content { padding: 18px 18px 72px; }
      @media (min-width: 769px) {
        .sam-content { padding: 10px 40px 72px; }
      }

      /* Respect du réglage système "réduire les animations". */
      @media (prefers-reduced-motion: reduce) {
        .sam-root *, .sam-root *::before, .sam-root *::after {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }

      /* Classes utilitaires de mise en page.
         Elles sont fournies par l'aperçu Claude mais absentes du site publié :
         on les redéfinit ici pour que la mise en page soit identique partout. */
      .sam-root .flex { display: flex; }
      .sam-root .grid { display: grid; }
      .sam-root .flex-col { flex-direction: column; }
      .sam-root .flex-wrap { flex-wrap: wrap; }
      .sam-root .items-center { align-items: center; }
      .sam-root .items-start { align-items: flex-start; }
      .sam-root .items-end { align-items: flex-end; }
      .sam-root .justify-between { justify-content: space-between; }
      .sam-root .justify-center { justify-content: center; }
      .sam-root .justify-end { justify-content: flex-end; }
      .sam-root .gap-1 { gap: 4px; }
      .sam-root .gap-2 { gap: 8px; }
      .sam-root .gap-3 { gap: 12px; }
      .sam-root .gap-4 { gap: 16px; }
      .sam-root .gap-5 { gap: 20px; }
      .sam-root .gap-6 { gap: 24px; }
      .sam-root .p-4 { padding: 16px; }
      .sam-root .min-w-0 { min-width: 0; }
      .fixed { position: fixed; }
      .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .items-center { align-items: center; }
      .items-end { align-items: flex-end; }
      .justify-center { justify-content: center; }
      .justify-between { justify-content: space-between; }
      .justify-end { justify-content: flex-end; }
      .flex-wrap { flex-wrap: wrap; }
      .gap-1 { gap: 4px; }
      .gap-2 { gap: 8px; }
      .gap-3 { gap: 12px; }
      .gap-4 { gap: 16px; }
      .gap-5 { gap: 20px; }
      .gap-6 { gap: 24px; }
      .p-4 { padding: 16px; }
      .min-w-0 { min-width: 0; }
    `}</style>
  );
}
