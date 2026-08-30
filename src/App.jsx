import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Menu,
  X,
  Search,
  Plus,
  Bell,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Filter,
  Phone,
  Clock,
  Eye,
  EyeOff,
  User,
  LogOut,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Calendar,
  Mail,
  Star,
  Wrench,
  TrendingUp,
  DollarSign,
  Award,
  Users as UsersIcon,
  ClipboardList,
  FileText,
  MoreVertical,
  Home,
  Anchor,
  Database as DatabaseIcon,
  History as HistoryIcon,
  CreditCard,
  ShieldCheck,
  LayoutGrid,
  List as ListIcon,
  Info,
  Trophy,
  Fingerprint,
  MapPinned,
  RefreshCw,
  Ship,
  CalendarDays,
  Camera,
  Upload,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

/* ============================================================
   SAN ANDREAS MARINA — Logiciel de gestion interne
   ============================================================ */

import { THEME, SESSION_KEY, LOGO } from './theme';

/* ============================================================
   UTILITAIRES
   ============================================================ */

import { uid, pad, isoDate, todayISO, formatDate, formatDateTime, formatCurrency, formatCurrencyPrecise, weekdayLabel, monthLabel, startOfWeek, addDays, initials, fullName, statusTone } from './lib/utils';
import {
  nextVehicleId, nextCitizenId, nextRentalNumber, nextPermitNumber,
  inRange, sumCA, computeEmployeeStats, computeDashboardStats, caByPeriod, locationsPerDay,
  categoryOf, vehicleOf, userOf, citizenOf, parseDuree, vehicleStats,
  checkAvailability, citizenRentals, citizenPermits, citizenLastActivity,
} from './lib/stats';
import { sessionStore } from './lib/sessionStore';
import {
  GlobalStyles, WaveDivider, Badge, Avatar, StatCard, PageHeader, Modal, ConfirmDialog,
  ToastStack, MobileToasts, SearchInput, Select, FieldRow, DocCheck, EmptyState, GoldPodium,
} from './components/ui';
import { NAV_SECTIONS, Sidebar, MobileTopBar, MobileDrawer, NotificationBell } from './components/layout';
import { LoginPage } from './pages/LoginPage';

/* ============================================================
   PAGE ACCUEIL (DASHBOARD)
   ============================================================ */

function DashboardPage({ db, session, navigate }) {
  const [caPeriod, setCaPeriod] = useState('semaine');
  const stats = useMemo(() => computeDashboardStats(db), [db]);
  const employeeStats = useMemo(() => computeEmployeeStats(db).slice(0, 5), [db]);
  const caData = useMemo(() => caByPeriod(db.rentals, caPeriod), [db, caPeriod]);
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
              Évolution du chiffre d'affaires
            </h3>
            <div className="flex gap-1" style={{ background: THEME.bg2, padding: 3, borderRadius: 9 }}>
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
              <Area type="monotone" dataKey="ca" stroke={THEME.gold} strokeWidth={2} fill="url(#caGrad)" />
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
                borderRadius: 12,
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

/* ============================================================
   GARAGE — LISTE DES VÉHICULES
   ============================================================ */


function VehicleCard({ v, cat, rentalsCount, onClick }) {
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

function GaragePage({ db, actions, isAdmin, notify, openVehicle }) {
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

function AddVehicleModal({ open, onClose, db, actions, notify }) {
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

function EditVehicleModal({ open, onClose, vehicle, db, actions, notify }) {
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

function AddMaintenanceModal({ open, onClose, vehicle, db, actions, notify }) {
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
      responsableNom: fullName(userOf(db, form.responsable)),
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

function VehicleDetailPage({ db, actions, isAdmin, session, notify, vehicleId, back }) {
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
              borderRadius: 14,
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
                <p style={{ color: THEME.textMuted, fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
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
              value={`${stats.totalH.toFixed(0)} h`}
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
                      <td>{m.responsableNom || m.responsable}</td>
                      <td style={{ color: THEME.textMuted }}>{m.commentaire}</td>
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
          <div className="flex gap-2" style={{ marginBottom: 18 }}>
            <input
              className="sam-input"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ajouter une note interne..."
              onKeyDown={(e) => e.key === 'Enter' && submitNote()}
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
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: 13.5, color: THEME.text }}>{n.text}</div>
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
        onConfirm={() => {
          actions.deleteVehicle(vehicle.id);
          notify('Véhicule supprimé.', 'success');
          setShowDelete(false);
          back();
        }}
      />
    </div>
  );
}

/* ============================================================
   SUIVI DES LOCATIONS
   ============================================================ */


function AddRentalModal({ open, onClose, db, actions, notify, session, defaultDate }) {
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
                options={['1h', '2h', '3h', '4h', '5h', '6h', '8h'].map((d) => ({ value: d, label: d }))}
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

function RentalsPage({ db, actions, isAdmin, session, notify }) {
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
        onConfirm={() => {
          actions.deleteRental(deleteRental.id);
          notify('Location supprimée.', 'success');
          setDeleteRental(null);
        }}
      />
    </div>
  );
}

/* ============================================================
   PLANNING
   ============================================================ */

function AddProfessionalAppointmentModal({ open, onClose, actions, notify, defaultDate }) {
  const blank = {
    titre: '',
    date: defaultDate || todayISO(),
    heureDebut: '09:00',
    heureFin: '10:00',
    contact: '',
    telephone: '',
    lieu: '',
    notes: '',
    statut: 'Prévu',
  };

  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) {
      setForm({
        ...blank,
        date: defaultDate || todayISO(),
      });
    }
  }, [open, defaultDate]);

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  async function submit(e) {
    e.preventDefault();

    if (!form.titre.trim()) {
      notify('Le titre du rendez-vous est obligatoire.', 'error');
      return;
    }

    await actions.addProfessionalAppointment({
      ...form,
      titre: form.titre.trim(),
      contact: form.contact.trim(),
      telephone: form.telephone.trim(),
      lieu: form.lieu.trim(),
      notes: form.notes.trim(),
    });

    onClose();
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: THEME.input || THEME.card,
    border: `1px solid ${THEME.border}`,
    borderRadius: 8,
    padding: '10px 12px',
    color: THEME.text,
    outline: 'none',
    fontSize: 13,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 600,
    color: THEME.textMuted,
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau rendez-vous professionnel" width={520}>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Objet du rendez-vous *</label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => update('titre', e.target.value)}
              placeholder="Ex : Réunion fournisseur"
              style={inputStyle}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Statut</label>
              <select
                value={form.statut}
                onChange={(e) => update('statut', e.target.value)}
                style={inputStyle}
              >
                <option value="Prévu">Prévu</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Terminé">Terminé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <div>
              <label style={labelStyle}>Heure début</label>
              <input
                type="time"
                value={form.heureDebut}
                onChange={(e) => update('heureDebut', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Heure fin</label>
              <input
                type="time"
                value={form.heureFin}
                onChange={(e) => update('heureFin', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Personne / entreprise</label>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => update('contact', e.target.value)}
              placeholder="Ex : Yamaha France"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="text"
              value={form.telephone}
              onChange={(e) => update('telephone', e.target.value)}
              placeholder="555-0000"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Lieu</label>
            <input
              type="text"
              value={form.lieu}
              onChange={(e) => update('lieu', e.target.value)}
              placeholder="Ex : Bureau principal"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Informations complémentaires..."
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 8,
            }}
          >
            <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
              Annuler
            </button>

            <button type="submit" className="sam-btn sam-btn-gold">
              <Plus size={16} />
              Ajouter le rendez-vous
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function RentalChip({ r, db, onClick }) {
  const v = vehicleOf(db, r.vehiculeId);
  const tone = statusTone(r.statut);
  return (
    <div
      onClick={onClick}
      style={{
        background:
          tone === 'success'
            ? 'rgba(32,199,122,0.12)'
            : tone === 'info'
              ? 'rgba(93,163,240,0.12)'
              : 'rgba(170,183,196,0.1)',
        border: `1px solid ${tone === 'success' ? 'rgba(32,199,122,0.3)' : tone === 'info' ? 'rgba(93,163,240,0.3)' : 'rgba(170,183,196,0.2)'}`,
        borderRadius: 8,
        padding: '7px 9px',
        marginBottom: 6,
        cursor: 'pointer',
        fontSize: 11.5,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: THEME.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {v ? `${categoryOf(db, v.categorieId).icone} ${v.nom}` : '—'}
      </div>
      <div style={{ color: THEME.textMuted, marginTop: 1 }}>{r.client}</div>
      <div style={{ color: THEME.goldLight, marginTop: 1, fontWeight: 600 }}>
        {r.heure} · {r.duree}
      </div>
    </div>
  );
}
function ProfessionalAppointmentChip({ appointment, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(212,167,44,0.10)',
        border: '1px solid rgba(212,167,44,0.30)',
        borderRadius: 8,
        padding: '7px 9px',
        marginBottom: 6,
        cursor: 'pointer',
        fontSize: 11.5,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: THEME.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        💼 {appointment.titre}
      </div>

      {appointment.contact && (
        <div style={{ color: THEME.textMuted, marginTop: 1 }}>{appointment.contact}</div>
      )}

      <div
        style={{
          color: THEME.goldLight,
          marginTop: 1,
          fontWeight: 600,
        }}
      >
        {appointment.heureDebut}
        {appointment.heureFin ? ` → ${appointment.heureFin}` : ''}
      </div>
    </div>
  );
}

function PlanningPage({ db, actions, notify, session }) {
  const [view, setView] = useState('semaine');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showAdd, setShowAdd] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [addDate, setAddDate] = useState(todayISO());
  const [detailRental, setDetailRental] = useState(null);
  const [detailAppointment, setDetailAppointment] = useState(null);

  function openAdd(date) {
    setAddDate(date);
    setShowAdd(true);
  }

  function shift(n) {
    if (view === 'jour') setSelectedDate(addDays(selectedDate, n));
    else if (view === 'semaine') setSelectedDate(addDays(selectedDate, n * 7));
    else {
      const d = new Date(selectedDate + 'T12:00:00');
      d.setMonth(d.getMonth() + n);
      setSelectedDate(d.toISOString().slice(0, 10));
    }
  }

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const monthDate = new Date(selectedDate + 'T12:00:00');
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthGridStart = startOfWeek(monthStart.toISOString().slice(0, 10));
  const monthDays = Array.from({ length: 42 }, (_, i) => addDays(monthGridStart, i));

  const rentalsByDate = (d) =>
    db.rentals
      .filter((r) => r.date === d && r.statut !== 'Annulée' && r.statut !== 'Terminée')
      .sort((a, b) => a.heure.localeCompare(b.heure));
  const appointmentsByDate = (d) =>
    (db.professionalAppointments || [])
      .filter((a) => a.date === d && a.statut !== 'Annulé' && a.statut !== 'Terminé')
      .sort((a, b) => (a.heureDebut || '').localeCompare(a.heureDebut || ''));

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Location"
        title="Planning"
        subtitle="Visualisez et organisez les réservations de la flotte."
        action={
          <div className="flex gap-2 flex-wrap">
            <button className="sam-btn sam-btn-gold" onClick={() => openAdd(selectedDate)}>
              <Plus size={16} /> Nouvelle réservation
            </button>

            <button
              className="sam-btn sam-btn-ghost"
              onClick={() => {
                setAddDate(selectedDate);
                setShowAddAppointment(true);
              }}
            >
              <Calendar size={16} /> Nouveau RDV pro
            </button>
          </div>
        }
      />

      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 20 }}>
        <div
          className="flex gap-1"
          style={{
            background: THEME.card,
            padding: 4,
            borderRadius: 10,
            border: `1px solid ${THEME.border}`,
          }}
        >
          {[
            ['jour', 'Jour'],
            ['semaine', 'Semaine'],
            ['mois', 'Mois'],
          ].map(([id, label]) => (
            <div key={id} className={`sam-tab ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
              {label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={() => shift(-1)}>
            <ChevronLeft size={15} />
          </button>
          <span
            className="sam-display"
            style={{ fontWeight: 700, fontSize: 15, minWidth: 160, textAlign: 'center' }}
          >
            {view === 'jour' && `${weekdayLabel(selectedDate)} ${formatDate(selectedDate)}`}
            {view === 'semaine' && `${formatDate(weekStart)} — ${formatDate(addDays(weekStart, 6))}`}
            {view === 'mois' && monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
          <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={() => shift(1)}>
            <ChevronRight size={15} />
          </button>
          <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={() => setSelectedDate(todayISO())}>
            Aujourd'hui
          </button>
        </div>
      </div>

      {view === 'semaine' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
            gap: 10,
            overflowX: 'auto',
          }}
        >
          {weekDays.map((d) => (
            <div
              key={d}
              className="sam-card"
              style={{
                padding: 10,
                minHeight: 220,
                background: d === todayISO() ? 'rgba(212,167,44,0.05)' : THEME.card,
                border: d === todayISO() ? '1px solid rgba(212,167,44,0.35)' : `1px solid ${THEME.border}`,
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: THEME.textMuted,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {weekdayLabel(d)}
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: d === todayISO() ? THEME.goldLight : THEME.text,
                    }}
                  >
                    {d.slice(8, 10)}
                  </div>
                </div>

                <button
                  onClick={() => openAdd(d)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: THEME.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* LOCATIONS */}
              {rentalsByDate(d).map((r) => (
                <RentalChip key={r.id} r={r} db={db} onClick={() => setDetailRental(r)} />
              ))}

              {/* RDV PROFESSIONNELS */}
              {appointmentsByDate(d).map((a) => (
                <ProfessionalAppointmentChip
                  key={a.id}
                  appointment={a}
                  onClick={() => setDetailAppointment(a)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {view === 'jour' && (
        <div className="sam-card" style={{ padding: 20 }}>
          {rentalsByDate(selectedDate).length === 0 && appointmentsByDate(selectedDate).length === 0 ? (
            <EmptyState icon={<Calendar size={34} />} text="Aucun événement ce jour-là" />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* LOCATIONS */}
              {rentalsByDate(selectedDate).map((r) => {
                const v = vehicleOf(db, r.vehiculeId);

                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 flex-wrap"
                    style={{
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${THEME.border}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => setDetailRental(r)}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: THEME.goldLight,
                        minWidth: 64,
                      }}
                    >
                      {r.heure}
                    </div>

                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 700 }}>
                        {v ? `${categoryOf(db, v.categorieId).icone} ${v.nom}` : '—'}
                      </div>

                      <div
                        style={{
                          fontSize: 12.5,
                          color: THEME.textMuted,
                        }}
                      >
                        {r.client} · {r.duree}
                      </div>
                    </div>

                    <Badge status={r.statut} />
                  </div>
                );
              })}

              {/* RDV PROFESSIONNELS */}
              {appointmentsByDate(selectedDate).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-4 flex-wrap"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: 'rgba(212,167,44,0.06)',
                    border: '1px solid rgba(212,167,44,0.25)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setDetailAppointment(a)}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: THEME.goldLight,
                      minWidth: 80,
                    }}
                  >
                    {a.heureDebut}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 140,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>💼 {a.titre}</div>

                    <div
                      style={{
                        fontSize: 12.5,
                        color: THEME.textMuted,
                      }}
                    >
                      {a.contact || 'Rendez-vous professionnel'}

                      {a.heureFin && ` · jusqu'à ${a.heureFin}`}
                    </div>

                    {a.lieu && (
                      <div
                        style={{
                          fontSize: 12,
                          color: THEME.textMuted,
                          marginTop: 2,
                        }}
                      >
                        📍 {a.lieu}
                      </div>
                    )}
                  </div>

                  <Badge status={a.statut} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'mois' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 6,
              marginBottom: 6,
            }}
          >
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  color: THEME.textMuted,
                  fontWeight: 700,
                  padding: 4,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 6,
            }}
          >
            {monthDays.map((d) => {
              const rentalCount = rentalsByDate(d).length;
              const appointmentCount = appointmentsByDate(d).length;
              const count = rentalCount + appointmentCount;

              const inMonth = new Date(d + 'T12:00:00').getMonth() === monthDate.getMonth();

              return (
                <div
                  key={d}
                  onClick={() => {
                    setSelectedDate(d);
                    setView('jour');
                  }}
                  className="sam-card sam-card-hover"
                  style={{
                    padding: 8,
                    minHeight: 64,
                    cursor: 'pointer',
                    opacity: inMonth ? 1 : 0.35,
                    border: d === todayISO() ? '1px solid rgba(212,167,44,0.5)' : `1px solid ${THEME.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: d === todayISO() ? THEME.goldLight : THEME.text,
                    }}
                  >
                    {d.slice(8, 10)}
                  </div>

                  {count > 0 && (
                    <div
                      className="sam-badge sam-badge-gold"
                      style={{
                        marginTop: 6,
                        fontSize: 10,
                        padding: '2px 7px',
                      }}
                    >
                      {rentalCount > 0 && `${rentalCount} résa.`}

                      {rentalCount > 0 && appointmentCount > 0 && ' · '}

                      {appointmentCount > 0 && `${appointmentCount} RDV`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {session?.role === 'admin' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 18,
            paddingTop: 14,
            borderTop: `1px solid ${THEME.border}`,
          }}
        >
          <button
            className="sam-btn sam-btn-ghost"
            onClick={() => {
              setEditAppointment(detailAppointment);
              setDetailAppointment(null);
            }}
          >
            ✏️ Modifier
          </button>

          <button
            className="sam-btn sam-btn-danger"
            onClick={async () => {
              if (!window.confirm('Voulez-vous vraiment supprimer ce rendez-vous professionnel ?')) {
                return;
              }

              await actions.deleteProfessionalAppointment(detailAppointment.id);

              setDetailAppointment(null);
            }}
          >
            🗑️ Supprimer
          </button>
        </div>
      )}

      <AddRentalModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        db={db}
        actions={actions}
        notify={notify}
        session={session}
        defaultDate={addDate}
      />
      <AddProfessionalAppointmentModal
        open={showAddAppointment}
        onClose={() => setShowAddAppointment(false)}
        actions={actions}
        notify={notify}
        defaultDate={addDate}
      />

      <Modal
        open={!!detailRental}
        onClose={() => setDetailRental(null)}
        title="Détail de la réservation"
        width={400}
      >
        {detailRental && (
          <div style={{ fontSize: 14 }}>
            <div
              className="flex justify-between"
              style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span style={{ color: THEME.textMuted }}>Véhicule</span>
              <b>{(vehicleOf(db, detailRental.vehiculeId) || {}).nom}</b>
            </div>
            <div
              className="flex justify-between"
              style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span style={{ color: THEME.textMuted }}>Client</span>
              <b>{detailRental.client}</b>
            </div>
            <div
              className="flex justify-between"
              style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span style={{ color: THEME.textMuted }}>Employé</span>
              <b>{fullName(userOf(db, detailRental.employeId))}</b>
            </div>
            <div
              className="flex justify-between"
              style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span style={{ color: THEME.textMuted }}>Créneau</span>
              <b>
                {formatDate(detailRental.date)} à {detailRental.heure} ({detailRental.duree})
              </b>
            </div>
            <div className="flex justify-between" style={{ padding: '8px 0' }}>
              <span style={{ color: THEME.textMuted }}>Statut</span>
              <Badge status={detailRental.statut} />
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={!!detailAppointment}
        onClose={() => setDetailAppointment(null)}
        title="Détail du rendez-vous professionnel"
        width={420}
      >
        {detailAppointment && (
          <div style={{ fontSize: 14 }}>
            <div
              className="flex justify-between"
              style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: THEME.textMuted }}>Objet</span>
              <b>{detailAppointment.titre || '—'}</b>
            </div>

            <div
              className="flex justify-between"
              style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: THEME.textMuted }}>Date</span>
              <b>{formatDate(detailAppointment.date)}</b>
            </div>

            <div
              className="flex justify-between"
              style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: THEME.textMuted }}>Horaire</span>
              <b>
                {detailAppointment.heureDebut || '—'}
                {detailAppointment.heureFin ? ` → ${detailAppointment.heureFin}` : ''}
              </b>
            </div>

            <div
              className="flex justify-between"
              style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: THEME.textMuted }}>Contact</span>
              <b>{detailAppointment.contact || '—'}</b>
            </div>

            <div
              className="flex justify-between"
              style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: THEME.textMuted }}>Téléphone</span>
              <b>{detailAppointment.telephone || '—'}</b>
            </div>

            <div
              className="flex justify-between"
              style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: THEME.textMuted }}>Lieu</span>
              <b>{detailAppointment.lieu || '—'}</b>
            </div>

            {detailAppointment.notes && (
              <div
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    color: THEME.textMuted,
                    marginBottom: 5,
                  }}
                >
                  Notes
                </div>

                <div>{detailAppointment.notes}</div>
              </div>
            )}

            <div
              className="flex justify-between"
              style={{
                padding: '8px 0',
              }}
            >
              <span style={{ color: THEME.textMuted }}>Statut</span>

              <Badge status={detailAppointment.statut} />
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 18,
                paddingTop: 14,
                borderTop: `1px solid ${THEME.border}`,
              }}
            >
              <button
                className="sam-btn sam-btn-ghost"
                onClick={() => {
                  setEditAppointment(detailAppointment);
                  setDetailAppointment(null);
                }}
              >
                ✏️ Modifier
              </button>

              <button
                className="sam-btn"
                style={{
                  color: '#ff6b6b',
                  borderColor: 'rgba(255,107,107,0.3)',
                }}
                onClick={async () => {
                  if (!window.confirm('Voulez-vous vraiment supprimer ce rendez-vous professionnel ?')) {
                    return;
                  }

                  await actions.deleteProfessionalAppointment(detailAppointment.id);

                  setDetailAppointment(null);
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   PERMIS & FORMATIONS
   ============================================================ */

function AddCandidateModal({ open, onClose, db, actions, notify }) {
  const blank = () => ({
    mode: 'new',
    citizenId: db.citizens[0] ? db.citizens[0].id : '',
    prenom: '',
    nom: '',
    telephone: '',
    typePermis: 'Bateau',
    formateur: db.users[0] ? db.users[0].id : '',
  });
  const [form, setForm] = useState(blank());
  useEffect(() => {
    if (open) setForm(blank());
  }, [open]);

  function submit() {
    let citizenId = form.citizenId;
    if (form.mode === 'new') {
      if (!form.prenom.trim() || !form.nom.trim()) {
        notify('Veuillez indiquer le prénom et le nom du citoyen.', 'error');
        return;
      }
      const identifiant = nextCitizenId(db.citizens);
      const newCitizen = {
        id: uid('c'),
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        telephone: form.telephone,
        identifiant,
        photo: '',
        dateCreation: todayISO(),
      };
      actions.addCitizen(newCitizen);
      citizenId = newCitizen.id;
    }
    actions.addPermitDossier({
      id: uid('p'),
      citizenId,
      type: form.typePermis,
      formateurId: form.formateur,
      date: todayISO(),
      statut: 'En attente',
    });
    notify('Dossier candidat créé.', 'success');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouveau candidat"
      subtitle="Créer un dossier permis pour un citoyen."
    >
      <div>
        <div className="flex gap-2" style={{ marginBottom: 14 }}>
          <div
            className={`sam-tab ${form.mode === 'new' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, mode: 'new' })}
          >
            Nouveau citoyen
          </div>
          <div
            className={`sam-tab ${form.mode === 'existing' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, mode: 'existing' })}
          >
            Citoyen existant
          </div>
        </div>

        {form.mode === 'new' ? (
          <>
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
            <FieldRow label="Numéro de téléphone">
              <input
                className="sam-input"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="555-0000"
              />
            </FieldRow>
          </>
        ) : (
          <FieldRow label="Citoyen">
            <Select
              value={form.citizenId}
              onChange={(v) => setForm({ ...form, citizenId: v })}
              options={db.citizens.map((c) => ({ value: c.id, label: `${fullName(c)} (${c.identifiant})` }))}
            />
          </FieldRow>
        )}

        <div className="flex gap-3">
          <div style={{ flex: 1 }}>
            <FieldRow label="Type de permis demandé">
              <Select
                value={form.typePermis}
                onChange={(v) => setForm({ ...form, typePermis: v })}
                options={[
                  { value: 'Bateau', label: '🚤 Permis bateau' },
                  { value: 'Hélicoptère', label: '🚁 Permis hélicoptère' },
                ]}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1 }}>
            <FieldRow label="Formateur">
              <Select
                value={form.formateur}
                onChange={(v) => setForm({ ...form, formateur: v })}
                options={db.users.map((u) => ({ value: u.id, label: fullName(u) }))}
              />
            </FieldRow>
          </div>
        </div>
        <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: -4 }}>
          Date de création du dossier : {formatDate(todayISO())}
        </p>

        <div className="flex justify-end gap-3" style={{ marginTop: 10 }}>
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" onClick={submit} className="sam-btn sam-btn-gold">
            <Plus size={15} /> Créer le dossier
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ProcessPermitModal({ open, onClose, permit, db, actions, notify }) {
  if (!permit) return null;
  function decide(statut) {
    if (statut === 'Valide') {
      const numero = nextPermitNumber(db.permits, permit.type, 470);
      actions.updatePermit(permit.id, { statut: 'Valide', numero, date: todayISO() });
      notify(`✓ Permis délivré — ${numero}`, 'success');
    } else {
      actions.updatePermit(permit.id, { statut: 'Refusé' });
      notify('Dossier marqué comme refusé.', 'warn');
    }
    onClose();
  }
  const citizen = citizenOf(db, permit.citizenId);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Traiter le dossier"
      subtitle={citizen ? fullName(citizen) : ''}
    >
      <div style={{ fontSize: 13.5, color: THEME.textMuted, marginBottom: 18 }}>
        Type :{' '}
        <b style={{ color: THEME.text }}>
          {permit.type === 'Bateau' ? '🚤 Permis bateau' : '🚁 Permis hélicoptère'}
        </b>
        <br />
        Formateur : <b style={{ color: THEME.text }}>{fullName(userOf(db, permit.formateurId))}</b>
      </div>
      <div className="flex gap-3">
        <button className="sam-btn sam-btn-danger" style={{ flex: 1 }} onClick={() => decide('Refusé')}>
          Refuser
        </button>
        <button className="sam-btn sam-btn-gold" style={{ flex: 1 }} onClick={() => decide('Valide')}>
          <ShieldCheck size={15} /> Valider &amp; délivrer
        </button>
      </div>
    </Modal>
  );
}

function PermitsPage({ db, actions, isAdmin, notify, openCitizen }) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processPermit, setProcessPermit] = useState(null);

  const weekStart = startOfWeek(todayISO());
  const stats = {
    bateau: db.permits.filter((p) => p.type === 'Bateau' && p.statut === 'Valide').length,
    helico: db.permits.filter((p) => p.type === 'Hélicoptère' && p.statut === 'Valide').length,
    formations: db.permits.length,
    tauxReussite: db.permits.length
      ? Math.round(
          (db.permits.filter((p) => p.statut === 'Valide').length /
            db.permits.filter((p) => p.statut !== 'En attente').length || 1) * 100,
        )
      : 0,
    cetteSemaine: db.permits.filter((p) => p.statut === 'Valide' && p.date >= weekStart).length,
  };

  const activityData = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = isoDate(-i);
      out.push({
        label: weekdayLabel(d),
        bateau: db.permits.filter((p) => p.date === d && p.type === 'Bateau').length,
        helico: db.permits.filter((p) => p.date === d && p.type === 'Hélicoptère').length,
      });
    }
    return out;
  }, [db]);

  const rows = db.permits
    .filter((p) => typeFilter === 'all' || p.type === typeFilter)
    .filter((p) => statusFilter === 'all' || p.statut === statusFilter)
    .filter((p) => {
      const c = citizenOf(db, p.citizenId);
      return (
        !search ||
        (c && fullName(c).toLowerCase().includes(search.toLowerCase())) ||
        (p.numero || '').toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Permis"
        title="Permis & Formations"
        subtitle="Gestion des permis bateau et hélicoptère délivrés aux citoyens."
        action={
          <button className="sam-btn sam-btn-gold" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Nouveau candidat
          </button>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Permis bateau délivrés" value={stats.bateau} icon={<span>🚤</span>} highlight />
        <StatCard label="Permis hélico délivrés" value={stats.helico} icon={<span>🚁</span>} highlight />
        <StatCard label="Formations réalisées" value={stats.formations} icon={<FileText size={16} />} />
        <StatCard label="Taux de réussite" value={`${stats.tauxReussite}%`} icon={<TrendingUp size={16} />} />
        <StatCard label="Délivrés cette semaine" value={stats.cetteSemaine} icon={<Calendar size={16} />} />
      </div>

      <div className="sam-card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 className="sam-display" style={{ fontSize: 15.5, fontWeight: 700, margin: '0 0 12px' }}>
          Activité de la semaine
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: THEME.textMuted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: THEME.textMuted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={22}
              allowDecimals={false}
            />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11.5 }} />
            <Bar dataKey="bateau" name="Bateau" fill={THEME.gold} radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar
              dataKey="helico"
              name="Hélicoptère"
              fill={THEME.goldLight}
              radius={[4, 4, 0, 0]}
              maxBarSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>
        Registre des permis
      </h3>
      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Citoyen ou n° de permis..." />
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
            { value: 'Valide', label: '🟢 Valide' },
            { value: 'En attente', label: '🟠 En attente' },
            { value: 'Refusé', label: '🔴 Refusé' },
            { value: 'Annulé', label: '⚫ Annulé' },
          ]}
          style={{ width: 170 }}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<span style={{ fontSize: 34 }}>🪪</span>} text="Aucun dossier trouvé" />
      ) : (
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const c = citizenOf(db, p.citizenId);
                return (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{p.numero || '—'}</td>
                    <td
                      style={{ cursor: 'pointer', color: THEME.goldLight }}
                      onClick={() => c && openCitizen(c.id)}
                    >
                      {c ? fullName(c) : '—'}
                    </td>
                    <td>{p.type === 'Bateau' ? '🚤 Bateau' : '🚁 Hélicoptère'}</td>
                    <td>{fullName(userOf(db, p.formateurId))}</td>
                    <td>{formatDate(p.date)}</td>
                    <td>
                      <Badge status={p.statut} />
                    </td>
                    <td>
                      {p.statut === 'En attente' && (
                        <button
                          className="sam-btn sam-btn-gold sam-btn-sm"
                          onClick={() => setProcessPermit(p)}
                        >
                          Traiter
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddCandidateModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        db={db}
        actions={actions}
        notify={notify}
      />
      <ProcessPermitModal
        open={!!processPermit}
        onClose={() => setProcessPermit(null)}
        permit={processPermit}
        db={db}
        actions={actions}
        notify={notify}
      />
    </div>
  );
}

/* ============================================================
   CITOYENS / CLIENTS
   ============================================================ */


function CitizensPage({ db, notify, openCitizen }) {
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

function CitizenDetailPage({ db, citizenId, back }) {
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

      <div className="flex items-center gap-4 flex-wrap" style={{ marginBottom: 26 }}>
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
    </div>
  );
}

/* ============================================================
   BASE DE DONNÉES (FINANCES)
   ============================================================ */

function DatabasePage({ db, isAdmin }) {
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

/* ============================================================
   HISTORIQUE
   ============================================================ */

function HistoryPage({ db }) {
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

/* ============================================================
   PROFIL UTILISATEUR
   ============================================================ */

function InfoRow({ label, value, icon }) {
  return (
    <div className="sam-info-row">
      <span className="sam-info-label">
        {icon}
        {label}
      </span>
      <span className="sam-info-value">{value || '—'}</span>
    </div>
  );
}

function DocToggle({ label, done, doneText, missingText, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className={`sam-doc-toggle ${done ? 'ok' : 'ko'}`}>
      <span className={`sam-checkbox ${done ? 'checked' : 'missing'}`}>
        {done && <Check size={13} color="#071525" strokeWidth={3} />}
      </span>
      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: THEME.text }}>{label}</span>
        <span
          style={{
            display: 'block',
            fontSize: 12,
            color: done ? THEME.success : THEME.textMuted,
            marginTop: 2,
          }}
        >
          {done ? doneText : missingText}
        </span>
      </span>
      <span style={{ fontSize: 11.5, color: THEME.textMuted, whiteSpace: 'nowrap' }}>Modifier</span>
    </button>
  );
}

function ProfilePage({ session, db, actions, notify }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const stats = computeEmployeeStats(db).find((e) => e.user.id === session.id) || {
    locations: 0,
    ca: 0,
    permis: 0,
  };

  function choosePhoto() {
    if (fileRef.current) fileRef.current.click();
  }

  /* L'image est redimensionnée en 256x256 avant d'être enregistrée :
     une photo brute dépasserait vite la capacité du stockage du navigateur. */
  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      notify('Veuillez choisir un fichier image (JPG, PNG...).', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify('Image trop lourde : 8 Mo maximum.', 'error');
      return;
    }
    setBusy(true);
    const reader = new window.FileReader();
    reader.onerror = () => {
      setBusy(false);
      notify('Lecture du fichier impossible.', 'error');
    };
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => {
        setBusy(false);
        notify('Cette image est illisible.', 'error');
      };
      img.onload = () => {
        try {
          const SIZE = 256;
          const canvas = document.createElement('canvas');
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
          actions.updateUser(session.id, { photo: canvas.toDataURL('image/jpeg', 0.82) });
          notify('Photo de profil mise à jour.', 'success');
        } catch (err) {
          notify('Impossible de traiter cette image.', 'error');
        }
        setBusy(false);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    actions.updateUser(session.id, { photo: '' });
    notify('Photo de profil retirée.', 'info');
  }

  function toggleDoc(field, label) {
    const next = !session[field];
    actions.updateUser(session.id, { [field]: next });
    notify(next ? label + ' validé.' : label + ' marqué comme manquant.', next ? 'success' : 'warn');
  }

  const docsOk = (session.contratSigne ? 1 : 0) + (session.visiteMedicale ? 1 : 0);

  return (
    <div className="sam-fade-in" style={{ maxWidth: 940 }}>
      <PageHeader
        eyebrow="Compte"
        title="Mon profil"
        subtitle="Vos informations personnelles et professionnelles."
      />

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

      <div className="sam-card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden' }}>
        <div
          style={{
            height: 92,
            background: `linear-gradient(120deg, rgba(212,167,44,0.20), rgba(11,31,51,0) 70%), linear-gradient(180deg, ${THEME.bg2}, ${THEME.card})`,
            position: 'relative',
          }}
        >
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 58, opacity: 0.5 }}
          >
            <path
              d="M0,70 C 240,110 480,20 720,70 C 960,120 1200,30 1440,80 L1440,120 L0,120 Z"
              fill="rgba(212,167,44,0.07)"
            />
          </svg>
        </div>

        <div style={{ padding: '0 26px 24px' }}>
          <div className="flex items-end gap-5 flex-wrap" style={{ marginTop: -46 }}>
            <div
              className="sam-avatar-edit"
              onClick={busy ? undefined : choosePhoto}
              title="Changer la photo de profil"
            >
              <Avatar name={fullName(session)} photo={session.photo} size={104} />
              <div className="sam-avatar-overlay">
                <Camera size={22} />
                <span>{busy ? 'Traitement…' : 'Changer'}</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200, paddingBottom: 6 }}>
              <h2 className="sam-display" style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
                {fullName(session)}
              </h2>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 7 }}>
                <span
                  className={`sam-badge ${session.role === 'admin' ? 'sam-badge-gold' : 'sam-badge-info'}`}
                >
                  {session.role === 'admin' ? 'Administrateur' : 'Employé(e)'}
                </span>
                <span className={`sam-badge ${docsOk === 2 ? 'sam-badge-success' : 'sam-badge-warn'}`}>
                  {docsOk}/2 document{docsOk > 1 ? 's' : ''} en règle
                </span>
                <span style={{ fontSize: 12.5, color: THEME.textMuted }}>
                  Dans l'équipe depuis le {formatDate(session.dateEntree)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap" style={{ paddingBottom: 6 }}>
              <button className="sam-btn sam-btn-ghost sam-btn-sm" onClick={choosePhoto} disabled={busy}>
                <Upload size={14} /> {session.photo ? 'Remplacer' : 'Ajouter une photo'}
              </button>
              {session.photo && (
                <button
                  className="sam-btn sam-btn-ghost sam-btn-sm"
                  onClick={removePhoto}
                  disabled={busy}
                  title="Retirer la photo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 18,
          marginBottom: 18,
        }}
      >
        <div className="sam-card" style={{ padding: 24 }}>
          <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>
            Informations personnelles
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '0 0 14px' }}>
            Un administrateur peut modifier ces informations.
          </p>
          <InfoRow label="Sexe" value={session.sexe} icon={<User size={13} />} />
          <InfoRow
            label="Date de naissance"
            value={formatDate(session.dateNaissance)}
            icon={<Calendar size={13} />}
          />
          <InfoRow label="Téléphone" value={session.telephone} icon={<Phone size={13} />} />
          <InfoRow label="Adresse e-mail" value={session.email} icon={<Mail size={13} />} />
          <InfoRow label="IBAN" value={session.iban} icon={<CreditCard size={13} />} />
          <InfoRow label="Date d'entrée" value={formatDate(session.dateEntree)} icon={<Award size={13} />} />
        </div>

        <div className="sam-card" style={{ padding: 24 }}>
          <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>
            Documents
          </h3>
          <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '0 0 14px' }}>
            Cliquez sur une ligne pour changer son état.
          </p>
          <div className="flex flex-col gap-2">
            <DocToggle
              label="Contrat de travail"
              done={session.contratSigne}
              doneText="Signé"
              missingText="Non signé"
              onToggle={() => toggleDoc('contratSigne', 'Contrat de travail')}
            />
            <DocToggle
              label="Visite médicale"
              done={session.visiteMedicale}
              doneText="Effectuée"
              missingText="Non effectuée"
              onToggle={() => toggleDoc('visiteMedicale', 'Visite médicale')}
            />
          </div>
        </div>
      </div>

      <div className="sam-card" style={{ padding: 24 }}>
        <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>
          Mes statistiques
        </h3>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}
        >
          <StatCard label="Locations" value={stats.locations} icon={<ClipboardList size={16} />} />
          <StatCard
            label="CA généré"
            value={formatCurrency(stats.ca)}
            icon={<DollarSign size={16} />}
            highlight
          />
          <StatCard label="Permis délivrés" value={stats.permis} icon={<ShieldCheck size={16} />} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN — RESSOURCES / CATÉGORIES
   ============================================================ */

function CategoryModal({ open, onClose, category, db, actions, notify }) {
  const blank = { nom: '', description: '', icone: '🚤', statut: 'Actif' };
  const [form, setForm] = useState(blank);
  useEffect(() => {
    if (open) setForm(category || blank);
  }, [open, category]);

  function submit() {
    if (!form.nom.trim()) {
      notify('Veuillez indiquer le nom de la catégorie.', 'error');
      return;
    }
    if (category) {
      actions.updateCategory(category.id, form);
      notify('Catégorie mise à jour.', 'success');
    } else {
      actions.addCategory({ ...form, id: uid('cat') });
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

function AdminCategories({ db, actions, notify }) {
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
        onConfirm={() => {
          actions.deleteCategory(deleteCat.id);
          notify('Catégorie supprimée.', 'success');
          setDeleteCat(null);
        }}
      />
    </div>
  );
}

/* ============================================================
   ADMIN — GESTION DES UTILISATEURS
   ============================================================ */

function UserModal({ open, onClose, user, actions, notify }) {
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

function AdminUsers({ db, actions, notify, session }) {
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
        onConfirm={() => {
          actions.deleteUser(deleteUser.id);
          notify('Utilisateur supprimé.', 'success');
          setDeleteUser(null);
        }}
      />
    </div>
  );
}

/* ============================================================
   ADMIN — GESTION DES LOCATIONS / PERMIS / PARAMÈTRES
   ============================================================ */

function AdminRentals({ db, actions, notify }) {
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
        onConfirm={() => {
          actions.deleteRental(deleteRental.id);
          notify('Location supprimée.', 'success');
          setDeleteRental(null);
        }}
      />
    </div>
  );
}

function AdminPermits({ db, actions, notify }) {
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

function AdminSettings({ session }) {
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
                  borderRadius: 10,
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

function AdminStat({ label, value, icon }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: '13px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          flexShrink: 0,
          background: 'rgba(212,167,44,0.12)',
          color: THEME.gold,
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

function AdminPage({ db, actions, notify, session }) {
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


/* ============================================================
   APPLICATION PRINCIPALE
   ============================================================ */

function App() {
  const [db, setDb] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedCitizenId, setSelectedCitizenId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifLog, setNotifLog] = useState([]);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    (async () => {
      let loadedDb = null;
      try {
        const { loadDatabase } = await import('./lib/supabaseDb');

        loadedDb = await loadDatabase();

      } catch (e) {
        console.error('Impossible de charger la base Supabase :', e);
        setLoadError(e && e.message ? e.message : 'Erreur inconnue');
        setLoaded(true);
        return;
      }

      setDb(loadedDb);

      try {
        const sres = await sessionStore.get(SESSION_KEY, false);
        if (sres && sres.value) {
          const found = loadedDb.users.find((u) => u.id === sres.value);
          if (found) setSession(found);
        }
      } catch (e) {
        /* pas de session active */
      }

      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (session && db) {
      const fresh = db.users.find((u) => u.id === session.id);
      if (!fresh) {
        setSession(null);
        return;
      }
      if (JSON.stringify(fresh) !== JSON.stringify(session)) setSession(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  function notify(message, type) {
    const id = uid('t');
    setToasts((prev) => [...prev, { id, message, type: type || 'success' }]);
    setNotifLog((prev) => [...prev.slice(-19), { id, message, type: type || 'success' }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }

  function handleLogin(email, password) {
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );

    if (!user) {
      return {
        ok: false,
        error: 'Adresse e-mail ou mot de passe incorrect.',
      };
    }

    setSession(user);
    sessionStore.set(SESSION_KEY, user.id, false);
    setPage('dashboard');

    return { ok: true };
  }

  function handleLogout() {
    setSession(null);
    sessionStore.remove(SESSION_KEY, false);
    setMobileMenuOpen(false);
    setPage('dashboard');
  }

  function navigate(p) {
    setPage(p);
    setMobileMenuOpen(false);
  }
  function openVehicle(id) {
    setSelectedVehicleId(id);
    setPage('garage-detail');
  }
  function openCitizen(id) {
    setSelectedCitizenId(id);
    setPage('citizen-detail');
  }

  const actions = useMemo(() => {
    const set = (fn) => setDb((prev) => fn(prev));
    return {
      addVehicle: async (data) => {
        const vehicle = {
          id: uid('v'),
          ...data,
        };

        try {
          const { saveVehicle } = await import('./lib/supabaseDb');

          await saveVehicle(vehicle);

          setDb((prev) => ({
            ...prev,
            vehicles: [...prev.vehicles, vehicle],
          }));

          notify('Véhicule ajouté avec succès.', 'success');
        } catch (error) {
          console.error('Erreur ajout véhicule:', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      updateVehicle: async (id, patch) => {
        try {
          const { saveVehicle } = await import('./lib/supabaseDb');

          const current = db.vehicles.find((v) => v.id === id);

          if (!current) {
            notify('Véhicule introuvable.', 'error');
            return;
          }

          const vehicleToSave = {
            ...current,
            ...patch,
          };


          await saveVehicle(vehicleToSave);

          setDb((prev) => ({
            ...prev,
            vehicles: prev.vehicles.map((v) => (v.id === id ? vehicleToSave : v)),
          }));

          notify('Véhicule modifié avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur modification véhicule:', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      deleteVehicle: async (id) => {
        try {
          const { deleteVehicle } = await import('./lib/supabaseDb');

          await deleteVehicle(id);

          setDb((prev) => ({
            ...prev,
            vehicles: prev.vehicles.filter((v) => v.id !== id),
          }));

          notify('Véhicule supprimé.', 'success');
        } catch (error) {
          console.error('Erreur suppression véhicule:', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },
      addVehicleNote: async (vehicleId, note) => {
        try {
          const { saveVehicleNote } = await import('./lib/supabaseDb');

          const vehicleNote = {
            id: note.id || uid('note'),
            vehicleId,
            ...note,
          };

          await saveVehicleNote(vehicleNote);

          setDb((prev) => ({
            ...prev,
            vehicles: prev.vehicles.map((v) =>
              v.id === vehicleId
                ? {
                    ...v,
                    notes: [...(v.notes || []), vehicleNote],
                  }
                : v,
            ),
          }));

          notify('Note ajoutée avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur ajout note véhicule :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      addMaintenance: async (vehicleId, data) => {
        try {
          const { saveMaintenance } = await import('./lib/supabaseDb');

          const maintenance = {
            id: uid('m'),
            vehiculeId: vehicleId,
            ...data,
          };

          await saveMaintenance(maintenance);

          setDb((prev) => ({
            ...prev,
            maintenances: [...prev.maintenances, maintenance],
          }));

          notify('Maintenance ajoutée avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur ajout maintenance :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      addRental: async (data) => {
        try {
          const { saveRental } = await import('./lib/supabaseDb');

          const rental = {
            id: uid('r'),
            ...data,
          };

          await saveRental(rental);

          // Le statut du vehicule change avec la location : il doit etre
          // enregistre lui aussi, sinon il revient a sa valeur precedente
          // au prochain chargement de la page.
          const vehicle = db.vehicles.find((v) => v.id === rental.vehiculeId);
          let updatedVehicle = null;

          if (vehicle) {
            if (rental.statut === 'En cours') {
              updatedVehicle = { ...vehicle, statut: 'Loué' };
            } else if (rental.statut === 'Réservée' && vehicle.statut === 'Disponible') {
              updatedVehicle = { ...vehicle, statut: 'Réservé' };
            }
          }

          if (updatedVehicle) {
            const { saveVehicle } = await import('./lib/supabaseDb');
            await saveVehicle(updatedVehicle);
          }

          setDb((prev) => ({
            ...prev,
            rentals: [...prev.rentals, rental],
            vehicles: updatedVehicle
              ? prev.vehicles.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
              : prev.vehicles,
          }));

          notify('Location ajoutée avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur ajout location :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      updateRental: async (id, patch) => {
        try {
          const { saveRental } = await import('./lib/supabaseDb');

          const current = db.rentals.find((r) => r.id === id);

          if (!current) {
            notify('Location introuvable.', 'error');
            return;
          }

          const updatedRental = {
            ...current,
            ...patch,
          };

          await saveRental(updatedRental);

          // Meme logique que pour la creation : le nouveau statut du
          // vehicule doit etre enregistre dans Supabase.
          const vehicle = db.vehicles.find((v) => v.id === updatedRental.vehiculeId);
          let updatedVehicle = null;

          if (vehicle && patch.statut) {
            if (patch.statut === 'Terminée' || patch.statut === 'Annulée') {
              updatedVehicle = { ...vehicle, statut: 'Disponible' };
            } else if (patch.statut === 'En cours') {
              updatedVehicle = { ...vehicle, statut: 'Loué' };
            } else if (patch.statut === 'Réservée' && vehicle.statut === 'Disponible') {
              updatedVehicle = { ...vehicle, statut: 'Réservé' };
            }
          }

          if (updatedVehicle) {
            const { saveVehicle } = await import('./lib/supabaseDb');
            await saveVehicle(updatedVehicle);
          }

          setDb((prev) => ({
            ...prev,
            rentals: prev.rentals.map((r) => (r.id === id ? updatedRental : r)),
            vehicles: updatedVehicle
              ? prev.vehicles.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
              : prev.vehicles,
          }));

          notify('Location modifiée avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur modification location :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      deleteRental: async (id) => {
        try {
          const { deleteRental } = await import('./lib/supabaseDb');

          await deleteRental(id);

          setDb((prev) => ({
            ...prev,
            rentals: prev.rentals.filter((r) => r.id !== id),
          }));

          notify('Location supprimée.', 'success');
        } catch (error) {
          console.error('❌ Erreur suppression location :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      addCategory: async (data) => {
        const category = {
          id: data.id || uid('cat'),
          ...data,
        };

        try {
          const { saveCategory } = await import('./lib/supabaseDb');

          await saveCategory(category);

          setDb((prev) => ({
            ...prev,
            categories: [...prev.categories, category],
          }));

          notify('Catégorie ajoutée avec succès.', 'success');
        } catch (error) {
          console.error('Erreur ajout catégorie:', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      updateCategory: async (id, patch) => {

        try {
          const { saveCategory } = await import('./lib/supabaseDb');

          // On récupère la catégorie actuelle depuis db
          const current = db.categories.find((c) => c.id === id);

          if (!current) {
            notify('Catégorie introuvable.', 'error');
            return;
          }

          const updatedCategory = {
            ...current,
            ...patch,
          };


          // Mise à jour immédiate de l'interface
          setDb((prev) => ({
            ...prev,
            categories: prev.categories.map((c) => (c.id === id ? updatedCategory : c)),
          }));


          // Sauvegarde réelle dans Supabase
          await saveCategory(updatedCategory);


          notify('Catégorie modifiée avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur modification catégorie :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      deleteCategory: async (id) => {
        try {
          const { deleteCategory } = await import('./lib/supabaseDb');

          await deleteCategory(id);

          setDb((prev) => ({
            ...prev,
            categories: prev.categories.filter((c) => c.id !== id),
          }));

          notify('Catégorie supprimée.', 'success');
        } catch (error) {
          console.error('Erreur suppression catégorie:', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      addCitizen: async (data) => {
        try {
          const { saveCitizen } = await import('./lib/supabaseDb');

          const citizen = {
            id: data.id || uid('cit'),
            ...data,
          };

          await saveCitizen(citizen);

          set((prev) => ({
            ...prev,
            citizens: [...prev.citizens, citizen],
          }));

          notify('Citoyen ajouté avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur ajout citoyen :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },
      updateCitizen: async (id, patch) => {
        try {
          const { saveCitizen } = await import('./lib/supabaseDb');

          const current = db.citizens.find((c) => c.id === id);

          if (!current) {
            notify('Citoyen introuvable.', 'error');
            return;
          }

          const updatedCitizen = {
            ...current,
            ...patch,
          };

          await saveCitizen(updatedCitizen);

          set((prev) => ({
            ...prev,
            citizens: prev.citizens.map((c) => (c.id === id ? updatedCitizen : c)),
          }));

          notify('Citoyen modifié avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur modification citoyen :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },
      deleteCitizen: async (id) => {
        try {
          const { deleteCitizen: removeCitizen } = await import('./lib/supabaseDb');

          await removeCitizen(id);

          set((prev) => ({
            ...prev,
            citizens: prev.citizens.filter((c) => c.id !== id),
          }));

          notify('Citoyen supprimé avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur suppression citoyen :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },
      addPermitDossier: async (data) => {
        try {
          const { savePermit } = await import('./lib/supabaseDb');

          const permit = {
            id: data.id || uid('permit'),
            ...data,
          };

          await savePermit(permit);

          set((prev) => ({
            ...prev,
            permits: [...prev.permits, permit],
          }));

          notify('Dossier de permis ajouté avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur ajout permis :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      updatePermit: async (id, patch) => {
        try {
          const { savePermit } = await import('./lib/supabaseDb');

          const current = db.permits.find((p) => p.id === id);

          if (!current) {
            notify('Permis introuvable.', 'error');
            return;
          }

          const updatedPermit = {
            ...current,
            ...patch,
          };

          await savePermit(updatedPermit);

          set((prev) => ({
            ...prev,
            permits: prev.permits.map((p) => (p.id === id ? updatedPermit : p)),
          }));

          notify('Permis modifié avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur modification permis :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },
      addProfessionalAppointment: async (data) => {
        try {
          const { saveProfessionalAppointment } = await import('./lib/supabaseDb');

          const appointment = {
            id: data.id || uid('rdv'),
            ...data,
          };

          await saveProfessionalAppointment(appointment);

          setDb((prev) => ({
            ...prev,
            professionalAppointments: [...(prev.professionalAppointments || []), appointment],
          }));

          notify('Rendez-vous professionnel ajouté avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur ajout rendez-vous professionnel :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      updateProfessionalAppointment: async (id, patch) => {
        try {
          const { saveProfessionalAppointment } = await import('./lib/supabaseDb');

          const current = db.professionalAppointments.find((a) => a.id === id);

          if (!current) {
            notify('Rendez-vous introuvable.', 'error');
            return;
          }

          const updatedAppointment = {
            ...current,
            ...patch,
          };

          await saveProfessionalAppointment(updatedAppointment);

          setDb((prev) => ({
            ...prev,
            professionalAppointments: prev.professionalAppointments.map((a) =>
              a.id === id ? updatedAppointment : a,
            ),
          }));

          notify('Rendez-vous professionnel modifié avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur modification rendez-vous professionnel :', error);

          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      deleteProfessionalAppointment: async (id) => {
        try {
          const { deleteProfessionalAppointment: removeAppointment } = await import('./lib/supabaseDb');

          await removeAppointment(id);

          setDb((prev) => ({
            ...prev,
            professionalAppointments: prev.professionalAppointments.filter((a) => a.id !== id),
          }));

          notify('Rendez-vous professionnel supprimé.', 'success');
        } catch (error) {
          console.error('❌ Erreur suppression rendez-vous professionnel :', error);

          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      addUser: async (data) => {
        try {
          const { saveUser } = await import('./lib/supabaseDb');

          const user = {
            id: data.id || uid('user'),
            ...data,
          };

          await saveUser(user);

          setDb((prev) => ({
            ...prev,
            users: [...prev.users, user],
          }));

          notify('Utilisateur ajouté avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur ajout utilisateur :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      updateUser: async (id, patch) => {
        try {
          const { saveUser } = await import('./lib/supabaseDb');

          const current = db.users.find((u) => u.id === id);

          if (!current) {
            notify('Utilisateur introuvable.', 'error');
            return;
          }

          const updatedUser = {
            ...current,
            ...patch,
          };

          await saveUser(updatedUser);

          setDb((prev) => ({
            ...prev,
            users: prev.users.map((u) => (u.id === id ? updatedUser : u)),
          }));

          notify('Utilisateur modifié avec succès.', 'success');
        } catch (error) {
          console.error('❌ Erreur modification utilisateur :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },

      deleteUser: async (id) => {
        try {
          const { deleteUser } = await import('./lib/supabaseDb');

          await deleteUser(id);

          setDb((prev) => ({
            ...prev,
            users: prev.users.filter((u) => u.id !== id),
          }));

          notify('Utilisateur supprimé.', 'success');
        } catch (error) {
          console.error('❌ Erreur suppression utilisateur :', error);
          notify(`Erreur : ${error.message}`, 'error');
        }
      },
    };
  }, [db]);

  if (loadError) {
    return (
      <div
        className="sam-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <GlobalStyles />
        <div className="sam-card sam-fade-in" style={{ maxWidth: 460, padding: 32, textAlign: 'center' }}>
          <img
            src={LOGO}
            alt="San Andreas Marina"
            style={{ width: 72, height: 72, objectFit: 'contain', opacity: 0.9 }}
          />
          <h2 className="sam-display" style={{ fontSize: 21, fontWeight: 700, margin: '16px 0 8px' }}>
            Connexion a la base impossible
          </h2>
          <p style={{ color: THEME.textMuted, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 8px' }}>
            L&apos;application n&apos;a pas pu joindre la base de donnees Supabase. Verifiez votre connexion
            internet ainsi que les cles d&apos;acces du projet.
          </p>
          <p
            style={{
              color: THEME.error,
              fontSize: 12.5,
              fontFamily: 'monospace',
              margin: '0 0 20px',
              wordBreak: 'break-word',
            }}
          >
            {loadError}
          </p>
          <button className="sam-btn sam-btn-gold" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Reessayer
          </button>
        </div>
      </div>
    );
  }

  if (!loaded || !db) {
    return (
      <div
        className="sam-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GlobalStyles />
        <img
          src={LOGO}
          alt="San Andreas Marina"
          style={{ width: 84, height: 84, opacity: 0.85 }}
          className="sam-fade-in"
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="sam-root">
        <GlobalStyles />
        <LoginPage onLogin={handleLogin} notify={notify} />
        <ToastStack toasts={toasts} />
        <MobileToasts toasts={toasts} />
      </div>
    );
  }

  const isAdmin = session.role === 'admin';

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <DashboardPage db={db} session={session} navigate={navigate} />;
      case 'garage':
        return (
          <GaragePage db={db} actions={actions} isAdmin={isAdmin} notify={notify} openVehicle={openVehicle} />
        );
      case 'garage-detail':
        return (
          <VehicleDetailPage
            db={db}
            actions={actions}
            isAdmin={isAdmin}
            session={session}
            notify={notify}
            vehicleId={selectedVehicleId}
            back={() => setPage('garage')}
          />
        );
      case 'rentals':
        return <RentalsPage db={db} actions={actions} isAdmin={isAdmin} session={session} notify={notify} />;
      case 'planning':
        return <PlanningPage db={db} actions={actions} notify={notify} session={session} />;
      case 'permits':
        return (
          <PermitsPage
            db={db}
            actions={actions}
            isAdmin={isAdmin}
            notify={notify}
            openCitizen={openCitizen}
          />
        );
      case 'citizens':
        return <CitizensPage db={db} notify={notify} openCitizen={openCitizen} />;
      case 'citizen-detail':
        return <CitizenDetailPage db={db} citizenId={selectedCitizenId} back={() => setPage('citizens')} />;
      case 'database':
        return <DatabasePage db={db} isAdmin={isAdmin} />;
      case 'history':
        return <HistoryPage db={db} />;
      case 'profile':
        return <ProfilePage session={session} db={db} actions={actions} notify={notify} />;
      case 'admin':
        return isAdmin ? (
          <AdminPage db={db} actions={actions} notify={notify} session={session} />
        ) : (
          <DashboardPage db={db} session={session} navigate={navigate} />
        );
      default:
        return <DashboardPage db={db} session={session} navigate={navigate} />;
    }
  }

  return (
    <div className="sam-root" style={{ display: 'flex' }}>
      <GlobalStyles />
      <Sidebar
        page={page}
        session={session}
        isAdmin={isAdmin}
        onNavigate={navigate}
        onProfile={() => navigate('profile')}
        onLogout={handleLogout}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <MobileTopBar
          onOpenMenu={() => setMobileMenuOpen(true)}
          onBell={() => setBellOpen((o) => !o)}
          notifCount={notifLog.length}
        />

        <div className="sam-hide-mobile flex justify-end" style={{ padding: '18px 32px 0' }}>
          <NotificationBell log={notifLog} open={bellOpen} setOpen={setBellOpen} />
        </div>

        {bellOpen && (
          <div
            className="sam-hide-desktop sam-card sam-modal-anim"
            style={{
              position: 'fixed',
              top: 62,
              left: 14,
              right: 14,
              maxHeight: 340,
              overflowY: 'auto',
              zIndex: 260,
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${THEME.border}`,
                fontWeight: 700,
                fontSize: 13.5,
              }}
            >
              Notifications
            </div>
            {notifLog.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
                Aucune notification récente.
              </div>
            ) : (
              notifLog
                .slice()
                .reverse()
                .map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: 13,
                    }}
                  >
                    {n.message}
                  </div>
                ))
            )}
          </div>
        )}

        <div className="sam-content" style={{ flex: 1 }}>
          {renderPage()}
        </div>
      </div>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        page={page}
        session={session}
        isAdmin={isAdmin}
        onNavigate={navigate}
        onProfile={() => navigate('profile')}
        onLogout={handleLogout}
      />
      <ToastStack toasts={toasts} />
      <MobileToasts toasts={toasts} />
    </div>
  );
}

export default App;
