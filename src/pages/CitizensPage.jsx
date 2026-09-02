import { useEffect, useState } from 'react';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { THEME } from '../theme';
import { formatDate, fullName, todayISO, uid } from '../lib/utils';
import { citizenRentals, citizenPermits, citizenLastActivity, nextCitizenId } from '../lib/stats';
import { Avatar, FieldRow, Modal, PageHeader, SearchInput, EmptyState } from '../components/ui';

/* ============================================================
   CITOYENS / CLIENTS
   ============================================================ */

/* L'identifiant (CIT-0001, CIT-0002...) est attribué automatiquement à la
   suite du dernier existant : c'est la même règle que lors de la création
   d'un candidat depuis la page Permis, pour ne pas créer deux séries. */
export function CitizenModal({ open, onClose, db, actions, notify }) {
  const blank = { prenom: '', nom: '', telephone: '' };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) setForm(blank);
  }, [open]);

  function submit() {
    if (!form.prenom.trim() || !form.nom.trim()) {
      notify('Veuillez indiquer le prénom et le nom du client.', 'error');
      return;
    }

    actions.addCitizen({
      id: uid('c'),
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      telephone: form.telephone.trim(),
      identifiant: nextCitizenId(db.citizens),
      photo: '',
      dateCreation: todayISO(),
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouveau client"
      subtitle="Un identifiant lui sera attribué automatiquement."
      width={460}
    >
      <div>
        <div className="flex gap-3 flex-wrap">
          <div style={{ flex: 1, minWidth: 150 }}>
            <FieldRow label="Prénom">
              <input
                className="sam-input"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                placeholder="Ex : Marie"
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <FieldRow label="Nom">
              <input
                className="sam-input"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex : Dupont"
              />
            </FieldRow>
          </div>
        </div>

        <FieldRow label="Téléphone (facultatif)">
          <input
            className="sam-input"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            placeholder="555-0000"
          />
        </FieldRow>

        <div className="flex justify-end gap-3">
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="sam-btn sam-btn-gold" onClick={submit}>
            Créer le client
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function CitizensPage({ db, actions, notify, openCitizen }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const rows = db.citizens
    .filter(
      (c) =>
        !search ||
        `${fullName(c)} ${c.telephone} ${c.identifiant}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => citizenLastActivity(db, b).localeCompare(citizenLastActivity(db, a)));

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Permis"
        title="Citoyens / Clients"
        subtitle="Retrouvez toutes les personnes ayant interagi avec San Andreas Marina."
        action={
          <button className="sam-btn sam-btn-gold" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Nouveau client
          </button>
        }
      />
      <div style={{ marginBottom: 18 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Nom, téléphone ou identifiant..." />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<UsersIcon size={36} />} text="Aucun citoyen trouvé" />
      ) : (
        <div className="sam-table-wrap sam-card">
          <table className="sam-table">
            <thead>
              <tr>
                <th></th>
                <th>Citoyen</th>
                <th>Téléphone</th>
                <th>Permis</th>
                <th>Locations</th>
                <th>Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const permits = citizenPermits(db, c);
                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openCitizen(c.id)}>
                    <td>
                      <Avatar name={fullName(c)} photo={c.photo} size={34} />
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {fullName(c)}{' '}
                      <span style={{ color: THEME.textMuted, fontWeight: 400, fontSize: 11.5 }}>
                        ({c.identifiant})
                      </span>
                    </td>
                    <td style={{ color: THEME.textMuted }}>{c.telephone || '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        {permits
                          .filter((p) => p.statut === 'Valide')
                          .map((p) => (
                            <span key={p.id} title={p.type}>
                              {p.type === 'Bateau' ? '🚤' : '🚁'}
                            </span>
                          ))}
                        {permits.filter((p) => p.statut === 'Valide').length === 0 && (
                          <span style={{ color: THEME.textMuted }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>{citizenRentals(db, c).length}</td>
                    <td style={{ color: THEME.textMuted }}>{formatDate(citizenLastActivity(db, c))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CitizenModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        db={db}
        actions={actions}
        notify={notify}
      />
    </div>
  );
}
