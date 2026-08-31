export function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

export function pad(n, len) {
  return String(n).padStart(len, '0');
}

export function isoDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.toISOString().slice(0, 10);
}

export function todayISO() {
  return isoDate(0);
}

export function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatDateTime(iso, time) {
  return `${formatDate(iso)}${time ? ' à ' + time : ''}`;
}

export function formatCurrency(n) {
  const v = Math.round(Number(n) || 0);
  return '$' + v.toLocaleString('fr-FR');
}

export function formatCurrencyPrecise(n) {
  const v = Number(n) || 0;
  return '$' + v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function weekdayLabel(iso) {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[new Date(iso + 'T12:00:00').getDay()];
}

export function monthLabel(iso) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  return months[new Date(iso + 'T12:00:00').getMonth()];
}

// Retourne le lundi de la semaine contenant la date iso donnée
export function startOfWeek(iso) {
  const d = new Date((iso || todayISO()) + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function addDays(iso, n) {
  if (!iso) return null;

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    console.warn('⚠️ Date invalide dans addDays :', iso);
    return null;
  }

  d.setDate(d.getDate() + n);

  return d.toISOString().slice(0, 10);
}

export function initials(prenom, nom) {
  return ((prenom || '?')[0] || '').toUpperCase() + ((nom || '')[0] || '').toUpperCase();
}

export function fullName(person) {
  if (!person) return 'Inconnu';
  return `${person.prenom || ''} ${person.nom || ''}`.trim();
}

/* Affiche un nombre d'heures décimal en durée lisible : 1.5 -> "1h30".
   Utile depuis que les locations se réservent par tranches de 30 minutes. */
export function formatHours(totalHours) {
  const totalMin = Math.round((Number(totalHours) || 0) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/* Libellé d'un créneau de location ('30min' -> '30 min'). */
export function formatDuree(duree) {
  return String(duree || '').replace(/^(\d+)min$/, '$1 min');
}

export function statusTone(status) {
  const map = {
    Disponible: 'success',
    Loué: 'gold',
    Réservé: 'info',
    Réservée: 'info',
    Maintenance: 'error',
    'En cours': 'success',
    Terminée: 'neutral',
    Annulée: 'error',
    Valide: 'success',
    'En attente': 'warn',
    Refusé: 'error',
    Annulé: 'neutral',
    Actif: 'success',
    Inactif: 'neutral',
    Excellent: 'success',
    Bon: 'gold',
    'À surveiller': 'warn',
  };
  return map[status] || 'neutral';
}
