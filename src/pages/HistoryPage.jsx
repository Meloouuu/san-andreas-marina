import { useState } from 'react';
import { ChevronLeft, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { addDays, formatCurrency, formatDate, fullName, startOfWeek, todayISO } from '../lib/utils';
import { inRange, userOf, vehicleOf } from '../lib/stats';
import { Badge, EmptyState, PageHeader, SearchInput, Select } from '../components/ui';

/* ============================================================
   HISTORIQUE
   ============================================================ */

export function HistoryPage({ db }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [empFilter, setEmpFilter] = useState('all');
  const [vehFilter, setVehFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodMode, setPeriodMode] = useState('semaine');

  const weekStart = addDays(startOfWeek(todayISO()), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);

  const rows = db.rentals
    .filter((r) => periodMode !== 'semaine' || inRange(r.date, weekStart, weekEnd))
    .filter((r) => empFilter === 'all' || r.employeId === empFilter)
    .filter((r) => vehFilter === 'all' || r.vehiculeId === vehFilter)
    .filter((r) => catFilter === 'all' || (vehicleOf(db, r.vehiculeId) || {}).categorieId === catFilter)
    .filter((r) => statusFilter === 'all' || r.statut === statusFilter)
    .filter((r) => !search || `${r.client} ${r.numero}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Gestion"
        title="Historique des locations"
        subtitle="Archive complète de toutes les locations réalisées."
      />

      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 14 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Client ou n° de location..." />
        <Select
          value={empFilter}
          onChange={setEmpFilter}
          options={[
            { value: 'all', label: 'Tous les employés' },
            ...db.users.map((u) => ({ value: u.id, label: fullName(u) })),
          ]}
          style={{ width: 180 }}
        />
        <Select
          value={vehFilter}
          onChange={setVehFilter}
          options={[
            { value: 'all', label: 'Tous les véhicules' },
            ...db.vehicles.map((v) => ({ value: v.id, label: v.nom })),
          ]}
          style={{ width: 170 }}
        />
        <Select
          value={catFilter}
          onChange={setCatFilter}
          options={[
            { value: 'all', label: 'Toutes catégories' },
            ...db.categories.map((c) => ({ value: c.id, label: c.nom })),
          ]}
          style={{ width: 170 }}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Tous statuts' },
            { value: 'En cours', label: 'En cours' },
            { value: 'Réservée', label: 'Réservée' },
            { value: 'Terminée', label: 'Terminée' },
            { value: 'Annulée', label: 'Annulée' },
          ]}
          style={{ width: 150 }}
        />
        <Select
          value={periodMode}
          onChange={setPeriodMode}
          options={[
            { value: 'semaine', label: 'Par semaine' },
            { value: 'tout', label: 'Toutes périodes' },
          ]}
          style={{ width: 160 }}
        />
      </div>

      {periodMode === 'semaine' && (
        <div className="flex items-center justify-center gap-4" style={{ marginBottom: 18 }}>
          <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft size={14} /> Semaine précédente
          </button>
          <span style={{ fontWeight: 700, fontSize: 13.5, minWidth: 190, textAlign: 'center' }}>
            {weekOffset === 0 ? 'Semaine actuelle' : `${formatDate(weekStart)} — ${formatDate(weekEnd)}`}
          </span>
          <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={() => setWeekOffset((o) => o + 1)}>
            Semaine suivante <ChevronRight size={14} />
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState icon={<HistoryIcon size={36} />} text="Aucune location sur cette période" />
      ) : (
        <div className="sam-table-wrap sam-card">
          <table className="sam-table">
            <thead>
              <tr>
                <th>N° Location</th>
                <th>Véhicule</th>
                <th>Employé</th>
                <th>Client</th>
                <th>Prix</th>
                <th>Date</th>
                <th>Durée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.numero}</td>
                  <td>{(vehicleOf(db, r.vehiculeId) || {}).nom || '—'}</td>
                  <td>{fullName(userOf(db, r.employeId))}</td>
                  <td>{r.client}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(r.prix)}</td>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.duree}</td>
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
  );
}
