import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Award } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { THEME } from '../theme';
import { todayISO, formatDate, formatCurrency, startOfWeek, addDays, fullName } from '../lib/utils';
import { sumCA, vehicleOf, CHART_TOOLTIP_STYLE } from '../lib/stats';
import { Avatar, StatCard, PageHeader, Modal } from '../components/ui';

/* ============================================================
   BASE DE DONNÉES (FINANCES)
   ============================================================ */

export function DatabasePage({ db, isAdmin }) {
  const [detailUser, setDetailUser] = useState(null);
  const weekStart = startOfWeek(todayISO());
  const monthStart = todayISO().slice(0, 7) + '-01';
  const caWeek = sumCA(db.rentals.filter((r) => r.date >= weekStart));
  const caMonth = sumCA(db.rentals.filter((r) => r.date >= monthStart));
  const caTotal = sumCA(db.rentals);

  const prevWeekStart = addDays(weekStart, -7);
  const caPrevWeek = sumCA(db.rentals.filter((r) => r.date >= prevWeekStart && r.date < weekStart));
  const evolWeek = caPrevWeek ? Math.round(((caWeek - caPrevWeek) / caPrevWeek) * 100) : 0;

  const repartition = db.categories
    .map((cat) => ({
      label: cat.nom,
      icone: cat.icone,
      value: sumCA(
        db.rentals.filter((r) => {
          const v = vehicleOf(db, r.vehiculeId);
          return v && v.categorieId === cat.id;
        }),
      ),
    }))
    .filter((c) => c.value > 0);

  const caParVehicule = db.vehicles
    .map((v) => ({ nom: v.nom, ca: sumCA(db.rentals.filter((r) => r.vehiculeId === v.id)) }))
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 6);

  const employeeRows = db.users
    .map((u) => {
      const rentals = db.rentals.filter((r) => r.employeId === u.id && r.statut !== 'Annulée');
      const ca = sumCA(rentals);
      return { user: u, locations: rentals.length, ca, revenu: Math.round(ca * 0.2) };
    })
    .sort((a, b) => b.ca - a.ca);

  const PIE_COLORS = [THEME.gold, THEME.goldLight, '#8FC1F5', '#4CDB9B'];

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Entreprise"
        title="Base de données"
        subtitle="Vue centralisée du chiffre d'affaires et des informations administratives."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="CA cette semaine"
          value={formatCurrency(caWeek)}
          icon={<DollarSign size={17} />}
          highlight
          sub={
            <span
              style={{
                color: evolWeek >= 0 ? THEME.success : THEME.error,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {evolWeek >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {Math.abs(evolWeek)}% vs semaine précédente
            </span>
          }
        />
        <StatCard label="CA ce mois" value={formatCurrency(caMonth)} icon={<TrendingUp size={17} />} />
        <StatCard label="CA total" value={formatCurrency(caTotal)} icon={<Award size={17} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, marginBottom: 28 }}>
        <div className="sam-card" style={{ padding: 22 }}>
          <h3 className="sam-display" style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>
            CA par activité
          </h3>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={repartition}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="46%"
                innerRadius={48}
                outerRadius={76}
                paddingAngle={3}
              >
                {repartition.map((r, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11.5, color: THEME.textMuted }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="sam-card" style={{ padding: 22 }}>
          <h3 className="sam-display" style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>
            CA par véhicule (top 6)
          </h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={caParVehicule} layout="vertical" margin={{ left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: THEME.textMuted, fontSize: 10.5 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => '$' + v}
              />
              <YAxis
                type="category"
                dataKey="nom"
                tick={{ fill: THEME.text, fontSize: 11.5 }}
                axisLine={false}
                tickLine={false}
                width={92}
              />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="ca" fill={THEME.gold} radius={[0, 5, 5, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>
        Registre des employés
      </h3>
      <div className="sam-table-wrap sam-card">
        <table className="sam-table">
          <thead>
            <tr>
              <th></th>
              <th>Employé</th>
              <th>IBAN</th>
              <th>Téléphone</th>
              <th>Date d'entrée</th>
              <th>Locations</th>
              <th>CA généré</th>
              <th>Revenu</th>
            </tr>
          </thead>
          <tbody>
            {employeeRows.map((row) => (
              <tr key={row.user.id} style={{ cursor: 'pointer' }} onClick={() => setDetailUser(row.user)}>
                <td>
                  <Avatar name={fullName(row.user)} photo={row.user.photo} size={34} />
                </td>
                <td style={{ fontWeight: 700 }}>{fullName(row.user)}</td>
                <td style={{ color: THEME.textMuted, fontFamily: 'monospace', fontSize: 12 }}>
                  {isAdmin ? row.user.iban : '•••• •••• ••••'}
                </td>
                <td style={{ color: THEME.textMuted }}>{row.user.telephone}</td>
                <td>{formatDate(row.user.dateEntree)}</td>
                <td>{row.locations}</td>
                <td style={{ fontWeight: 700 }}>{formatCurrency(row.ca)}</td>
                <td style={{ color: THEME.goldLight, fontWeight: 700 }}>{formatCurrency(row.revenu)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 10 }}>
        Le revenu est calculé indicativement à 20% du chiffre d'affaires généré par l'employé.
      </p>

      <Modal
        open={!!detailUser}
        onClose={() => setDetailUser(null)}
        title={detailUser ? fullName(detailUser) : ''}
        width={380}
      >
        {detailUser && (
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
              <Avatar name={fullName(detailUser)} photo={detailUser.photo} size={54} />
              <div>
                <div style={{ fontWeight: 700 }}>{fullName(detailUser)}</div>
                <div style={{ fontSize: 12.5, color: THEME.gold }}>
                  {detailUser.role === 'admin' ? 'Administrateur' : 'Employé(e)'}
                </div>
              </div>
            </div>
            {[
              ['Téléphone', detailUser.telephone],
              ['E-mail', detailUser.email],
              ["Date d'entrée", formatDate(detailUser.dateEntree)],
            ].map(([l, v]) => (
              <div
                key={l}
                className="flex justify-between"
                style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 }}
              >
                <span style={{ color: THEME.textMuted }}>{l}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
