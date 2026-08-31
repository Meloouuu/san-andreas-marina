import { useState, useMemo } from 'react';
import { Calendar, DollarSign, ClipboardList, FileText, Anchor, ShieldCheck, Trophy, TrendingDown, Receipt } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { THEME, LOGO } from '../theme';
import { formatCurrency, fullName } from '../lib/utils';
import { computeEmployeeStats, computeDashboardStats, financeByPeriod, locationsPerDay, CHART_TOOLTIP_STYLE } from '../lib/stats';
import { Avatar, StatCard, GoldPodium } from '../components/ui';

/* ============================================================
   PAGE ACCUEIL (DASHBOARD)
   ============================================================ */

export function DashboardPage({ db, session, navigate }) {
  const [caPeriod, setCaPeriod] = useState('semaine');
  const stats = useMemo(() => computeDashboardStats(db), [db]);
  const employeeStats = useMemo(() => computeEmployeeStats(db).slice(0, 5), [db]);
  const caData = useMemo(() => financeByPeriod(db, caPeriod), [db, caPeriod]);
  const locData = useMemo(() => locationsPerDay(db.rentals, 10), [db]);
  const permitData = useMemo(
    () => [
      { label: 'Bateau', value: db.permits.filter((p) => p.type === 'Bateau').length },
      { label: 'Hélicoptère', value: db.permits.filter((p) => p.type === 'Hélicoptère').length },
    ],
    [db],
  );
  const empCompareData = useMemo(
    () =>
      computeEmployeeStats(db)
        .slice(0, 6)
        .map((e) => ({ label: e.user.prenom, ca: e.ca, locations: e.locations })),
    [db],
  );

  return (
    <div className="sam-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-6" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="sam-display" style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            Bonjour, {session.prenom} 👋
          </h1>
          <p style={{ color: THEME.textMuted, fontSize: 15, margin: '8px 0 0' }}>
            Bienvenue dans votre espace San Andreas Marina.
          </p>
        </div>
        <img
          src={LOGO}
          alt="San Andreas Marina"
          style={{ width: 64, height: 64, objectFit: 'contain', opacity: 0.92 }}
        />
      </div>

      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Locations cette semaine"
          value={stats.locationsWeek}
          icon={<ClipboardList size={18} />}
          highlight
        />
        <StatCard
          label="Chiffre d'affaires"
          value={formatCurrency(stats.caWeek)}
          icon={<DollarSign size={18} />}
          highlight
        />
        <StatCard
          label="Dépenses cette semaine"
          value={formatCurrency(stats.depensesWeek)}
          icon={<TrendingDown size={18} />}
        />
        <StatCard
          label="Bénéfice net"
          value={formatCurrency(stats.beneficeWeek)}
          icon={<Receipt size={18} />}
          sub={stats.beneficeWeek < 0 ? 'Semaine déficitaire' : "Chiffre d'affaires moins dépenses"}
          highlight
        />
        <StatCard label="Véhicules disponibles" value={stats.vehiculesDispo} icon={<Anchor size={18} />} />
        <StatCard
          label="Réservations à venir"
          value={stats.reservationsAVenir}
          icon={<Calendar size={18} />}
        />
        <StatCard label="Permis délivrés" value={stats.permisDelivres} icon={<ShieldCheck size={18} />} />
        <StatCard
          label="Formations réalisées"
          value={stats.formationsRealisees}
          icon={<FileText size={18} />}
        />
      </div>

      <div
        className="grid"
        style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}
      >
        <div className="sam-card" style={{ padding: 22, minWidth: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 14 }}>
            <h3 className="sam-display" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              Chiffre d'affaires et dépenses
            </h3>
            <div
              className="flex gap-1"
              style={{
                background: 'rgba(7,21,37,0.5)',
                padding: 4,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: 'inset 0 2px 8px rgba(2,8,16,0.45)',
              }}
            >
              {['semaine', 'mois', 'annee'].map((p) => (
                <div
                  key={p}
                  className={`sam-tab ${caPeriod === p ? 'active' : ''}`}
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => setCaPeriod(p)}
                >
                  {p === 'semaine' ? 'Semaine' : p === 'mois' ? 'Mois' : 'Année'}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={caData}>
              <defs>
                <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={THEME.gold} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={THEME.gold} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={THEME.error} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={THEME.error} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: THEME.textMuted, fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
                interval={caPeriod === 'mois' ? 3 : 0}
              />
              <YAxis
                tick={{ fill: THEME.textMuted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => '$' + v}
                width={54}
              />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => formatCurrency(v)} />
              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconType="plainline"
                wrapperStyle={{ fontSize: 12, color: THEME.textMuted }}
              />
              <Area
                type="monotone"
                dataKey="ca"
                name="Chiffre d'affaires"
                stroke={THEME.gold}
                strokeWidth={2}
                fill="url(#caGrad)"
              />
              <Area
                type="monotone"
                dataKey="depenses"
                name="Dépenses"
                stroke={THEME.error}
                strokeWidth={2}
                strokeDasharray="5 4"
                fill="url(#depGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="sam-card" style={{ padding: 22, minWidth: 0 }}>
          <h3 className="sam-display" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>
            Activité des permis
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={permitData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="46%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
              >
                <Cell fill={THEME.gold} />
                <Cell fill={THEME.goldLight} />
              </Pie>
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: THEME.textMuted }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}
      >
        <div className="sam-card" style={{ padding: 22, minWidth: 0 }}>
          <h3 className="sam-display" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>
            Locations par jour
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={locData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: THEME.textMuted, fontSize: 10.5 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: THEME.textMuted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={26}
                allowDecimals={false}
              />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" fill={THEME.gold} radius={[5, 5, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="sam-card" style={{ padding: 22, minWidth: 0 }}>
          <h3 className="sam-display" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>
            Performance employés (CA)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={empCompareData} layout="vertical" margin={{ left: 8 }}>
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
                dataKey="label"
                tick={{ fill: THEME.text, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="ca" fill={THEME.goldLight} radius={[0, 5, 5, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="sam-card" style={{ padding: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
          <div>
            <h3 className="sam-display" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              Performance de l'équipe
            </h3>
            <p style={{ color: THEME.textMuted, fontSize: 13, margin: '4px 0 0' }}>
              Classement basé sur le chiffre d'affaires généré.
            </p>
          </div>
          <Trophy size={22} color={THEME.gold} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {employeeStats.map((e, i) => (
            <div
              key={e.user.id}
              className="flex items-center gap-4 flex-wrap"
              style={{
                padding: '14px 16px',
                borderRadius: 16,
                background:
                  i === 0
                    ? 'linear-gradient(90deg, rgba(212,167,44,0.16), rgba(212,167,44,0.02))'
                    : 'rgba(255,255,255,0.02)',
                border: i === 0 ? `1px solid rgba(212,167,44,0.4)` : `1px solid rgba(255,255,255,0.05)`,
              }}
            >
              <GoldPodium rank={i} />
              <Avatar name={fullName(e.user)} photo={e.user.photo} size={40} />
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: THEME.text }}>{fullName(e.user)}</div>
                <div style={{ fontSize: 12, color: THEME.textMuted }}>
                  {e.user.role === 'admin' ? 'Administrateur' : 'Employé(e)'}
                </div>
              </div>
              <div className="flex gap-5 flex-wrap" style={{ fontSize: 13 }}>
                <div>
                  <span style={{ color: THEME.textMuted }}>Locations </span>
                  <b style={{ color: THEME.text }}>{e.locations}</b>
                </div>
                <div>
                  <span style={{ color: THEME.textMuted }}>CA </span>
                  <b style={{ color: THEME.goldLight }}>{formatCurrency(e.ca)}</b>
                </div>
                <div>
                  <span style={{ color: THEME.textMuted }}>Permis </span>
                  <b style={{ color: THEME.text }}>{e.permis}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
