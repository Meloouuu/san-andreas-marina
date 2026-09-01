import { useRef, useState } from 'react';
import { Award, Calendar, Camera, Check, ClipboardList, CreditCard, DollarSign, Mail, Phone, ShieldCheck, Trash2, Upload, User } from 'lucide-react';
import { THEME } from '../theme';
import { formatCurrency, formatDate, fullName } from '../lib/utils';
import { computeEmployeeStats } from '../lib/stats';
import { Avatar, PageHeader, StatCard } from '../components/ui';

/* ============================================================
   PROFIL UTILISATEUR
   ============================================================ */

export function InfoRow({ label, value, icon }) {
  return (
    <div className="sam-info-row">
      <span className="sam-info-label">
        {icon}
        {label}
      </span>
      <span className="sam-info-value">{value || '—'}</span>
    </div>
  );
}

export function DocToggle({ label, done, doneText, missingText, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className={`sam-doc-toggle ${done ? 'ok' : 'ko'}`}>
      <span className={`sam-checkbox ${done ? 'checked' : 'missing'}`}>
        {done && <Check size={13} color="#071525" strokeWidth={3} />}
      </span>
      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: THEME.text }}>{label}</span>
        <span
          style={{
            display: 'block',
            fontSize: 12,
            color: done ? THEME.success : THEME.textMuted,
            marginTop: 2,
          }}
        >
          {done ? doneText : missingText}
        </span>
      </span>
      <span style={{ fontSize: 11.5, color: THEME.textMuted, whiteSpace: 'nowrap' }}>Modifier</span>
    </button>
  );
}

export function ProfilePage({ session, db, actions, notify }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const stats = computeEmployeeStats(db).find((e) => e.user.id === session.id) || {
    locations: 0,
    ca: 0,
    permis: 0,
  };

  function choosePhoto() {
    if (fileRef.current) fileRef.current.click();
  }

  /* L'image est redimensionnée en 256x256 avant d'être enregistrée :
     une photo brute dépasserait vite la capacité du stockage du navigateur. */
  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      notify('Veuillez choisir un fichier image (JPG, PNG...).', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify('Image trop lourde : 8 Mo maximum.', 'error');
      return;
    }
    setBusy(true);
    const reader = new window.FileReader();
    reader.onerror = () => {
      setBusy(false);
      notify('Lecture du fichier impossible.', 'error');
    };
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => {
        setBusy(false);
        notify('Cette image est illisible.', 'error');
      };
      img.onload = () => {
        try {
          const SIZE = 256;
          const canvas = document.createElement('canvas');
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
          actions.updateUser(session.id, { photo: canvas.toDataURL('image/jpeg', 0.82) });
          notify('Photo de profil mise à jour.', 'success');
        } catch (err) {
          notify('Impossible de traiter cette image.', 'error');
        }
        setBusy(false);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    actions.updateUser(session.id, { photo: '' });
    notify('Photo de profil retirée.', 'info');
  }

  function toggleDoc(field, label) {
    const next = !session[field];
    actions.updateUser(session.id, { [field]: next });
    notify(next ? label + ' validé.' : label + ' marqué comme manquant.', next ? 'success' : 'warn');
  }

  const docsOk = (session.contratSigne ? 1 : 0) + (session.visiteMedicale ? 1 : 0);

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Compte"
        title="Mon profil"
        subtitle="Vos informations personnelles et professionnelles."
      />

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

      <div className="sam-card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden' }}>
        <div
          style={{
            height: 92,
            background: `linear-gradient(120deg, rgba(212,167,44,0.20), rgba(11,31,51,0) 70%), linear-gradient(180deg, ${THEME.bg2}, ${THEME.card})`,
            position: 'relative',
          }}
        >
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 58, opacity: 0.5 }}
          >
            <path
              d="M0,70 C 240,110 480,20 720,70 C 960,120 1200,30 1440,80 L1440,120 L0,120 Z"
              fill="rgba(212,167,44,0.07)"
            />
          </svg>
        </div>

        <div style={{ padding: '0 26px 24px' }}>
          <div className="flex items-end gap-5 flex-wrap" style={{ marginTop: -46 }}>
            <div
              className="sam-avatar-edit"
              onClick={busy ? undefined : choosePhoto}
              title="Changer la photo de profil"
            >
              <Avatar name={fullName(session)} photo={session.photo} size={104} />
              <div className="sam-avatar-overlay">
                <Camera size={22} />
                <span>{busy ? 'Traitement…' : 'Changer'}</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200, paddingBottom: 6 }}>
              <h2 className="sam-display" style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
                {fullName(session)}
              </h2>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 7 }}>
                <span
                  className={`sam-badge ${session.role === 'admin' ? 'sam-badge-gold' : 'sam-badge-info'}`}
                >
                  {session.role === 'admin' ? 'Administrateur' : 'Employé(e)'}
                </span>
                <span className={`sam-badge ${docsOk === 2 ? 'sam-badge-success' : 'sam-badge-warn'}`}>
                  {docsOk}/2 document{docsOk > 1 ? 's' : ''} en règle
                </span>
                <span style={{ fontSize: 12.5, color: THEME.textMuted }}>
                  Dans l'équipe depuis le {formatDate(session.dateEntree)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap" style={{ paddingBottom: 6 }}>
              <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={choosePhoto} disabled={busy}>
                <Upload size={14} /> {session.photo ? 'Remplacer' : 'Ajouter une photo'}
              </button>
              {session.photo && (
                <button
                  className="sam-btn sam-btn-ghost sam-btn-sm"
                  onClick={removePhoto}
                  disabled={busy}
                  title="Retirer la photo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 18,
          marginBottom: 18,
        }}
      >
        <div className="sam-card" style={{ padding: 24 }}>
          <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>
            Informations personnelles
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '0 0 14px' }}>
            Un administrateur peut modifier ces informations.
          </p>
          <InfoRow label="Sexe" value={session.sexe} icon={<User size={13} />} />
          <InfoRow
            label="Date de naissance"
            value={formatDate(session.dateNaissance)}
            icon={<Calendar size={13} />}
          />
          <InfoRow label="Téléphone" value={session.telephone} icon={<Phone size={13} />} />
          <InfoRow label="Adresse e-mail" value={session.email} icon={<Mail size={13} />} />
          <InfoRow label="IBAN" value={session.iban} icon={<CreditCard size={13} />} />
          <InfoRow label="Date d'entrée" value={formatDate(session.dateEntree)} icon={<Award size={13} />} />
        </div>

        <div className="sam-card" style={{ padding: 24 }}>
          <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>
            Documents
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '0 0 14px' }}>
            Cliquez sur une ligne pour changer son état.
          </p>
          <div className="flex flex-col gap-2">
            <DocToggle
              label="Contrat de travail"
              done={session.contratSigne}
              doneText="Signé"
              missingText="Non signé"
              onToggle={() => toggleDoc('contratSigne', 'Contrat de travail')}
            />
            <DocToggle
              label="Visite médicale"
              done={session.visiteMedicale}
              doneText="Effectuée"
              missingText="Non effectuée"
              onToggle={() => toggleDoc('visiteMedicale', 'Visite médicale')}
            />
          </div>
        </div>
      </div>

      <div className="sam-card" style={{ padding: 24 }}>
        <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>
          Mes statistiques
        </h3>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}
        >
          <StatCard label="Locations" value={stats.locations} icon={<ClipboardList size={16} />} />
          <StatCard
            label="CA généré"
            value={formatCurrency(stats.ca)}
            icon={<DollarSign size={16} />}
            highlight
          />
          <StatCard label="Permis délivrés" value={stats.permis} icon={<ShieldCheck size={16} />} />
        </div>
      </div>
    </div>
  );
}
