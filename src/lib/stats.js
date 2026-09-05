import { pad, isoDate, todayISO, weekdayLabel, startOfWeek, addDays, fullName } from './utils';
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

/* Liste unifiée des dépenses.
   Deux sources : les dépenses saisies sur la page Dépenses, et les coûts de
   maintenance déjà renseignés dans les fiches véhicules. Les secondes sont
   marquées `source: 'maintenance'` pour rester identifiables à l'écran et
   ne pas être modifiables depuis la page Dépenses — elles se gèrent depuis
   la fiche du véhicule concerné. */
export function expenseEntries(db) {
  const saisies = (db.expenses || [])
    .filter((e) => e.type !== 'entree')
    .map((e) => ({
      id: e.id,
      date: e.date,
      libelle: e.libelle,
      categorie: e.categorie || 'Sans catégorie',
      montant: Number(e.montant || 0),
      note: e.note || '',
      source: 'manuelle',
    }));

  const maintenances = (db.maintenances || [])
    .filter((m) => Number(m.cout || 0) > 0)
    .map((m) => {
      const vehicule = vehicleOf(db, m.vehiculeId);
      return {
        id: m.id,
        date: m.date,
        libelle: m.type || 'Maintenance',
        categorie: 'Maintenance',
        montant: Number(m.cout || 0),
        note: [vehicule ? vehicule.nom : null, m.commentaire].filter(Boolean).join(' — '),
        source: 'maintenance',
      };
    });

  return [...saisies, ...maintenances].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function sumExpenses(entries) {
  return entries.reduce((s, e) => s + Number(e.montant || 0), 0);
}

/* Entrées d'argent saisies à la main (virement d'un partenaire,
   remboursement...). Elles s'ajoutent au chiffre d'affaires des locations
   mais restent stockées dans la même table que les dépenses, distinguées
   par la colonne `type`. */
export function incomeEntries(db) {
  return (db.expenses || [])
    .filter((e) => e.type === 'entree')
    .map((e) => ({
      id: e.id,
      date: e.date,
      libelle: e.libelle,
      categorie: e.categorie || 'Sans catégorie',
      montant: Number(e.montant || 0),
      note: e.note || '',
      source: 'manuelle',
    }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function computeDashboardStats(db) {
  const weekStart = startOfWeek(todayISO());
  const weekEnd = addDays(weekStart, 6);
  const weekRentals = db.rentals.filter((r) => inRange(r.date, weekStart, weekEnd));
  /* Le chiffre d'affaires additionne les locations et les entrées saisies :
     un virement de partenariat compte comme du revenu au même titre. */
  const entreesWeek = sumExpenses(incomeEntries(db).filter((e) => inRange(e.date, weekStart, weekEnd)));
  const caWeek = sumCA(weekRentals) + entreesWeek;
  const depensesWeek = sumExpenses(expenseEntries(db).filter((e) => inRange(e.date, weekStart, weekEnd)));

  return {
    locationsWeek: weekRentals.filter((r) => r.statut !== 'Annulée').length,
    caWeek,
    entreesWeek,
    depensesWeek,
    beneficeWeek: caWeek - depensesWeek,
    vehiculesDispo: db.vehicles.filter((v) => v.statut === 'Disponible').length,
    reservationsAVenir: db.rentals.filter((r) => r.statut === 'Réservée' && r.date >= todayISO()).length,
    permisDelivres: db.permits.filter((p) => p.statut === 'Valide').length,
  };
}

/* Chiffre d'affaires ET dépenses sur les mêmes tranches de temps.
   Les deux séries doivent partager exactement les mêmes intervalles pour
   être superposables sur un graphique : elles sont donc calculées ensemble
   plutôt que par deux fonctions séparées.
   period: 'semaine' | 'mois' | 'annee' */
export function financeByPeriod(db, period) {
  const rentals = db.rentals;
  const depenses = expenseEntries(db);
  const entrees = incomeEntries(db);
  const buckets = [];

  if (period === 'semaine') {
    const start = startOfWeek(todayISO());
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      buckets.push({
        label: weekdayLabel(d),
        date: d,
        ca: sumCA(rentals.filter((r) => r.date === d)) + sumExpenses(entrees.filter((e) => e.date === d)),
        depenses: sumExpenses(depenses.filter((e) => e.date === d)),
      });
    }
  } else if (period === 'mois') {
    for (let i = 29; i >= 0; i--) {
      const d = isoDate(-i);
      buckets.push({
        label: d.slice(8, 10),
        date: d,
        ca: sumCA(rentals.filter((r) => r.date === d)) + sumExpenses(entrees.filter((e) => e.date === d)),
        depenses: sumExpenses(depenses.filter((e) => e.date === d)),
      });
    }
  } else {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const caByMonth = {};
    rentals.forEach((r) => {
      if (r.statut !== 'Annulée') {
        const m = r.date.slice(0, 7);
        caByMonth[m] = (caByMonth[m] || 0) + Number(r.prix);
      }
    });
    entrees.forEach((e) => {
      const m = String(e.date).slice(0, 7);
      caByMonth[m] = (caByMonth[m] || 0) + Number(e.montant || 0);
    });
    const depByMonth = {};
    depenses.forEach((e) => {
      const m = String(e.date).slice(0, 7);
      depByMonth[m] = (depByMonth[m] || 0) + Number(e.montant || 0);
    });
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}`;
      buckets.push({
        label: months[d.getMonth()],
        date: key,
        ca: caByMonth[key] || 0,
        depenses: depByMonth[key] || 0,
      });
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
    background: 'linear-gradient(155deg, rgba(21,48,74,0.96), rgba(11,31,51,0.93))',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14,
    fontSize: 12.5,
    color: THEME.text,
    padding: '10px 14px',
    boxShadow: '0 24px 50px -18px rgba(2,8,16,0.95), inset 0 1px 0 rgba(255,255,255,0.08)',
    backdropFilter: 'blur(16px)',
  },
  labelStyle: { color: THEME.textMuted, fontWeight: 700, marginBottom: 4 },
  cursor: { stroke: 'rgba(212,167,44,0.35)', strokeWidth: 1 },
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
/* Durées proposées pour une location : de 30 minutes à 8 heures, par pas de
   30 minutes. Le format stocké ('30min', '1h', '1h30') doit rester lisible
   par parseDuree() juste en dessous — les deux évoluent ensemble. */
export const RENTAL_DURATIONS = Array.from({ length: 16 }, (_, i) => {
  const totalMin = (i + 1) * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (!h) return `${m}min`;
  return m ? `${h}h${m}` : `${h}h`;
});

/* Convertit une durée affichée en nombre d'heures décimal.
   Accepte les nouveaux créneaux ('30min', '1h30') comme les valeurs déjà
   enregistrées en base avant les demi-heures ('1h', '8h'). */
export function parseDuree(d) {
  if (!d) return 0;
  const s = String(d).trim().toLowerCase();

  const minutesOnly = s.match(/^(\d+)\s*min/);
  if (minutesOnly) return Number(minutesOnly[1]) / 60;

  const hoursMinutes = s.match(/^(\d+)\s*h\s*(\d+)?/);
  if (hoursMinutes) {
    return Number(hoursMinutes[1]) + (hoursMinutes[2] ? Number(hoursMinutes[2]) / 60 : 0);
  }

  return parseFloat(s) || 0;
}

/* Prix suggéré pour une location, à partir du tarif de la catégorie du
   véhicule : prixHeure * nombre d'heures, avec une réduction dégressive de
   reductionHeure % par heure au-delà de la première (ex. 8 -> -8% à 2h,
   -16% à 3h, etc.). Plafonnée à 50% de réduction pour qu'une très longue
   location ne tombe jamais sous la moitié du tarif horaire normal.
   Renvoie null si la catégorie n'a pas de tarif défini : le prix reste alors
   entièrement manuel, comme avant cette fonctionnalité. */
export function computeSuggestedRentalPrice(category, duree) {
  if (!category || !category.prixHeure) return null;
  const heures = parseDuree(duree);
  if (!heures) return null;
  const heuresSupplementaires = Math.max(0, heures - 1);
  const reduction = Number(category.reductionHeure || 0) / 100;
  const multiplicateur = Math.max(1 - reduction * heuresSupplementaires, 0.5);
  return Math.round(category.prixHeure * heures * multiplicateur);
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
