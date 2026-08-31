import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { THEME } from '../../theme';

/* Menu déroulant maison.
   Un <select> natif ne peut pas être stylé : le navigateur dessine lui-même
   la liste qui s'ouvre (fond gris, surlignage bleu système). On reconstruit
   donc la liste en HTML pour qu'elle suive la direction artistique.

   L'API reste celle d'avant (`value`, `onChange`, `options`, `style`) :
   les 34 appels existants n'ont pas eu besoin d'être touchés. */
export function Select({ value, onChange, options, style, placeholder }) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  /* Fermeture au clic extérieur et à la touche Échap. */
  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  /* La liste s'ouvre vers le haut s'il n'y a pas la place en dessous —
     sinon elle sort de l'écran dans les fenêtres modales. */
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const placeBelow = window.innerHeight - rect.bottom;
    setOpenUpward(placeBelow < 240 && rect.top > placeBelow);
  }, [open]);

  function choose(option) {
    onChange(option.value);
    setOpen(false);
    if (buttonRef.current) buttonRef.current.focus();
  }

  return (
    /* `flex` n'a d'effet que dans une rangée de filtres : le menu s'y partage
       la ligne avec les autres filtres, comme le faisait le <select> natif.
       Dans un formulaire (contexte bloc), `flex` est ignoré et `width: 100%`
       prend le relais pour occuper toute la largeur du champ. */
    <div
      ref={wrapRef}
      style={{ position: 'relative', width: '100%', flex: '1 1 180px', minWidth: 0, ...style }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="sam-input"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          cursor: 'pointer',
          borderRadius: 999,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          fontWeight: 500,
          borderColor: open ? 'rgba(212,167,44,0.65)' : undefined,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: selected ? THEME.text : THEME.textMuted,
          }}
        >
          {selected ? selected.label : placeholder || 'Sélectionner...'}
        </span>
        <ChevronDown
          size={15}
          style={{
            flexShrink: 0,
            color: THEME.textMuted,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .22s cubic-bezier(.22,.8,.3,1)',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="sam-modal-anim"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [openUpward ? 'bottom' : 'top']: 'calc(100% + 8px)',
            zIndex: 400,
            maxHeight: 244,
            overflowY: 'auto',
            padding: 6,
            borderRadius: 18,
            background: 'linear-gradient(155deg, rgba(21,48,74,0.98), rgba(11,31,51,0.96))',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 30px 64px -20px rgba(2,8,16,0.95), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {options.map((o) => {
            const isSelected = String(o.value) === String(value);
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(o)}
                className="sam-select-option"
                style={{
                  color: isSelected ? THEME.goldLight : THEME.text,
                  background: isSelected ? 'rgba(212,167,44,0.14)' : 'transparent',
                }}
              >
                <span
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {o.label}
                </span>
                {isSelected && <Check size={14} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
