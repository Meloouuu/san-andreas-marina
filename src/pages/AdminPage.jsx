import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Phone, Settings, Check, Mail, Users as UsersIcon, ClipboardList, Anchor, ShieldCheck, LayoutGrid, RefreshCw } from 'lucide-react';
import { THEME, LOGO } from '../theme';
import { uid, todayISO, formatDate, formatCurrency, fullName } from '../lib/utils';
import { vehicleOf, userOf, citizenOf } from '../lib/stats';
import { Badge, Avatar, PageHeader, Modal, ConfirmDialog, SearchInput, Select, FieldRow, DocCheck } from '../components/ui';

/* ============================================================
   ADMIN — RESSOURCES / CATÉGORIES
   ============================================================ */

export function CategoryModal({ open, onClose, category, db, actions, notify }) {
  const blank = { nom: '', description: '', icone: '🚤', statut: 'Actif', prixHeure: '', reductionHeure: '' };
  const [form, setForm] = useState(blank);
  useEffect(() => {
    if (open) setForm(category || blank);
  }, [open, category]);

  function submit() {
    if (!form.nom.trim()) {
      notify('Veuillez indiquer le nom de la catégorie.', 'error');
      return;
    }
    const payload = {
      ...form,
      prixHeure: Number(form.prixHeure) || 0,
      reductionHeure: Number(form.reductionHeure) || 0,
    };
    if (category) {
      actions.updateCategory(category.id, payload);
      notify('Catégorie mise à jour.', 'success');
    } else {
      actions.addCategory({ ...payload, id: uid('cat') });
      notify('Nouvelle catégorie créée — visible dans le Garage.', 'success');
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
      <div>
        <div className="flex gap-3">
          <div style={{ width: 90 }}>
            <FieldRow label="Icône">
              <input
                className="sam-input"
                style={{ textAlign: 'center', fontSize: 18 }}
                value={form.icone}
                onChange={(e) => setForm({ ...form, icone: e.target.value })}
                maxLength={2}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Nom">
              <input
                className="sam-input"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex : Jet-ski"
              />
            </FieldRow>
          </div>
        </div>
        <FieldRow label="Description">
          <input
            className="sam-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Statut">
          <Select
            value={form.statut}
            onChange={(v) => setForm({ ...form, statut: v })}
            options={[
              { value: 'Actif', label: 'Actif' },
              { value: 'Inactif', label: 'Inactif' },
            ]}
          />
        </FieldRow>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Prix de départ / heure ($)">
              <input
                className="sam-input"
                type="number"
                min="0"
                value={form.prixHeure}
                onChange={(e) => setForm({ ...form, prixHeure: e.target.value })}
                placeholder="Ex : 450"
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Réduction / heure suppl. (%)">
              <input
                className="sam-input"
                type="number"
                min="0"
                max="100"
                value={form.reductionHeure}
                onChange={(e) => setForm({ ...form, reductionHeure: e.target.value })}
                placeholder="Ex : 8"
              />
            </FieldRow>
          </div>
        </div>
        <p style={{ color: THEME.textMuted, fontSize: 12, margin: '-8px 0 12px' }}>
          Le prix d'une location se pré-remplit automatiquement à partir de ce tarif
          (prix de départ × durée, réduit de ce pourcentage par heure au-delà de la
          première). Laissez à 0 pour continuer à saisir le prix à la main.
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" onClick={submit} className="sam-btn sam-btn-gold">
            {category ? 'Enregistrer' : 'Créer la catégorie'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function AdminCategories({ db, actions, notify }) {
  const [modalCat, setModalCat] = useState(undefined);
  const [deleteCat, setDeleteCat] = useState(null);

  return (
    <div>
      <div className="sam-section-head">
        <div>
          <h3 className="sam-display" style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>
            Gestion des catégories
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '4px 0 0' }}>
            Toute nouvelle catégorie apparaît automatiquement dans le Garage.
          </p>
        </div>
        <button className="sam-btn sam-btn-gold sam-btn-sm" onClick={() => setModalCat(null)}>
          <Plus size={14} /> Nouvelle catégorie
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {db.categories.map((c) => (
          <div key={c.id} className="sam-card" style={{ padding: 18 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 26 }}>{c.icone}</span>
              <Badge status={c.statut} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{c.nom}</div>
            <div style={{ fontSize: 12.5, color: THEME.textMuted, margin: '4px 0 12px', minHeight: 32 }}>
              {c.description}
            </div>
            <div style={{ fontSize: 12.5, color: THEME.gold || THEME.textMuted, marginBottom: 12 }}>
              {c.prixHeure
                ? `${formatCurrency(c.prixHeure)} / h${c.reductionHeure ? ` · -${c.reductionHeure}%/h suppl.` : ''}`
                : 'Aucun tarif défini'}
            </div>
            <div className="flex gap-2">
              <button
                className="sam-btn sam-btn-ghost sam-btn-sm"
                style={{ flex: 1 }}
                onClick={() => setModalCat(c)}
              >
                <Pencil size={13} /> Modifier
              </button>
              <button className="sam-btn sam-btn-danger sam-btn-sm" onClick={() => setDeleteCat(c)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CategoryModal
        open={modalCat !== undefined}
        onClose={() => setModalCat(undefined)}
        category={modalCat}
        db={db}
        actions={actions}
        notify={notify}
      />
      <ConfirmDialog
        open={!!deleteCat}
        onCancel={() => setDeleteCat(null)}
        danger
        title="Supprimer cette catégorie ?"
        message={
          deleteCat
            ? `"${deleteCat.nom}" sera supprimée. Les véhicules existants ne seront pas supprimés.`
            : ''
        }
        confirmLabel="Supprimer"
        onConfirm={async () => {
          await actions.deleteCategory(deleteCat.id);
          setDeleteCat(null);
        }}
      />
    </div>
  );
}

/* ============================================================
   ADMIN — GESTION DES UTILISATEURS
   ============================================================ */

export function UserModal({ open, onClose, user, actions, notify }) {
  const blank = {
    prenom: '',
    nom: '',
    sexe: 'Homme',
    dateNaissance: '',
    photo: '',
    telephone: '',
    iban: '',
    dateEntree: todayISO(),
    role: 'employe',
    contratSigne: false,
    visiteMedicale: false,
    email: '',
    password: '',
  };
  const [form, setForm] = useState(blank);
  useEffect(() => {
    if (!open) return;

    if (user) {
      setForm({
        prenom: user.prenom || '',
        nom: user.nom || '',
        sexe: user.sexe || 'Homme',
        dateNaissance: user.dateNaissance || '',
        photo: user.photo || '',
        telephone: user.telephone || '',
        iban: user.iban || '',
        dateEntree: user.dateEntree || '',
        role: user.role || 'employe',
        contratSigne: !!user.contratSigne,
        visiteMedicale: !!user.visiteMedicale,
        email: user.email || '',
        password: '',
        id: user.id,
        dateCreation: user.dateCreation || '',
      });
    } else {
      setForm(blank);
    }
  }, [open, user]);

  function submit() {
    if (!form.prenom.trim() || !form.nom.trim()) {
      notify('Veuillez indiquer le prénom et le nom.', 'error');
      return;
    }
    if (!form.email.trim()) {
      notify('Veuillez indiquer une adresse e-mail.', 'error');
      return;
    }
    if (user) {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      actions.updateUser(user.id, payload);
      notify('Utilisateur mis à jour.', 'success');
    } else {
      if (!form.password) {
        notify('Veuillez définir un mot de passe temporaire.', 'error');
        return;
      }
      actions.addUser({ ...form, id: uid('u'), dateCreation: todayISO() });
      notify('Nouvel utilisateur créé.', 'success');
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Modifier un utilisateur' : 'Nouvel utilisateur'}
      width={620}
    >
      <div>
        <div className="sam-label" style={{ marginTop: 0 }}>
          Informations personnelles
        </div>
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
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Sexe">
              <Select
                value={form.sexe}
                onChange={(v) => setForm({ ...form, sexe: v })}
                options={[
                  { value: 'Homme', label: 'Homme' },
                  { value: 'Femme', label: 'Femme' },
                ]}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Date de naissance">
              <input
                className="sam-input"
                type="date"
                value={form.dateNaissance}
                onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
              />
            </FieldRow>
          </div>
        </div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Téléphone">
              <input
                className="sam-input"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="IBAN">
              <input
                className="sam-input"
                value={form.iban}
                onChange={(e) => setForm({ ...form, iban: e.target.value })}
              />
            </FieldRow>
          </div>
        </div>
        <FieldRow label="Photo (URL, facultatif)">
          <input
            className="sam-input"
            value={form.photo}
            onChange={(e) => setForm({ ...form, photo: e.target.value })}
            placeholder="https://..."
          />
        </FieldRow>

        <div className="sam-label">Informations professionnelles</div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Date d'entrée">
              <input
                className="sam-input"
                type="date"
                value={form.dateEntree}
                onChange={(e) => setForm({ ...form, dateEntree: e.target.value })}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Rôle">
              <Select
                value={form.role}
                onChange={(v) => setForm({ ...form, role: v })}
                options={[
                  { value: 'employe', label: 'Employé' },
                  { value: 'admin', label: 'Administrateur' },
                ]}
              />
            </FieldRow>
          </div>
        </div>

        <div className="sam-label">Documents</div>
        <div className="flex gap-6" style={{ marginBottom: 14 }}>
          <DocCheck
            label="Contrat signé"
            checked={form.contratSigne}
            onToggle={() => setForm({ ...form, contratSigne: !form.contratSigne })}
          />
          <DocCheck
            label="Visite médicale effectuée"
            checked={form.visiteMedicale}
            onToggle={() => setForm({ ...form, visiteMedicale: !form.visiteMedicale })}
          />
        </div>

        <div className="sam-label">Connexion</div>
        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Adresse e-mail">
              <input
                className="sam-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label={user ? 'Nouveau mot de passe (facultatif)' : 'Mot de passe temporaire'}>
              <input
                className="sam-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={user ? 'Laisser vide pour ne pas changer' : ''}
              />
            </FieldRow>
          </div>
        </div>

        <div className="flex justify-end gap-3" style={{ marginTop: 6 }}>
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" onClick={submit} className="sam-btn sam-btn-gold">
            {user ? 'Enregistrer' : 'Créer le compte'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function AdminUsers({ db, actions, notify, session }) {
  const [search, setSearch] = useState('');
  const [modalUser, setModalUser] = useState(undefined);
  const [deleteUser, setDeleteUser] = useState(null);

  const rows = db.users.filter(
    (u) => !search || `${fullName(u)} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="sam-section-head">
        <div>
          <h3 className="sam-display" style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>
            Gestion des utilisateurs
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '4px 0 0' }}>
            {db.users.length} compte{db.users.length > 1 ? 's' : ''} ·{' '}
            {db.users.filter((u) => u.role === 'admin').length} administrateur
            {db.users.filter((u) => u.role === 'admin').length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="sam-btn sam-btn-ghost sam-btn-sm"
            onClick={() => notify('Liste actualisée.', 'info')}
            title="Actualiser"
          >
            <RefreshCw size={14} />
          </button>
          <button className="sam-btn sam-btn-gold sam-btn-sm" onClick={() => setModalUser(null)}>
            <Plus size={14} /> Nouvel utilisateur
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un employé par nom ou e-mail..."
        />
      </div>

      <div className="sam-table-wrap sam-card">
        <table className="sam-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>IBAN</th>
              <th>Contact</th>
              <th>Documents</th>
              <th>Rôle</th>
              <th>Date d'entrée</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar name={fullName(u)} photo={u.photo} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{fullName(u)}</div>
                      <div style={{ fontSize: 11.5, color: THEME.textMuted }}>
                        {u.id === session.id ? 'Vous' : u.sexe || '—'}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: THEME.textMuted }}>{u.iban}</td>
                <td style={{ fontSize: 12.5 }}>
                  <div className="flex items-center gap-2">
                    <Mail size={12} color={THEME.textMuted} />
                    {u.email}
                  </div>
                  <div className="flex items-center gap-2" style={{ color: THEME.textMuted, marginTop: 3 }}>
                    <Phone size={12} />
                    {u.telephone || '—'}
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className={`sam-doc-pill ${u.contratSigne ? 'ok' : 'ko'}`}>
                      {u.contratSigne ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}{' '}
                      Contrat
                    </span>
                    <span className={`sam-doc-pill ${u.visiteMedicale ? 'ok' : 'ko'}`}>
                      {u.visiteMedicale ? (
                        <Check size={11} strokeWidth={3} />
                      ) : (
                        <X size={11} strokeWidth={3} />
                      )}{' '}
                      Visite médicale
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`sam-badge ${u.role === 'admin' ? 'sam-badge-gold' : 'sam-badge-info'}`}>
                    {u.role === 'admin' ? 'Administrateur' : 'Employé'}
                  </span>
                </td>
                <td>{formatDate(u.dateEntree)}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={() => setModalUser(u)}>
                      <Pencil size={13} />
                    </button>
                    <button
                      className="sam-btn sam-btn-danger sam-btn-sm"
                      disabled={u.id === session.id}
                      title={u.id === session.id ? 'Vous ne pouvez pas supprimer votre propre compte' : ''}
                      onClick={() => setDeleteUser(u)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        open={modalUser !== undefined}
        onClose={() => setModalUser(undefined)}
        user={modalUser}
        actions={actions}
        notify={notify}
      />
      <ConfirmDialog
        open={!!deleteUser}
        onCancel={() => setDeleteUser(null)}
        danger
        title="Supprimer cet utilisateur ?"
        message={deleteUser ? `Le compte de ${fullName(deleteUser)} sera définitivement supprimé.` : ''}
        confirmLabel="Supprimer"
        onConfirm={async () => {
          await actions.deleteUser(deleteUser.id);
          setDeleteUser(null);
        }}
      />
    </div>
  );
}

/* ============================================================
   ADMIN — GESTION DES LOCATIONS / PERMIS / PARAMÈTRES
   ============================================================ */

export function AdminRentals({ db, actions, notify }) {
  const [deleteRental, setDeleteRental] = useState(null);
  const rows = db.rentals.slice().sort((a, b) => (b.date + b.heure).localeCompare(a.date + a.heure));
  return (
    <div>
      <div className="sam-section-head">
        <div>
          <h3 className="sam-display" style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>
            Gestion des locations
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '4px 0 0' }}>
            Modifier le statut ou supprimer une location. {db.rentals.length} au total.
          </p>
        </div>
      </div>
      <div className="sam-table-wrap sam-card">
        <table className="sam-table">
          <thead>
            <tr>
              <th>N° Location</th>
              <th>Employé</th>
              <th>Véhicule</th>
              <th>Prix total</th>
              <th>Date &amp; heure</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.numero}</td>
                <td>{fullName(userOf(db, r.employeId))}</td>
                <td>{(vehicleOf(db, r.vehiculeId) || {}).nom || '—'}</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(r.prix)}</td>
                <td>
                  {formatDate(r.date)} · {r.heure}
                </td>
                <td>
                  <Select
                    value={r.statut}
                    onChange={(v) => {
                      actions.updateRental(r.id, { statut: v });
                      notify('Statut de la location mis à jour.', 'success');
                    }}
                    options={[
                      { value: 'En cours', label: 'En cours' },
                      { value: 'Réservée', label: 'Réservée' },
                      { value: 'Terminée', label: 'Terminée' },
                      { value: 'Annulée', label: 'Annulée' },
                    ]}
                    style={{ padding: '5px 8px', fontSize: 12 }}
                  />
                </td>
                <td>
                  <button className="sam-btn sam-btn-danger sam-btn-sm" onClick={() => setDeleteRental(r)}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!deleteRental}
        onCancel={() => setDeleteRental(null)}
        danger
        title="Supprimer cette location ?"
        message={deleteRental ? `La location ${deleteRental.numero} sera définitivement supprimée.` : ''}
        confirmLabel="Supprimer"
        onConfirm={async () => {
          await actions.deleteRental(deleteRental.id);
          setDeleteRental(null);
        }}
      />
    </div>
  );
}

export function AdminPermits({ db, actions, notify }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const rows = db.permits
    .filter((p) => typeFilter === 'all' || p.type === typeFilter)
    .filter((p) => statusFilter === 'all' || p.statut === statusFilter)
    .filter((p) => {
      const c = citizenOf(db, p.citizenId);
      return !search || (c && fullName(c).toLowerCase().includes(search.toLowerCase()));
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="sam-section-head">
        <div>
          <h3 className="sam-display" style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>
            Gestion des permis
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '4px 0 0' }}>
            Un permis annulé reste dans l'historique et n'est jamais effacé.
          </p>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un citoyen..." />
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
            { value: 'Valide', label: 'Valide' },
            { value: 'En attente', label: 'En attente' },
            { value: 'Refusé', label: 'Refusé' },
            { value: 'Annulé', label: 'Annulé' },
          ]}
          style={{ width: 160 }}
        />
      </div>
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
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.numero || '—'}</td>
                <td>{fullName(citizenOf(db, p.citizenId))}</td>
                <td>{p.type === 'Bateau' ? '🚤 Bateau' : '🚁 Hélicoptère'}</td>
                <td>{fullName(userOf(db, p.formateurId))}</td>
                <td>{formatDate(p.date)}</td>
                <td>
                  <Select
                    value={p.statut}
                    onChange={(v) => {
                      actions.updatePermit(p.id, { statut: v });
                      notify('Statut du permis mis à jour.', 'success');
                    }}
                    options={[
                      { value: 'Valide', label: 'Valide' },
                      { value: 'En attente', label: 'En attente' },
                      { value: 'Refusé', label: 'Refusé' },
                      { value: 'Annulé', label: 'Annulé' },
                    ]}
                    style={{ padding: '5px 8px', fontSize: 12 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 10 }}>
        Un permis annulé reste visible dans l'historique — il n'est jamais supprimé de la base.
      </p>
    </div>
  );
}

export function AdminSettings({ session }) {
  const swatches = [
    ['Bleu marine', THEME.bg],
    ['Bleu secondaire', THEME.bg2],
    ['Cartes', THEME.card],
    ['Or principal', THEME.gold],
    ['Or clair', THEME.goldLight],
    ['Succès', THEME.success],
    ['Erreur', THEME.error],
  ];
  return (
    <div>
      <h3 className="sam-display" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>
        Paramètres
      </h3>
      <div className="sam-card" style={{ padding: 22, marginBottom: 18 }}>
        <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
          <img src={LOGO} style={{ width: 52, height: 52, objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 700 }}>San Andreas Marina</div>
            <div style={{ fontSize: 12.5, color: THEME.textMuted }}>
              Location de bateaux, bateaux premium &amp; hélicoptères
            </div>
          </div>
        </div>
        <div className="sam-label">Identité visuelle</div>
        <div className="flex gap-3 flex-wrap">
          {swatches.map(([label, hex]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: hex,
                  border: `1px solid ${THEME.border}`,
                }}
              />
              <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4, maxWidth: 60 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="sam-card" style={{ padding: 22 }}>
        <div className="sam-label">Compte connecté</div>
        <div style={{ fontSize: 13.5 }}>
          {fullName(session)} · {session.email}
        </div>
        <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 12 }}>
          D'autres paramètres (notifications, exports, intégrations) pourront être ajoutés ici selon vos
          besoins.
        </p>
      </div>
    </div>
  );
}

export function AdminStat({ label, value, icon }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '14px 17px',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        minWidth: 0,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          flexShrink: 0,
          background: 'linear-gradient(140deg, rgba(212,167,44,0.2), rgba(212,167,44,0.05))',
          border: '1px solid rgba(212,167,44,0.24)',
          boxShadow: '0 6px 18px -8px rgba(212,167,44,0.55)',
          color: THEME.goldLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="sam-display" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            color: THEME.textMuted,
            marginTop: 3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export function AdminPage({ db, actions, notify, session }) {
  const [tab, setTab] = useState('ressources');

  const tabs = [
    { id: 'ressources', label: 'Ressources', icon: <LayoutGrid size={15} /> },
    { id: 'users', label: 'Utilisateurs', icon: <UsersIcon size={15} /> },
    { id: 'rentals', label: 'Locations', icon: <ClipboardList size={15} /> },
    { id: 'permits', label: 'Permis', icon: <ShieldCheck size={15} /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings size={15} /> },
  ];

  const enAttente = db.permits.filter((p) => p.statut === 'En attente').length;
  const enCours = db.rentals.filter((r) => r.statut === 'En cours' || r.statut === 'Réservée').length;

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Administration"
        title="Panneau Admin"
        subtitle="Ressources, utilisateurs, locations et permis — visible uniquement par les administrateurs."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
          gap: 12,
          marginBottom: 22,
        }}
      >
        <AdminStat label="Comptes employés" value={db.users.length} icon={<UsersIcon size={17} />} />
        <AdminStat label="Véhicules au garage" value={db.vehicles.length} icon={<Anchor size={17} />} />
        <AdminStat
          label="Catégories actives"
          value={db.categories.filter((c) => c.statut === 'Actif').length}
          icon={<LayoutGrid size={17} />}
        />
        <AdminStat label="Locations en cours" value={enCours} icon={<ClipboardList size={17} />} />
        <AdminStat label="Permis à traiter" value={enAttente} icon={<ShieldCheck size={17} />} />
      </div>

      <div className="sam-segmented sam-scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`sam-segment ${tab === t.id ? 'active' : ''}`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="sam-card sam-fade-in" style={{ padding: 24 }}>
        {tab === 'ressources' && <AdminCategories db={db} actions={actions} notify={notify} />}
        {tab === 'users' && <AdminUsers db={db} actions={actions} notify={notify} session={session} />}
        {tab === 'rentals' && <AdminRentals db={db} actions={actions} notify={notify} />}
        {tab === 'permits' && <AdminPermits db={db} actions={actions} notify={notify} />}
        {tab === 'settings' && <AdminSettings session={session} />}
      </div>
    </div>
  );
}

