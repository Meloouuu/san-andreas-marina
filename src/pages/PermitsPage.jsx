import { useEffect, useMemo, useState } from 'react';
import { Calendar, FileText, Plus, ShieldCheck, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { THEME } from '../theme';
import { formatDate, fullName, isoDate, startOfWeek, todayISO, uid, weekdayLabel } from '../lib/utils';
import { citizenOf, nextCitizenId, nextPermitNumber, userOf, CHART_TOOLTIP_STYLE } from '../lib/stats';
import { Badge, EmptyState, FieldRow, Modal, PageHeader, SearchInput, Select, StatCard } from '../components/ui';

/* ============================================================
   PERMIS & FORMATIONS
   ============================================================ */

export function AddCandidateModal({ open, onClose, db, actions, notify }) {
  const blank = () => ({
    mode: 'new',
    citizenId: db.citizens[0] ? db.citizens[0].id : '',
    prenom: '',
    nom: '',
    telephone: '',
    typePermis: 'Bateau',
    formateur: db.users[0] ? db.users[0].id : '',
  });
  const [form, setForm] = useState(blank());
  useEffect(() => {
    if (open) setForm(blank());
  }, [open]);

  function submit() {
    let citizenId = form.citizenId;
    if (form.mode === 'new') {
      if (!form.prenom.trim() || !form.nom.trim()) {
        notify('Veuillez indiquer le prénom et le nom du citoyen.', 'error');
        return;
      }
      const identifiant = nextCitizenId(db.citizens);
      const newCitizen = {
        id: uid('c'),
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        telephone: form.telephone,
        identifiant,
        photo: '',
        dateCreation: todayISO(),
      };
      actions.addCitizen(newCitizen);
      citizenId = newCitizen.id;
    }
    actions.addPermitDossier({
      id: uid('p'),
      citizenId,
      type: form.typePermis,
      formateurId: form.formateur,
      date: todayISO(),
      statut: 'En attente',
    });
    notify('Dossier candidat créé.', 'success');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouveau candidat"
      subtitle="Créer un dossier permis pour un citoyen."
    >
      <div>
        <div className="flex gap-2" style={{ marginBottom: 14 }}>
          <div
            className={`sam-tab ${form.mode === 'new' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, mode: 'new' })}
          >
            Nouveau citoyen
          </div>
          <div
            className={`sam-tab ${form.mode === 'existing' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, mode: 'existing' })}
          >
            Citoyen existant
          </div>
        </div>

        {form.mode === 'new' ? (
          <>
            <div className="flex gap-3">
              <div style={{ flex: 1 }}>
                <FieldRow label="Prénom">
                  <input
                    className="sam-input"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  />
                </FieldRow>
              </div>
              <div style={{ flex: 1 }}>
                <FieldRow label="Nom">
                  <input
                    className="sam-input"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  />
                </FieldRow>
              </div>
            </div>
            <FieldRow label="Numéro de téléphone">
              <input
                className="sam-input"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="555-0000"
              />
            </FieldRow>
          </>
        ) : (
          <FieldRow label="Citoyen">
            <Select
              value={form.citizenId}
              onChange={(v) => setForm({ ...form, citizenId: v })}
              options={db.citizens.map((c) => ({ value: c.id, label: `${fullName(c)} (${c.identifiant})` }))}
            />
          </FieldRow>
        )}

        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Type de permis demandé">
              <Select
                value={form.typePermis}
                onChange={(v) => setForm({ ...form, typePermis: v })}
                options={[
                  { value: 'Bateau', label: '🚤 Permis bateau' },
                  { value: 'Hélicoptère', label: '🚁 Permis hélicoptère' },
                ]}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Formateur">
              <Select
                value={form.formateur}
                onChange={(v) => setForm({ ...form, formateur: v })}
                options={db.users.map((u) => ({ value: u.id, label: fullName(u) }))}
              />
            </FieldRow>
          </div>
        </div>
        <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: -4 }}>
          Date de création du dossier : {formatDate(todayISO())}
        </p>

        <div className="flex justify-end gap-3" style={{ marginTop: 10 }}>
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" onClick={submit} className="sam-btn sam-btn-gold">
            <Plus size={15} /> Créer le dossier
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ProcessPermitModal({ open, onClose, permit, db, actions, notify }) {
  if (!permit) return null;
  function decide(statut) {
    if (statut === 'Valide') {
      const numero = nextPermitNumber(db.permits, permit.type, 470);
      actions.updatePermit(permit.id, { statut: 'Valide', numero, date: todayISO() });
      notify(`✓ Permis délivré — ${numero}`, 'success');
    } else {
      actions.updatePermit(permit.id, { statut: 'Refusé' });
      notify('Dossier marqué comme refusé.', 'warn');
    }
    onClose();
  }
  const citizen = citizenOf(db, permit.citizenId);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Traiter le dossier"
      subtitle={citizen ? fullName(citizen) : ''}
    >
      <div style={{ fontSize: 13.5, color: THEME.textMuted, marginBottom: 18 }}>
        Type :{' '}
        <b style={{ color: THEME.text }}>
          {permit.type === 'Bateau' ? '🚤 Permis bateau' : '🚁 Permis hélicoptère'}
        </b>
        <br />
        Formateur : <b style={{ color: THEME.text }}>{fullName(userOf(db, permit.formateurId))}</b>
      </div>
      <div className="flex gap-3">
        <button className="sam-btn sam-btn-danger" style={{ flex: 1 }} onClick={() => decide('Refusé')}>
          Refuser
        </button>
        <button className="sam-btn sam-btn-gold" style={{ flex: 1 }} onClick={() => decide('Valide')}>
          <ShieldCheck size={15} /> Valider &amp; délivrer
        </button>
      </div>
    </Modal>
  );
}

export function PermitsPage({ db, actions, isAdmin, notify, openCitizen }) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processPermit, setProcessPermit] = useState(null);

  const weekStart = startOfWeek(todayISO());
  const stats = {
    bateau: db.permits.filter((p) => p.type === 'Bateau' && p.statut === 'Valide').length,
    helico: db.permits.filter((p) => p.type === 'Hélicoptère' && p.statut === 'Valide').length,
    formations: db.permits.length,
    tauxReussite: db.permits.length
      ? Math.round(
          (db.permits.filter((p) => p.statut === 'Valide').length /
            db.permits.filter((p) => p.statut !== 'En attente').length || 1) * 100,
        )
      : 0,
    cetteSemaine: db.permits.filter((p) => p.statut === 'Valide' && p.date >= weekStart).length,
  };

  const activityData = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = isoDate(-i);
      out.push({
        label: weekdayLabel(d),
        bateau: db.permits.filter((p) => p.date === d && p.type === 'Bateau').length,
        helico: db.permits.filter((p) => p.date === d && p.type === 'Hélicoptère').length,
      });
    }
    return out;
  }, [db]);

  const rows = db.permits
    .filter((p) => typeFilter === 'all' || p.type === typeFilter)
    .filter((p) => statusFilter === 'all' || p.statut === statusFilter)
    .filter((p) => {
      const c = citizenOf(db, p.citizenId);
      return (
        !search ||
        (c && fullName(c).toLowerCase().includes(search.toLowerCase())) ||
        (p.numero || '').toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Permis"
        title="Permis & Formations"
        subtitle="Gestion des permis bateau et hélicoptère délivrés aux citoyens."
        action={
          <button className="sam-btn sam-btn-gold" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Nouveau candidat
          </button>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Permis bateau délivrés" value={stats.bateau} icon={<span>🚤</span>} highlight />
        <StatCard label="Permis hélico délivrés" value={stats.helico} icon={<span>🚁</span>} highlight />
        <StatCard label="Formations réalisées" value={stats.formations} icon={<FileText size={16} />} />
        <StatCard label="Taux de réussite" value={`${stats.tauxReussite}%`} icon={<TrendingUp size={16} />} />
        <StatCard label="Délivrés cette semaine" value={stats.cetteSemaine} icon={<Calendar size={16} />} />
      </div>

      <div className="sam-card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 className="sam-display" style={{ fontSize: 15.5, fontWeight: 700, margin: '0 0 12px' }}>
          Activité de la semaine
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: THEME.textMuted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: THEME.textMuted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={22}
              allowDecimals={false}
            />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11.5 }} />
            <Bar dataKey="bateau" name="Bateau" fill={THEME.gold} radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar
              dataKey="helico"
              name="Hélicoptère"
              fill={THEME.goldLight}
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>
        Registre des permis
      </h3>
      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Citoyen ou n° de permis..." />
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: 'all', label: 'Tous types' },
            { value: 'Bateau', label: '🚤 Bateau' },
            { value: 'Hélicoptère', label: '🚁 Hélicoptère' },
          ]}
          style={{ width: 160 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Tous statuts' },
            { value: 'Valide', label: '🟢 Valide' },
            { value: 'En attente', label: '🟠 En attente' },
            { value: 'Refusé', label: '🔴 Refusé' },
            { value: 'Annulé', label: '⚫ Annulé' },
          ]}
          style={{ width: 170 }}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<span style={{ fontSize: 34 }}>🪪</span>} text="Aucun dossier trouvé" />
      ) : (
        <div className="sam-table-wrap sam-card">
          <table className="sam-table">
            <thead>
              <tr>
                <th>N° Permis</th>
                <th>Citoyen</th>
                <th>Type</th>
                <th>Formateur</th>
                <th>Date</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const c = citizenOf(db, p.citizenId);
                return (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{p.numero || '—'}</td>
                    <td
                      style={{ cursor: 'pointer', color: THEME.goldLight }}
                      onClick={() => c && openCitizen(c.id)}
                    >
                      {c ? fullName(c) : '—'}
                    </td>
                    <td>{p.type === 'Bateau' ? '🚤 Bateau' : '🚁 Hélicoptère'}</td>
                    <td>{fullName(userOf(db, p.formateurId))}</td>
                    <td>{formatDate(p.date)}</td>
                    <td>
                      <Badge status={p.statut} />
                    </td>
                    <td>
                      {p.statut === 'En attente' && (
                        <button
                          className="sam-btn sam-btn-gold sam-btn-sm"
                          onClick={() => setProcessPermit(p)}
                        >
                          Traiter
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddCandidateModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        db={db}
        actions={actions}
        notify={notify}
      />
      <ProcessPermitModal
        open={!!processPermit}
        onClose={() => setProcessPermit(null)}
        permit={processPermit}
        db={db}
        actions={actions}
        notify={notify}
      />
    </div>
  );
}
