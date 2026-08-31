import { useEffect, useState } from 'react';
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { THEME } from '../theme';
import { formatCurrency, formatDate, formatDuree, fullName, todayISO } from '../lib/utils';
import {
  categoryOf,
  checkAvailability,
  nextRentalNumber,
  userOf,
  vehicleOf,
  RENTAL_DURATIONS,
} from '../lib/stats';
import { Badge, ConfirmDialog, EmptyState, FieldRow, Modal, PageHeader, SearchInput, Select } from '../components/ui';

/* ============================================================
   SUIVI DES LOCATIONS
   ============================================================ */


export function AddRentalModal({ open, onClose, db, actions, notify, session, defaultDate }) {
  const blank = () => ({
    vehiculeId: db.vehicles.find((v) => v.statut === 'Disponible')
      ? db.vehicles.find((v) => v.statut === 'Disponible').id
      : db.vehicles[0]
        ? db.vehicles[0].id
        : '',
    employeId: session.id,
    client: '',
    telephone: '',
    prix: '',
    date: defaultDate || todayISO(),
    heure: '10:00',
    duree: '1h',
    statut: 'Réservée',
    notes: '',
  });
  const [form, setForm] = useState(blank());
  useEffect(() => {
    if (open) setForm(blank());
  }, [open, defaultDate]);

  function submit() {
    if (!form.vehiculeId) {
      notify('Veuillez sélectionner un véhicule.', 'error');
      return;
    }
    if (!form.client.trim()) {
      notify('Veuillez indiquer le nom du client.', 'error');
      return;
    }
    if (form.prix === '' || isNaN(Number(form.prix))) {
      notify('Veuillez indiquer un prix.', 'error');
      return;
    }
    if (!form.date) {
      notify('Veuillez indiquer la date de la location.', 'error');
      return;
    }
    if (!checkAvailability(db, form.vehiculeId, form.date)) {
      notify('⚠️ Ce véhicule est déjà réservé sur ce créneau.', 'error');
      return;
    }
    const numero = nextRentalNumber(db.rentals);
    actions.addRental({ ...form, numero, prix: Number(form.prix) || 0 });
    notify(`✓ Location créée avec succès — ${numero}`, 'success');
    onClose();
  }

  const availableVehicles = db.vehicles.filter((v) => v.statut !== 'Maintenance');

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle location" width={600}>
      <div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Véhicule">
              <Select
                value={form.vehiculeId}
                onChange={(v) => setForm({ ...form, vehiculeId: v })}
                options={availableVehicles.map((v) => ({
                  value: v.id,
                  label: `${v.identifiant} — ${v.nom}`,
                }))}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Employé / Loueur">
              <Select
                value={form.employeId}
                onChange={(v) => setForm({ ...form, employeId: v })}
                options={db.users.map((u) => ({ value: u.id, label: fullName(u) }))}
              />
            </FieldRow>
          </div>
        </div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Client">
              <input
                className="sam-input"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                placeholder="Nom du client"
                list="citizen-list"
              />
              <datalist id="citizen-list">
                {db.citizens.map((c) => (
                  <option key={c.id} value={fullName(c)} />
                ))}
              </datalist>
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Téléphone">
              <input
                className="sam-input"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="555-0000"
              />
            </FieldRow>
          </div>
        </div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Prix ($)">
              <input
                className="sam-input"
                type="number"
                min="0"
                value={form.prix}
                onChange={(e) => setForm({ ...form, prix: e.target.value })}
                placeholder="0"
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Date">
              <input
                className="sam-input"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </FieldRow>
          </div>
        </div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Heure">
              <input
                className="sam-input"
                type="time"
                value={form.heure}
                onChange={(e) => setForm({ ...form, heure: e.target.value })}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Durée">
              <Select
                value={form.duree}
                onChange={(v) => setForm({ ...form, duree: v })}
                options={RENTAL_DURATIONS.map((d) => ({ value: d, label: formatDuree(d) }))}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Statut">
              <Select
                value={form.statut}
                onChange={(v) => setForm({ ...form, statut: v })}
                options={[
                  { value: 'Réservée', label: 'Réservée' },
                  { value: 'En cours', label: 'En cours' },
                ]}
              />
            </FieldRow>
          </div>
        </div>
        <FieldRow label="Notes (facultatif)">
          <textarea
            className="sam-input"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ resize: 'vertical' }}
          />
        </FieldRow>
        <div className="flex justify-end gap-3">
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" onClick={submit} className="sam-btn sam-btn-gold">
            <Plus size={15} /> Créer la location
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function RentalsPage({ db, actions, isAdmin, session, notify }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editRental, setEditRental] = useState(null);
  const [deleteRental, setDeleteRental] = useState(null);

  const rows = db.rentals
    .filter((r) => statusFilter === 'all' || r.statut === statusFilter)
    .filter((r) => !search || `${r.client} ${r.numero}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.date + b.heure).localeCompare(a.date + a.heure));

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Location"
        title="Suivi des locations"
        subtitle="Toutes les locations en cours, réservées et terminées."
        action={
          <button className="sam-btn sam-btn-gold" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Nouvelle location
          </button>
        }
      />

      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 18 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Client ou n° de location..." />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Tous statuts' },
            { value: 'En cours', label: '🟢 En cours' },
            { value: 'Réservée', label: '🔵 Réservée' },
            { value: 'Terminée', label: '⚪ Terminée' },
            { value: 'Annulée', label: '🔴 Annulée' },
          ]}
          style={{ width: 180 }}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<ClipboardList size={36} />} text="Aucune location trouvée" />
      ) : (
        <div className="sam-table-wrap sam-card">
          <table className="sam-table">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Loueur</th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Prix</th>
                <th>Date</th>
                <th>Durée</th>
                <th>Statut</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const v = vehicleOf(db, r.vehiculeId);
                return (
                  <tr key={r.id}>
                    <td>{v ? `${categoryOf(db, v.categorieId).icone} ${v.nom}` : '—'}</td>
                    <td>{fullName(userOf(db, r.employeId))}</td>
                    <td>{r.client}</td>
                    <td style={{ color: THEME.textMuted }}>{r.telephone || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(r.prix)}</td>
                    <td>
                      {formatDate(r.date)} · {r.heure}
                    </td>
                    <td>{r.duree}</td>
                    <td>
                      <Badge status={r.statut} />
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex gap-1">
                          <button
                            className="sam-btn sam-btn-ghost sam-btn-sm"
                            onClick={() => setEditRental(r)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className="sam-btn sam-btn-danger sam-btn-sm"
                            onClick={() => setDeleteRental(r)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddRentalModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        db={db}
        actions={actions}
        notify={notify}
        session={session}
      />

      <Modal open={!!editRental} onClose={() => setEditRental(null)} title="Modifier la location" width={420}>
        {editRental && (
          <div>
            <FieldRow label="Statut">
              <Select
                value={editRental.statut}
                onChange={(v) => setEditRental({ ...editRental, statut: v })}
                options={[
                  { value: 'En cours', label: 'En cours' },
                  { value: 'Réservée', label: 'Réservée' },
                  { value: 'Terminée', label: 'Terminée' },
                  { value: 'Annulée', label: 'Annulée' },
                ]}
              />
            </FieldRow>
            <FieldRow label="Prix ($)">
              <input
                className="sam-input"
                type="number"
                value={editRental.prix}
                onChange={(e) => setEditRental({ ...editRental, prix: e.target.value })}
              />
            </FieldRow>
            <div className="flex justify-end gap-3">
              <button className="sam-btn sam-btn-ghost" onClick={() => setEditRental(null)}>
                Annuler
              </button>
              <button
                className="sam-btn sam-btn-gold"
                onClick={() => {
                  actions.updateRental(editRental.id, { ...editRental, prix: Number(editRental.prix) || 0 });
                  notify('Location mise à jour.', 'success');
                  setEditRental(null);
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteRental}
        onCancel={() => setDeleteRental(null)}
        danger
        title="Supprimer cette location ?"
        message={
          deleteRental
            ? `La location ${deleteRental.numero} de ${deleteRental.client} sera définitivement supprimée.`
            : ''
        }
        confirmLabel="Supprimer"
        onConfirm={async () => {
          await actions.deleteRental(deleteRental.id);
          setDeleteRental(null);
        }}
      />
    </div>
  );
}
