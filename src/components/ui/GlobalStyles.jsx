import { THEME } from '../../theme';
export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Manrope:wght@400;500;600;700;800&display=swap');

      .sam-root { font-family: 'Manrope', sans-serif; background: ${THEME.bg}; color: ${THEME.text}; min-height: 100vh; }
      .sam-root * { box-sizing: border-box; }
      .sam-display { font-family: 'Cormorant Garamond', serif; }

      .sam-root ::-webkit-scrollbar { width: 8px; height: 8px; }
      .sam-root ::-webkit-scrollbar-track { background: transparent; }
      .sam-root ::-webkit-scrollbar-thumb { background: rgba(212,167,44,0.35); border-radius: 8px; }
      .sam-root ::-webkit-scrollbar-thumb:hover { background: rgba(212,167,44,0.55); }

      .sam-card { background: ${THEME.card}; border: 1px solid ${THEME.border}; border-radius: 16px; }
      .sam-card-hover { transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
      .sam-card-hover:hover { transform: translateY(-2px); border-color: rgba(212,167,44,0.45); box-shadow: 0 10px 30px rgba(0,0,0,0.35); }

      .sam-input {
        background: ${THEME.bg2}; border: 1px solid rgba(255,255,255,0.08); color: ${THEME.text};
        border-radius: 10px; padding: 10px 14px; font-size: 14px; width: 100%; outline: none;
        transition: border-color .15s ease, box-shadow .15s ease;
      }
      .sam-input::placeholder { color: ${THEME.textMuted}; }
      .sam-input:focus { border-color: ${THEME.gold}; box-shadow: 0 0 0 3px rgba(212,167,44,0.15); }
      .sam-label { color: ${THEME.textMuted}; font-size: 12px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 6px; display: block; }

      .sam-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; font-size: 14px; border-radius: 10px; padding: 10px 18px; cursor: pointer; border: none; transition: filter .15s ease, transform .1s ease; white-space: nowrap; }
      .sam-btn:active { transform: scale(0.98); }
      .sam-btn-gold { background: linear-gradient(135deg, ${THEME.goldLight}, ${THEME.gold}); color: #071525; }
      .sam-btn-gold:hover { filter: brightness(1.08); }
      .sam-btn-ghost { background: transparent; color: ${THEME.text}; border: 1px solid rgba(255,255,255,0.14); }
      .sam-btn-ghost:hover { border-color: rgba(212,167,44,0.5); background: rgba(212,167,44,0.06); }
      .sam-btn-danger { background: rgba(224,82,82,0.12); color: #F3A5A5; border: 1px solid rgba(224,82,82,0.35); }
      .sam-btn-danger:hover { background: rgba(224,82,82,0.2); }
      .sam-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .sam-btn-sm { padding: 7px 12px; font-size: 12.5px; border-radius: 8px; }

      .sam-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
      .sam-badge-success { background: rgba(32,199,122,0.14); color: #4CDB9B; }
      .sam-badge-error { background: rgba(224,82,82,0.14); color: #F3A5A5; }
      .sam-badge-warn { background: rgba(240,199,94,0.14); color: ${THEME.goldLight}; }
      .sam-badge-info { background: rgba(93,163,240,0.14); color: #8FC1F5; }
      .sam-badge-gold { background: rgba(212,167,44,0.16); color: ${THEME.goldLight}; }
      .sam-badge-neutral { background: rgba(170,183,196,0.14); color: ${THEME.textMuted}; }

      .sam-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
      .sam-table thead th { text-align: left; color: ${THEME.textMuted}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: 10px 14px; border-bottom: 1px solid ${THEME.border}; white-space: nowrap; }
      .sam-table tbody td { padding: 13px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
      .sam-table tbody tr { transition: background .12s ease; }
      .sam-table tbody tr:hover { background: rgba(212,167,44,0.05); }
      .sam-table-wrap { overflow-x: auto; border-radius: 14px; }

      .sam-modal-anim { animation: samModalIn .18s ease; }
      @keyframes samModalIn { from { opacity:0; transform: translateY(8px) scale(0.98);} to {opacity:1; transform: translateY(0) scale(1);} }
      .sam-fade-in { animation: samFadeIn .25s ease; }
      @keyframes samFadeIn { from { opacity:0; } to { opacity:1; } }
      .sam-toast-in { animation: samToastIn .22s cubic-bezier(.2,.8,.3,1); }
      @keyframes samToastIn { from { opacity:0; transform: translateX(16px);} to {opacity:1; transform: translateX(0);} }

      /* --- Bloc identité en haut de la barre latérale --- */
      .sam-brand { display: flex; align-items: center; gap: 13px; padding: 22px 18px 18px; }
      .sam-brand-logo { position: relative; flex-shrink: 0; display: flex; }
      .sam-brand-logo::before {
        content: ''; position: absolute; inset: -9px;
        background: radial-gradient(circle, rgba(212,167,44,0.22), transparent 68%);
        filter: blur(5px);
      }
      .sam-brand-name { font-size: 19px; font-weight: 700; line-height: 1.06; color: ${THEME.text}; letter-spacing: .01em; }
      .sam-brand-name.gold { color: ${THEME.gold}; }
      .sam-brand-tag {
        font-size: 9.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
        color: rgba(170,183,196,0.6); margin-top: 5px; white-space: nowrap;
      }

      /* --- Éléments de navigation --- */
      .sam-nav-item {
        display: flex; align-items: center; gap: 12px; width: 100%;
        padding: 10px 13px; margin-bottom: 2px; border-radius: 10px;
        background: transparent; border: none; border-left: 2px solid transparent;
        color: ${THEME.textMuted}; font-family: inherit; font-size: 14px; font-weight: 600;
        cursor: pointer; text-align: left;
        transition: background .15s ease, color .15s ease, border-color .15s ease;
      }
      .sam-nav-item:hover { background: rgba(255,255,255,0.045); color: ${THEME.text}; }
      .sam-nav-item:hover .sam-nav-icon { color: ${THEME.goldLight}; }
      .sam-nav-item.active {
        background: linear-gradient(90deg, rgba(212,167,44,0.17), rgba(212,167,44,0.02));
        color: ${THEME.goldLight}; border-left-color: ${THEME.gold};
      }
      .sam-nav-icon {
        display: inline-flex; align-items: center; justify-content: center;
        width: 20px; flex-shrink: 0; color: ${THEME.textMuted};
        transition: color .15s ease;
      }
      .sam-nav-item.active .sam-nav-icon { color: ${THEME.gold}; }
      .sam-nav-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sam-nav-dot { width: 5px; height: 5px; border-radius: 50%; background: ${THEME.gold}; flex-shrink: 0; }
      .sam-nav-section-label {
        color: rgba(170,183,196,0.5); font-size: 10px; font-weight: 800;
        letter-spacing: .13em; text-transform: uppercase; padding: 18px 15px 7px;
      }

      /* --- Carte profil en bas de la barre latérale --- */
      .sam-profile-card {
        display: flex; align-items: center; gap: 11px; width: 100%;
        padding: 9px 10px; border-radius: 11px; cursor: pointer;
        background: rgba(255,255,255,0.025); border: 1px solid transparent;
        font-family: inherit;
        transition: background .15s ease, border-color .15s ease;
      }
      .sam-profile-card:hover { background: rgba(212,167,44,0.08); border-color: rgba(212,167,44,0.28); }

      .sam-checkbox { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid rgba(255,255,255,0.25); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition: all .15s ease; flex-shrink:0; }
      .sam-checkbox.checked { background: ${THEME.success}; border-color: ${THEME.success}; }
      .sam-checkbox.missing { border-color: rgba(224,82,82,0.5); }

      .sam-tab { padding: 9px 16px; border-radius: 9px; font-size: 13.5px; font-weight: 700; cursor: pointer; color: ${THEME.textMuted}; transition: all .15s ease; }
      .sam-tab.active { background: ${THEME.gold}; color: #071525; }
      .sam-tab:not(.active):hover { color: ${THEME.text}; background: rgba(255,255,255,0.04); }

      .sam-scrollbar-none::-webkit-scrollbar { display: none; }

      /* Barre d'onglets segmentée du panneau Admin */
      .sam-segmented {
        display: flex; gap: 4px; padding: 5px;
        background: rgba(7,21,37,0.55);
        border: 1px solid ${THEME.border};
        border-radius: 13px; margin-bottom: 18px;
        overflow-x: auto; scrollbar-width: none;
      }
      .sam-segment {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 9px 16px; border-radius: 9px; border: none;
        background: transparent; color: ${THEME.textMuted};
        font-family: inherit; font-size: 13.5px; font-weight: 700;
        cursor: pointer; white-space: nowrap; flex: 1; justify-content: center;
        transition: background .15s ease, color .15s ease;
      }
      .sam-segment:hover { color: ${THEME.text}; background: rgba(255,255,255,0.04); }
      .sam-segment.active {
        background: linear-gradient(135deg, ${THEME.goldLight}, ${THEME.gold});
        color: #071525;
        box-shadow: 0 2px 10px rgba(212,167,44,0.28);
      }
      .sam-segment.active:hover { color: #071525; }
      @media (max-width: 640px) {
        .sam-segment { flex: 0 0 auto; padding: 9px 13px; }
        .sam-segment span { display: none; }
        .sam-segment.active span { display: inline; }
      }

      /* Titre de section dans le panneau Admin */
      .sam-section-head {
        display: flex; align-items: flex-start; justify-content: space-between;
        flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
        padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      /* Pastilles de documents employés */
      .sam-doc-pill {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 11px; font-weight: 700; padding: 3px 9px;
        border-radius: 999px; white-space: nowrap; width: fit-content;
      }
      .sam-doc-pill.ok { background: rgba(32,199,122,0.13); color: #4CDB9B; }
      .sam-doc-pill.ko { background: rgba(224,82,82,0.13); color: #F3A5A5; }

      /* Lignes d'information du profil */
      .sam-info-row {
        display: flex; align-items: center; justify-content: space-between;
        gap: 16px; padding: 11px 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .sam-info-row:last-child { border-bottom: none; }
      .sam-info-label {
        display: inline-flex; align-items: center; gap: 8px;
        color: ${THEME.textMuted}; font-size: 13px; flex-shrink: 0;
      }
      .sam-info-value {
        font-size: 13.5px; font-weight: 600; color: ${THEME.text};
        text-align: right; word-break: break-word; min-width: 0;
      }

      /* Photo de profil cliquable */
      .sam-avatar-edit {
        position: relative; width: 104px; height: 104px; border-radius: 50%;
        cursor: pointer; flex-shrink: 0;
        box-shadow: 0 0 0 4px ${THEME.card}, 0 6px 20px rgba(0,0,0,0.4);
      }
      .sam-avatar-overlay {
        position: absolute; inset: 0; border-radius: 50%;
        background: rgba(7,21,37,0.72); color: ${THEME.goldLight};
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
        font-size: 11px; font-weight: 700;
        opacity: 0; transition: opacity .18s ease;
      }
      .sam-avatar-edit:hover .sam-avatar-overlay { opacity: 1; }
      .sam-avatar-edit:focus-visible .sam-avatar-overlay { opacity: 1; }

      /* Documents cochables sur le profil */
      .sam-doc-toggle {
        display: flex; align-items: center; gap: 13px; width: 100%;
        padding: 13px 15px; border-radius: 11px; cursor: pointer;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        font-family: inherit;
        transition: border-color .15s ease, background .15s ease;
      }
      .sam-doc-toggle:hover { background: rgba(255,255,255,0.045); border-color: rgba(212,167,44,0.4); }
      .sam-doc-toggle.ok { border-color: rgba(32,199,122,0.25); }

      @media (max-width: 768px) {
        .sam-hide-mobile { display: none !important; }
      }
      @media (min-width: 769px) {
        .sam-hide-desktop { display: none !important; }
      }
      .sam-content { padding: 16px 16px 60px; }
      @media (min-width: 769px) {
        .sam-content { padding: 8px 32px 60px; }
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
