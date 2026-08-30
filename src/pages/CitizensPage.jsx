import { useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { THEME } from '../theme';
import { formatDate, fullName } from '../lib/utils';
import { citizenRentals, citizenPermits, citizenLastActivity } from '../lib/stats';
import { Avatar, PageHeader, SearchInput, EmptyState } from '../components/ui';

/* ============================================================
   CITOYENS / CLIENTS
   ============================================================ */


export function CitizensPage({ db, notify, openCitizen }) {
  const [search, setSearch] = useState('');
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
    </div>
  );
}
