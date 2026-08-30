import { useState } from 'react';
import { ChevronLeft, Trash2, Users as UsersIcon, ClipboardList } from 'lucide-react';
import { THEME } from '../theme';
import { formatDate, formatCurrency, fullName } from '../lib/utils';
import { vehicleOf, citizenOf, citizenRentals, citizenPermits } from '../lib/stats';
import { Badge, Avatar, ConfirmDialog, EmptyState } from '../components/ui';

export function CitizenDetailPage({ db, actions, citizenId, back }) {
  const [showDelete, setShowDelete] = useState(false);
  const citizen = citizenOf(db, citizenId);
  if (!citizen) return <EmptyState icon={<UsersIcon size={36} />} text="Citoyen introuvable" />;
  const permits = citizenPermits(db, citizen).sort((a, b) => b.date.localeCompare(a.date));
  const rentals = citizenRentals(db, citizen).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="sam-fade-in">
      <div
        className="flex items-center gap-2"
        style={{ color: THEME.textMuted, fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
        onClick={back}
      >
        <ChevronLeft size={16} /> Retour aux citoyens
      </div>

      <div className="flex items-center justify-between flex-wrap" style={{ marginBottom: 26, gap: 14 }}>
        <div className="flex items-center gap-4 flex-wrap">
          <Avatar name={fullName(citizen)} photo={citizen.photo} size={68} />
          <div>
            <h1 className="sam-display" style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
              👤 {fullName(citizen)}
            </h1>
            <div
              className="flex items-center gap-3 flex-wrap"
              style={{ marginTop: 6, fontSize: 13, color: THEME.textMuted }}
            >
              <span>{citizen.identifiant}</span>
              <span>·</span>
              <span>{citizen.telephone || 'Téléphone non renseigné'}</span>
              <span>·</span>
              <span>Client depuis le {formatDate(citizen.dateCreation)}</span>
            </div>
          </div>
        </div>
        <button className="sam-btn sam-btn-ghost" onClick={() => setShowDelete(true)}>
          <Trash2 size={15} /> Supprimer
        </button>
      </div>

      <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>
        Permis
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        {permits.length === 0 && (
          <EmptyState icon={<span style={{ fontSize: 30 }}>🪪</span>} text="Aucun permis pour ce citoyen" />
        )}
        {permits.map((p) => (
          <div key={p.id} className="sam-card" style={{ padding: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>
                {p.type === 'Bateau' ? '🚤 Permis bateau' : '🚁 Permis hélicoptère'}
              </span>
              <Badge status={p.statut} />
            </div>
            <div style={{ fontSize: 12.5, color: THEME.textMuted, fontFamily: 'monospace' }}>
              N° : {p.numero || 'en attente d\u2019attribution'}
            </div>
            <div style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 3 }}>
              Date : {formatDate(p.date)}
            </div>
          </div>
        ))}
      </div>

      <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>
        Historique des locations
      </h3>
      {rentals.length === 0 ? (
        <EmptyState icon={<ClipboardList size={30} />} text="Aucune location pour ce citoyen" />
      ) : (
        <div className="sam-table-wrap sam-card">
          <table className="sam-table">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Date</th>
                <th>Durée</th>
                <th>Prix</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id}>
                  <td>{(vehicleOf(db, r.vehiculeId) || {}).nom || '—'}</td>
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

      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        danger
        title="Supprimer ce citoyen ?"
        message={`Cette action est définitive et supprimera "${fullName(citizen)}" du registre.`}
        confirmLabel="Supprimer"
        onConfirm={async () => {
          const ok = await actions.deleteCitizen(citizen.id);
          setShowDelete(false);
          if (ok) back();
        }}
      />
    </div>
  );
}
