import { isoDate, todayISO, weekdayLabel, startOfWeek, addDays, fullName } from './utils';
import { THEME } from '../theme';

/* Statut du vehicule apres un changement de statut de location. Utilisee a
   la fois pour la creation et la modification d'une location (voir
   CLAUDE.md : ce changement doit etre enregistre, sinon il est perdu au
   rechargement). `allowRelease` n'est vrai qu'a la modification : on ne
   peut pas creer une location deja terminee/annulee. */
export function deriveVehicleStatusForRentalStatut(vehicle, statut, { allowRelease } = {}) {
  if (!vehicle) return null;
  if (allowRelease && (statut === 'Terminée' || statut === 'Annulée')) {
    return { ...vehicle, statut: 'Disponible' };
  }
  if (statut === 'En cours') {
    return { ...vehicle, statut: 'Loué' };
  }
  if (statut === 'Réservée' && vehicle.statut === 'Disponible') {
    return { ...vehicle, statut: 'Réservé' };
  }
  return null;
}

export function nextVehicleId(vehicles) {
  const nums = vehicles
    .map((v) => parseInt((v.identifiant || '').replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return 'SAM-' + pad(next, 3);
}

export function nextCitizenId(citizens) {
  const nums = citizens
    .map((c) => parseInt((c.identifiant || '').replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return 'CIT-' + pad(next, 4);
}

export function nextRentalNumber(rentals) {
  const year = new Date().getFullYear();
  const nums = rentals
    .filter((r) => (r.numero || '').includes('-' + year + '-'))
    .map((r) => parseInt(r.numero.split('-').pop(), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `LOC-${year}-${pad(next, 4)}`;
}

export function nextPermitNumber(permits, type, baseOffset) {
  const year = new Date().getFullYear();
  const code = type === 'Bateau' ? 'BAT' : 'HEL';
  const nums = permits
    .filter((p) => p.type === type && (p.numero || '').includes(`SAM-${code}-${year}-`))
    .map((p) => parseInt(p.numero.split('-').pop(), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : baseOffset || 0) + 1;
  return `SAM-${code}-${year}-${pad(next, 5)}`;
}


export function inRange(iso, start, end) {
  return iso >= start && iso <= end;
}

export function sumCA(rentals) {
  return rentals.reduce((s, r) => s + (r.statut !== 'Annulée' ? Number(r.prix) || 0 : 0), 0);
}

export function computeEmployeeStats(db) {
  return db.users
    .filter((u) => u.role === 'employe' || u.role === 'admin')
    .map((u) => {
      const myRentals = db.rentals.filter((r) => r.employeId === u.id && r.statut !== 'Annulée');
      const myPermits = db.permits.filter((p) => p.formateurId === u.id && p.statut === 'Valide');
      return {
        user: u,
        locations: myRentals.length,
        ca: sumCA(myRentals),
        permis: myPermits.length,
      };
    })
    .sort((a, b) => b.ca - a.ca);
}

export function computeDashboardStats(db) {
  const weekStart = startOfWeek(todayISO());
  const weekEnd = addDays(weekStart, 6);
  const weekRentals = db.rentals.filter((r) => inRange(r.date, weekStart, weekEnd));
  return {
    locationsWeek: weekRentals.filter((r) => r.statut !== 'Annulée').length,
    caWeek: sumCA(weekRentals),
    vehiculesDispo: db.vehicles.filter((v) => v.statut === 'Disponible').length,
    reservationsAVenir: db.rentals.filter((r) => r.statut === 'Réservée' && r.date >= todayISO()).length,
    permisDelivres: db.permits.filter((p) => p.statut === 'Valide').length,
    formationsRealisees: db.permits.length,
  };
}

export function caByPeriod(rentals, period) {
  // period: 'semaine' | 'mois' | 'annee'
  const buckets = [];
  if (period === 'semaine') {
    const start = startOfWeek(todayISO());
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      buckets.push({ label: weekdayLabel(d), date: d, ca: sumCA(rentals.filter((r) => r.date === d)) });
    }
  } else if (period === 'mois') {
    for (let i = 29; i >= 0; i--) {
      const d = isoDate(-i);
      buckets.push({ label: d.slice(8, 10), date: d, ca: sumCA(rentals.filter((r) => r.date === d)) });
    }
  } else {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const byMonth = {};
    rentals.forEach((r) => {
      if (r.statut !== 'Annulée') {
        const m = r.date.slice(0, 7);
        byMonth[m] = (byMonth[m] || 0) + Number(r.prix);
      }
    });
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}`;
      buckets.push({ label: months[d.getMonth()], date: key, ca: byMonth[key] || 0 });
    }
  }
  return buckets;
}

export function locationsPerDay(rentals, days) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = isoDate(-i);
    out.push({
      label: weekdayLabel(d) + ' ' + d.slice(8, 10),
      date: d,
      count: rentals.filter((r) => r.date === d && r.statut !== 'Annulée').length,
    });
  }
  return out;
}

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: THEME.bg2,
    border: `1px solid ${THEME.border}`,
    borderRadius: 10,
    fontSize: 12.5,
    color: THEME.text,
  },
  labelStyle: { color: THEME.textMuted },
};

export function categoryOf(db, id) {
  return db.categories.find((c) => c.id === id) || { nom: 'Sans catégorie', icone: '🚤' };
}
export function vehicleOf(db, id) {
  return db.vehicles.find((v) => v.id === id);
}
export function userOf(db, id) {
  return db.users.find((u) => u.id === id);
}
export function citizenOf(db, id) {
  return db.citizens.find((c) => c.id === id);
}
export function parseDuree(d) {
  return parseFloat(d) || 0;
}

export function vehicleStats(db, vehicleId) {
  const rentals = db.rentals.filter(
    (r) => r.vehiculeId === vehicleId && r.statut !== 'Annulée' && r.statut !== 'Réservée',
  );
  const ca = sumCA(rentals);
  const totalH = rentals.reduce((s, r) => s + parseDuree(r.duree), 0);
  const dernieres = rentals
    .map((r) => r.date)
    .sort()
    .reverse();
  return {
    count: rentals.length,
    ca,
    totalH,
    derniereLocation: dernieres[0] || null,
    prixMoyen: rentals.length ? ca / rentals.length : 0,
  };
}

export function checkAvailability(db, vehicleId, date, excludeRentalId) {
  const conflict = db.rentals.find(
    (r) =>
      r.vehiculeId === vehicleId &&
      r.date === date &&
      r.id !== excludeRentalId &&
      (r.statut === 'En cours' || r.statut === 'Réservée'),
  );
  return !conflict;
}

export function citizenRentals(db, citizen) {
  return db.rentals.filter((r) => r.citizenId === citizen.id || r.client === fullName(citizen));
}
export function citizenPermits(db, citizen) {
  return db.permits.filter((p) => p.citizenId === citizen.id);
}
export function citizenLastActivity(db, citizen) {
  const dates = [
    ...citizenRentals(db, citizen).map((r) => r.date),
    ...citizenPermits(db, citizen).map((p) => p.date),
  ]
    .sort()
    .reverse();
  return dates[0] || citizen.dateCreation;
}
