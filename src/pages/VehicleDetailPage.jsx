import { useState } from 'react';
import { Anchor, Calendar, ChevronLeft, ClipboardList, Clock, DollarSign, FileText, Pencil, Plus, Trash2, TrendingUp, Wrench } from 'lucide-react';
import { THEME } from '../theme';
import {
  addDays,
  formatCurrency,
  formatDate,
  formatHours,
  fullName,
  isoDate,
  startOfWeek,
  todayISO,
  uid,
} from '../lib/utils';
import { categoryOf, userOf, vehicleOf, vehicleStats } from '../lib/stats';
import { Badge, ConfirmDialog, EmptyState, Select, StatCard } from '../components/ui';
import { EditVehicleModal, AddMaintenanceModal } from './GaragePage';

export function VehicleDetailPage({ db, actions, isAdmin, session, notify, vehicleId, back }) {
  const [tab, setTab] = useState('overview');
  const [showEdit, setShowEdit] = useState(false);
  const [showMaint, setShowMaint] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [histPeriod, setHistPeriod] = useState('mois');
  const [noteText, setNoteText] = useState('');

  const vehicle = vehicleOf(db, vehicleId);
  if (!vehicle) return <EmptyState icon={<Anchor size={38} />} text="Véhicule introuvable" />;
  const cat = categoryOf(db, vehicle.categorieId);
  const stats = vehicleStats(db, vehicle.id);
  const isHelico = cat.nom === 'Hélicoptère';

  const allRentals = db.rentals
    .filter((r) => r.vehiculeId === vehicle.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const histFiltered = allRentals.filter((r) => {
    if (histPeriod === 'semaine') return r.date >= startOfWeek(todayISO());
    if (histPeriod === 'mois') return r.date >= isoDate(-30);
    if (histPeriod === 'annee') return r.date >= isoDate(-365);
    return true;
  });

  const maints = db.maintenances
    .filter((m) => m.vehiculeId === vehicle.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const derniereMaint = maints[0];
  const prochaineMaint = derniereMaint ? addDays(derniereMaint.date, 30) : null;

  function submitNote() {
    if (!noteText.trim()) return;

    actions.addVehicleNote(vehicle.id, {
      id: uid('note'),
      text: noteText.trim(),
      date: todayISO(),
      auteur: fullName(session),
    });

    setNoteText('');
    notify('Note ajoutée.', 'success');
  }

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'history', label: 'Historique' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'notes', label: 'Notes internes' },
  ];

  return (
    <div className="sam-fade-in">
      <div
        className="flex items-center gap-2"
        style={{ color: THEME.textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
        onClick={back}
      >
        <ChevronLeft size={16} /> Retour au garage
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4" style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${THEME.bg2}, ${THEME.card})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {vehicle.photo ? (
              <img src={vehicle.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              cat.icone
            )}
          </div>
          <div>
            <h1 className="sam-display" style={{ fontSize: 27, fontWeight: 700, margin: 0 }}>
              {cat.icone} {vehicle.nom}
            </h1>
            <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
              <span style={{ color: THEME.gold, fontSize: 13, fontWeight: 600 }}>{cat.nom}</span>
              <Badge status={vehicle.statut} />
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={() => setShowEdit(true)}>
              <Pencil size={14} /> Modifier
            </button>
            <button className="sam-btn sam-btn-danger sam-btn-sm" onClick={() => setShowDelete(true)}>
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        )}
      </div>

      <div
        className="flex gap-2 flex-wrap"
        style={{ marginBottom: 22, borderBottom: `1px solid ${THEME.border}`, paddingBottom: 14 }}
      >
        {tabs.map((t) => (
          <div key={t.id} className={`sam-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="sam-fade-in">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div className="sam-card" style={{ padding: 22 }}>
              <h3 className="sam-display" style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>
                Informations générales
              </h3>
              {[
                ['Nom', vehicle.nom],
                ['Catégorie', `${cat.icone} ${cat.nom}`],
                ['Identifiant', vehicle.identifiant],
                ['Statut', null],
                ["Date d'ajout", formatDate(vehicle.dateAjout)],
              ].map(([label, val], i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                  style={{
                    padding: '10px 0',
                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <span style={{ color: THEME.textMuted, fontSize: 13 }}>{label}</span>
                  {label === 'Statut' ? (
                    <Badge status={vehicle.statut} />
                  ) : (
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{val}</span>
                  )}
                </div>
              ))}
              {vehicle.description && (
                <p style={{ color: THEME.textMuted, fontSize: 13, marginTop: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {vehicle.description}
                </p>
              )}
            </div>
            <div className="sam-card" style={{ padding: 22 }}>
              <h3 className="sam-display" style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>
                État du véhicule
              </h3>
              <div style={{ marginBottom: 16 }}>
                <Badge status={vehicle.etat} />
              </div>
              {isAdmin ? (
                <>
                  <label className="sam-label">Modifier l'état</label>
                  <Select
                    value={vehicle.etat}
                    onChange={(v) => {
                      actions.updateVehicle(vehicle.id, { etat: v });
                      notify('État du véhicule mis à jour.', 'success');
                    }}
                    options={[
                      { value: 'Excellent', label: '🟢 Excellent' },
                      { value: 'Bon', label: '🟡 Bon' },
                      { value: 'À surveiller', label: '🟠 À surveiller' },
                      { value: 'Maintenance', label: '🔴 Maintenance' },
                    ]}
                  />
                </>
              ) : (
                <p style={{ color: THEME.textMuted, fontSize: 12.5 }}>
                  Seul un administrateur peut modifier l'état.
                </p>
              )}
              <div style={{ marginTop: 18, fontSize: 12.5, color: THEME.textMuted }}>
                Heures moteur : <b style={{ color: THEME.text }}>{vehicle.heuresMoteur || 0} h</b>
              </div>
              {isHelico && (
                <div style={{ marginTop: 4, fontSize: 12.5, color: THEME.textMuted }}>
                  Heures de vol : <b style={{ color: THEME.text }}>{vehicle.heuresVol || 0} h</b>
                </div>
              )}
            </div>
          </div>

          <h3 className="sam-display" style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>
            Statistiques du véhicule
          </h3>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}
          >
            <StatCard label="Nombre de locations" value={stats.count} icon={<ClipboardList size={16} />} />
            <StatCard
              label="Chiffre d'affaires généré"
              value={formatCurrency(stats.ca)}
              icon={<DollarSign size={16} />}
              highlight
            />
            <StatCard
              label="Temps total de location"
              value={formatHours(stats.totalH)}
              icon={<Clock size={16} />}
            />
            <StatCard
              label="Dernière location"
              value={stats.derniereLocation ? formatDate(stats.derniereLocation) : '—'}
              icon={<Calendar size={16} />}
            />
            <StatCard
              label="Prix moyen / location"
              value={formatCurrency(stats.prixMoyen)}
              icon={<TrendingUp size={16} />}
            />
            {isHelico && (
              <StatCard
                label="Temps de vol total"
                value={`${vehicle.heuresVol || 0} h`}
                icon={<Anchor size={16} />}
              />
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="sam-fade-in">
          <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
            {[
              ['semaine', 'Semaine'],
              ['mois', 'Mois'],
              ['annee', 'Année'],
              ['toutes', 'Tout l\u2019historique'],
            ].map(([id, label]) => (
              <div
                key={id}
                className={`sam-tab ${histPeriod === id ? 'active' : ''}`}
                onClick={() => setHistPeriod(id)}
              >
                {label}
              </div>
            ))}
          </div>
          {histFiltered.length === 0 ? (
            <EmptyState icon={<ClipboardList size={32} />} text="Aucune location sur cette période" />
          ) : (
            <div className="sam-table-wrap sam-card">
              <table className="sam-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Employé</th>
                    <th>Date</th>
                    <th>Durée</th>
                    <th>Prix</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {histFiltered.map((r) => (
                    <tr key={r.id}>
                      <td>{r.client}</td>
                      <td>{fullName(userOf(db, r.employeId))}</td>
                      <td>{formatDate(r.date)}</td>
                      <td>{r.duree}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(r.prix)}</td>
                      <td>
                        <Badge status={r.statut} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'maintenance' && (
        <div className="sam-fade-in">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
              marginBottom: 20,
            }}
          >
            <StatCard
              label="Dernière maintenance"
              value={derniereMaint ? formatDate(derniereMaint.date) : '—'}
              icon={<Wrench size={16} />}
            />
            <StatCard
              label="Prochaine maintenance"
              value={prochaineMaint ? formatDate(prochaineMaint) : '—'}
              icon={<Calendar size={16} />}
            />
            <StatCard
              label="Heures moteur"
              value={`${vehicle.heuresMoteur || 0} h`}
              icon={<TrendingUp size={16} />}
            />
            {isHelico && (
              <StatCard
                label="Heures de vol"
                value={`${vehicle.heuresVol || 0} h`}
                icon={<Anchor size={16} />}
              />
            )}
          </div>
          {isAdmin && (
            <button
              className="sam-btn sam-btn-gold sam-btn-sm"
              style={{ marginBottom: 16 }}
              onClick={() => setShowMaint(true)}
            >
              <Plus size={14} /> Ajouter une maintenance
            </button>
          )}
          {maints.length === 0 ? (
            <EmptyState icon={<Wrench size={32} />} text="Aucune maintenance enregistrée" />
          ) : (
            <div className="sam-table-wrap sam-card">
              <table className="sam-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Coût</th>
                    <th>Responsable</th>
                    <th>Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {maints.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDate(m.date)}</td>
                      <td>{m.type}</td>
                      <td>{formatCurrency(m.cout)}</td>
                      <td>{userOf(db, m.responsable) ? fullName(userOf(db, m.responsable)) : m.responsable}</td>
                      <td style={{ color: THEME.textMuted, whiteSpace: 'pre-wrap' }}>{m.commentaire}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="sam-fade-in sam-card" style={{ padding: 22 }}>
          <h3 className="sam-display" style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
            Notes internes
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '0 0 16px' }}>
            Visibles uniquement par les employés de San Andreas Marina.
          </p>
          {/* Zone de texte et non champ simple : une note interne tient
              souvent sur plusieurs lignes. Entrée revient donc à la ligne,
              et Ctrl+Entrée enregistre pour garder un raccourci clavier. */}
          <div className="flex gap-2 items-start" style={{ marginBottom: 18 }}>
            <textarea
              className="sam-input"
              rows={2}
              style={{ resize: 'vertical', fontFamily: 'inherit', flex: 1, minWidth: 0 }}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ajouter une note interne... (Ctrl+Entrée pour enregistrer)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitNote();
              }}
            />
            <button className="sam-btn sam-btn-gold sam-btn-sm" onClick={submitNote}>
              Ajouter
            </button>
          </div>
          {(vehicle.notes || []).length === 0 ? (
            <EmptyState icon={<FileText size={30} />} text="Aucune note pour ce véhicule" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vehicle.notes
                .slice()
                .reverse()
                .map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 18,
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: 13.5, color: THEME.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</div>
                    <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 6 }}>
                      {n.auteur} · {formatDate(n.date)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <EditVehicleModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        vehicle={vehicle}
        db={db}
        actions={actions}
        notify={notify}
      />
      <AddMaintenanceModal
        open={showMaint}
        onClose={() => setShowMaint(false)}
        vehicle={vehicle}
        db={db}
        actions={actions}
        notify={notify}
      />
      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        danger
        title="Supprimer ce véhicule ?"
        message={`Cette action est définitive et supprimera "${vehicle.nom}" du garage.`}
        confirmLabel="Supprimer"
        onConfirm={async () => {
          const ok = await actions.deleteVehicle(vehicle.id);
          setShowDelete(false);
          if (ok) back();
        }}
      />
    </div>
  );
}
