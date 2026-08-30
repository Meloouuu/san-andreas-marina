import { useState, useEffect } from 'react';
import { Plus, Wrench, Anchor } from 'lucide-react';
import { THEME } from '../theme';
import { todayISO, fullName } from '../lib/utils';
import { nextVehicleId, categoryOf, vehicleStats } from '../lib/stats';
import { Badge, PageHeader, Modal, SearchInput, Select, FieldRow, EmptyState } from '../components/ui';

/* ============================================================
   GARAGE — LISTE DES VÉHICULES
   ============================================================ */


export function VehicleCard({ v, cat, rentalsCount, onClick }) {
  return (
    <div
      className="sam-card sam-card-hover"
      style={{ cursor: 'pointer', overflow: 'hidden' }}
      onClick={onClick}
    >
      <div
        style={{
          height: 130,
          background: `linear-gradient(135deg, ${THEME.bg2}, ${THEME.card})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {v.photo ? (
          <img src={v.photo} alt={v.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 46, opacity: 0.5 }}>{cat.icone}</span>
        )}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <Badge status={v.statut} />
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div className="sam-display" style={{ fontSize: 17, fontWeight: 700 }}>
          {v.nom}
        </div>
        <div className="flex items-center gap-2" style={{ marginTop: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, color: THEME.gold }}>
            {cat.icone} {cat.nom}
          </span>
        </div>
        <div className="flex items-center justify-between" style={{ fontSize: 12, color: THEME.textMuted }}>
          <span>{v.identifiant}</span>
          <span>
            {rentalsCount} location{rentalsCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

export function GaragePage({ db, actions, isAdmin, notify, openVehicle }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = db.vehicles.filter((v) => {
    if (catFilter !== 'all' && v.categorieId !== catFilter) return false;
    if (statusFilter !== 'all' && v.statut !== statusFilter) return false;
    if (search && !`${v.nom} ${v.identifiant}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Location"
        title="Garage San Andreas Marina"
        subtitle="Gérez l'ensemble de la flotte : bateaux, bateaux premium et hélicoptères."
        action={
          isAdmin || true ? (
            <button className="sam-btn sam-btn-gold" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Ajouter un véhicule
            </button>
          ) : null
        }
      />

      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un véhicule..." />
        <Select
          value={catFilter}
          onChange={setCatFilter}
          options={[
            { value: 'all', label: 'Toutes catégories' },
            ...db.categories.map((c) => ({ value: c.id, label: `${c.icone} ${c.nom}` })),
          ]}
          style={{ width: 190 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Tous statuts' },
            { value: 'Disponible', label: '🟢 Disponible' },
            { value: 'Loué', label: '🟡 Loué' },
            { value: 'Réservé', label: '🔵 Réservé' },
            { value: 'Maintenance', label: '🔴 Maintenance' },
          ]}
          style={{ width: 170 }}
        />
      </div>

      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 22 }}>
        <div className={`sam-tab ${catFilter === 'all' ? 'active' : ''}`} onClick={() => setCatFilter('all')}>
          Tous ({db.vehicles.length})
        </div>
        {db.categories
          .filter((c) => c.statut === 'Actif')
          .map((c) => (
            <div
              key={c.id}
              className={`sam-tab ${catFilter === c.id ? 'active' : ''}`}
              onClick={() => setCatFilter(c.id)}
            >
              {c.icone} {c.nom} ({db.vehicles.filter((v) => v.categorieId === c.id).length})
            </div>
          ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Anchor size={38} />}
          text="Aucun véhicule ne correspond à ces critères"
          sub="Essayez d'ajuster vos filtres ou votre recherche."
        />
      ) : (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}
        >
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              v={v}
              cat={categoryOf(db, v.categorieId)}
              rentalsCount={vehicleStats(db, v.id).count}
              onClick={() => openVehicle(v.id)}
            />
          ))}
        </div>
      )}

      <AddVehicleModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        db={db}
        actions={actions}
        notify={notify}
      />
    </div>
  );
}

export function AddVehicleModal({ open, onClose, db, actions, notify }) {
  const blank = {
    nom: '',
    categorieId: db.categories[0] ? db.categories[0].id : '',
    photo: '',
    statut: 'Disponible',
    etat: 'Excellent',
    description: '',
  };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) setForm(blank);
  }, [open]);

  function submit() {
    if (!form.nom.trim()) {
      notify('Veuillez indiquer le nom du véhicule.', 'error');
      return;
    }
    const identifiant = nextVehicleId(db.vehicles);
    actions.addVehicle({
      ...form,
      identifiant,
      dateAjout: todayISO(),
      heuresMoteur: 0,
      heuresVol: 0,
      notes: [],
    });
    notify(`Véhicule ajouté au garage — ${identifiant}`, 'success');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter un véhicule"
      subtitle="Le véhicule apparaîtra immédiatement dans le garage."
    >
      <div>
        <FieldRow label="Nom du véhicule">
          <input
            className="sam-input"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            placeholder="Ex : Princess 62"
          />
        </FieldRow>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Catégorie">
              <Select
                value={form.categorieId}
                onChange={(v) => setForm({ ...form, categorieId: v })}
                options={db.categories.map((c) => ({ value: c.id, label: `${c.icone} ${c.nom}` }))}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Statut initial">
              <Select
                value={form.statut}
                onChange={(v) => setForm({ ...form, statut: v })}
                options={[
                  { value: 'Disponible', label: 'Disponible' },
                  { value: 'Maintenance', label: 'Maintenance' },
                ]}
              />
            </FieldRow>
          </div>
        </div>
        <FieldRow label="État du véhicule">
          <Select
            value={form.etat}
            onChange={(v) => setForm({ ...form, etat: v })}
            options={[
              { value: 'Excellent', label: '🟢 Excellent' },
              { value: 'Bon', label: '🟡 Bon' },
              { value: 'À surveiller', label: '🟠 À surveiller' },
              { value: 'Maintenance', label: '🔴 Maintenance' },
            ]}
          />
        </FieldRow>
        <FieldRow label="Photo (URL, facultatif)">
          <input
            className="sam-input"
            value={form.photo}
            onChange={(e) => setForm({ ...form, photo: e.target.value })}
            placeholder="https://..."
          />
        </FieldRow>
        <FieldRow label="Description">
          <textarea
            className="sam-input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description du véhicule..."
            style={{ resize: 'vertical' }}
          />
        </FieldRow>
        <div className="flex justify-end gap-3" style={{ marginTop: 6 }}>
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" onClick={submit} className="sam-btn sam-btn-gold">
            <Plus size={15} /> Ajouter au garage
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   GARAGE — FICHE DÉTAILLÉE D'UN VÉHICULE
   ============================================================ */

export function EditVehicleModal({ open, onClose, vehicle, db, actions, notify }) {
  const [form, setForm] = useState(vehicle || {});
  useEffect(() => {
    if (open && vehicle) setForm(vehicle);
  }, [open, vehicle]);
  if (!vehicle) return null;

  function submit() {
    if (!form.nom.trim()) {
      notify('Veuillez indiquer le nom du véhicule.', 'error');
      return;
    }
    actions.updateVehicle(vehicle.id, form);
    notify('Fiche véhicule mise à jour.', 'success');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Modifier — ${vehicle.nom}`}>
      <div>
        <FieldRow label="Nom du véhicule">
          <input
            className="sam-input"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </FieldRow>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Catégorie">
              <Select
                value={form.categorieId}
                onChange={(v) => setForm({ ...form, categorieId: v })}
                options={db.categories.map((c) => ({ value: c.id, label: `${c.icone} ${c.nom}` }))}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Identifiant">
              <input
                className="sam-input"
                value={form.identifiant}
                onChange={(e) => setForm({ ...form, identifiant: e.target.value })}
              />
            </FieldRow>
          </div>
        </div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Statut">
              <Select
                value={form.statut}
                onChange={(v) => setForm({ ...form, statut: v })}
                options={[
                  { value: 'Disponible', label: 'Disponible' },
                  { value: 'Loué', label: 'Loué' },
                  { value: 'Réservé', label: 'Réservé' },
                  { value: 'Maintenance', label: 'Maintenance' },
                ]}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="État">
              <Select
                value={form.etat}
                onChange={(v) => setForm({ ...form, etat: v })}
                options={[
                  { value: 'Excellent', label: '🟢 Excellent' },
                  { value: 'Bon', label: '🟡 Bon' },
                  { value: 'À surveiller', label: '🟠 À surveiller' },
                  { value: 'Maintenance', label: '🔴 Maintenance' },
                ]}
              />
            </FieldRow>
          </div>
        </div>
        <FieldRow label="Photo (URL)">
          <input
            className="sam-input"
            value={form.photo}
            onChange={(e) => setForm({ ...form, photo: e.target.value })}
            placeholder="https://..."
          />
        </FieldRow>
        <FieldRow label="Description">
          <textarea
            className="sam-input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ resize: 'vertical' }}
          />
        </FieldRow>
        <div className="flex justify-end gap-3">
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" onClick={submit} className="sam-btn sam-btn-gold">
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function AddMaintenanceModal({ open, onClose, vehicle, db, actions, notify }) {
  const blank = {
    date: todayISO(),
    type: '',
    cout: '',
    responsable: db.users[0] ? db.users[0].id : '',
    commentaire: '',
  };
  const [form, setForm] = useState(blank);
  useEffect(() => {
    if (open) setForm(blank);
  }, [open]);

  function submit() {
    if (!form.date) {
      notify('Veuillez indiquer la date de la maintenance.', 'error');
      return;
    }
    if (!form.type.trim()) {
      notify("Veuillez indiquer le type d'intervention.", 'error');
      return;
    }
    actions.addMaintenance(vehicle.id, {
      ...form,
      cout: Number(form.cout) || 0,
    });
    notify(`Maintenance enregistrée pour ${vehicle.nom}.`, 'success');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter une maintenance"
      subtitle={vehicle ? vehicle.nom : ''}
    >
      <div>
        <div className="flex gap-3">
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
          <div style={{ flex: 1 }}>
            <FieldRow label="Coût ($)">
              <input
                className="sam-input"
                type="number"
                min="0"
                value={form.cout}
                onChange={(e) => setForm({ ...form, cout: e.target.value })}
                placeholder="0"
              />
            </FieldRow>
          </div>
        </div>
        <FieldRow label="Type d'intervention">
          <input
            className="sam-input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            placeholder="Ex : Révision moteur"
          />
        </FieldRow>
        <FieldRow label="Responsable">
          <Select
            value={form.responsable}
            onChange={(v) => setForm({ ...form, responsable: v })}
            options={db.users.map((u) => ({ value: u.id, label: fullName(u) }))}
          />
        </FieldRow>
        <FieldRow label="Commentaire">
          <textarea
            className="sam-input"
            rows={3}
            value={form.commentaire}
            onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
            style={{ resize: 'vertical' }}
          />
        </FieldRow>
        <div className="flex justify-end gap-3">
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" onClick={submit} className="sam-btn sam-btn-gold">
            <Wrench size={15} /> Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}
