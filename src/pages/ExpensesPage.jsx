import { useEffect, useState } from 'react';
import { Pencil, Plus, Receipt, Trash2, TrendingDown, Wallet } from 'lucide-react';
import { THEME } from '../theme';
import { addDays, formatCurrency, formatDate, isoDate, startOfWeek, todayISO } from '../lib/utils';
import { expenseEntries, sumExpenses, sumCA, inRange } from '../lib/stats';
import {
  ConfirmDialog,
  EmptyState,
  FieldRow,
  Modal,
  PageHeader,
  SearchInput,
  StatCard,
} from '../components/ui';

/* ============================================================
   DÉPENSES
   ============================================================ */

export function ExpenseModal({ open, onClose, expense, categories, actions, notify }) {
  const blank = {
    date: todayISO(),
    libelle: '',
    categorie: '',
    montant: '',
    note: '',
  };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) setForm(expense ? { ...expense, montant: String(expense.montant) } : blank);
  }, [open, expense]);

  function submit() {
    if (!form.libelle.trim()) {
      notify('Veuillez indiquer à quoi correspond la dépense.', 'error');
      return;
    }
    const montant = Number(String(form.montant).replace(',', '.'));
    if (!montant || montant <= 0) {
      notify('Veuillez indiquer un montant supérieur à 0.', 'error');
      return;
    }
    if (!form.date) {
      notify('Veuillez indiquer la date de la dépense.', 'error');
      return;
    }

    const payload = {
      date: form.date,
      libelle: form.libelle.trim(),
      categorie: form.categorie.trim(),
      montant,
      note: form.note.trim(),
    };

    if (expense) {
      actions.updateExpense(expense.id, payload);
    } else {
      actions.addExpense({ ...payload, dateCreation: todayISO() });
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? 'Modifier la dépense' : 'Nouvelle dépense'}
      subtitle="Elle sera comptée dans le total de la semaine et sur le tableau de bord."
    >
      <div>
        <FieldRow label="Dépense">
          <input
            className="sam-input"
            value={form.libelle}
            onChange={(e) => setForm({ ...form, libelle: e.target.value })}
            placeholder="Ex : Plein de carburant SAM-001"
          />
        </FieldRow>

        <div className="flex gap-3 flex-wrap">
          <div style={{ flex: 1, minWidth: 150 }}>
            <FieldRow label="Montant ($)">
              <input
                className="sam-input"
                type="number"
                min="0"
                step="0.01"
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: e.target.value })}
                placeholder="0"
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
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

        <FieldRow label="Catégorie (facultatif)">
          <input
            className="sam-input"
            list="sam-categories-depense"
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            placeholder="Ex : Carburant"
          />
          {/* Rappelle les catégories déjà saisies : évite les doublons
              d'orthographe qui fausseraient la répartition. */}
          <datalist id="sam-categories-depense">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FieldRow>

        <FieldRow label="Note (facultatif)">
          <textarea
            className="sam-input"
            rows={3}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Fournisseur, référence, précisions..."
          />
        </FieldRow>

        <div className="flex justify-end gap-3">
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="sam-btn sam-btn-gold" onClick={submit}>
            {expense ? 'Enregistrer' : 'Ajouter la dépense'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ExpensesPage({ db, actions, notify }) {
  const [period, setPeriod] = useState('semaine');
  const [search, setSearch] = useState('');
  const [modalExpense, setModalExpense] = useState(undefined);
  const [deleteExpense, setDeleteExpense] = useState(null);

  const toutes = expenseEntries(db);
  const categories = [...new Set(toutes.map((e) => e.categorie).filter((c) => c && c !== 'Maintenance'))].sort();

  const weekStart = startOfWeek(todayISO());
  const weekEnd = addDays(weekStart, 6);

  /* Bornes de la période affichée. */
  const debut = period === 'semaine' ? weekStart : period === 'mois' ? isoDate(-29) : null;
  const fin = period === 'semaine' ? weekEnd : period === 'mois' ? todayISO() : null;

  const dePeriode = debut ? toutes.filter((e) => inRange(e.date, debut, fin)) : toutes;

  const visibles = dePeriode.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      e.libelle.toLowerCase().includes(q) ||
      e.categorie.toLowerCase().includes(q) ||
      (e.note || '').toLowerCase().includes(q)
    );
  });

  const totalPeriode = sumExpenses(dePeriode);
  const totalSemaine = sumExpenses(toutes.filter((e) => inRange(e.date, weekStart, weekEnd)));
  const caSemaine = sumCA(db.rentals.filter((r) => inRange(r.date, weekStart, weekEnd)));
  const beneficeSemaine = caSemaine - totalSemaine;

  /* Répartition par catégorie sur la période affichée. */
  const parCategorie = [...new Set(dePeriode.map((e) => e.categorie))]
    .map((cat) => ({ cat, montant: sumExpenses(dePeriode.filter((e) => e.categorie === cat)) }))
    .sort((a, b) => b.montant - a.montant);

  const libellePeriode =
    period === 'semaine' ? 'cette semaine' : period === 'mois' ? 'sur 30 jours' : 'depuis le début';

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Entreprise"
        title="Dépenses"
        subtitle="Toutes les sorties d'argent de la marina. Les coûts de maintenance saisis sur les fiches véhicules sont inclus automatiquement."
        action={
          <button className="sam-btn sam-btn-gold" onClick={() => setModalExpense(null)}>
            <Plus size={16} /> Nouvelle dépense
          </button>
        }
      />

      {db.expensesUnavailable && (
        <div
          className="sam-card"
          style={{
            padding: '18px 22px',
            marginBottom: 22,
            borderColor: 'rgba(240,199,94,0.32)',
            background: 'linear-gradient(155deg, rgba(212,167,44,0.14), rgba(16,40,63,0.6))',
          }}
        >
          <div
            className="sam-display"
            style={{ fontSize: 17, fontWeight: 700, color: THEME.goldLight, marginBottom: 6 }}
          >
            Les dépenses ne sont pas encore installées
          </div>
          <p style={{ fontSize: 13.5, color: THEME.textMuted, margin: 0, lineHeight: 1.65 }}>
            Il reste une manipulation à faire une seule fois : ouvrez votre projet sur supabase.com,
            allez dans <b style={{ color: THEME.text }}>SQL Editor</b>, collez le contenu du fichier{' '}
            <b style={{ color: THEME.text }}>sql/create_expenses_table.sql</b> puis cliquez sur{' '}
            <b style={{ color: THEME.text }}>Run</b>. Rechargez ensuite cette page. Les coûts de
            maintenance, eux, s’affichent déjà ci-dessous.
          </p>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 22,
        }}
      >
        <StatCard
          label="Dépenses cette semaine"
          value={formatCurrency(totalSemaine)}
          icon={<TrendingDown size={16} />}
          highlight
        />
        <StatCard
          label="Chiffre d'affaires (semaine)"
          value={formatCurrency(caSemaine)}
          icon={<Wallet size={16} />}
        />
        <StatCard
          label="Bénéfice net (semaine)"
          value={formatCurrency(beneficeSemaine)}
          icon={<Receipt size={16} />}
          sub={beneficeSemaine < 0 ? 'La semaine est déficitaire' : 'Chiffre d’affaires moins dépenses'}
        />
      </div>

      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 20 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Dépense, catégorie ou note..." />
        <div
          className="flex gap-1"
          style={{
            background: 'rgba(7,21,37,0.5)',
            padding: 5,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 2px 8px rgba(2,8,16,0.45)',
          }}
        >
          {[
            ['semaine', 'Cette semaine'],
            ['mois', '30 jours'],
            ['tout', 'Tout'],
          ].map(([id, label]) => (
            <div key={id} className={`sam-tab ${period === id ? 'active' : ''}`} onClick={() => setPeriod(id)}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {parCategorie.length > 0 && (
        <div className="sam-card" style={{ padding: 22, marginBottom: 20 }}>
          <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 16 }}>
            <h3 className="sam-display" style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
              Répartition {libellePeriode}
            </h3>
            <span
              className="sam-display"
              style={{ fontSize: 22, fontWeight: 700, color: THEME.goldLight }}
            >
              {formatCurrency(totalPeriode)}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {parCategorie.map((c) => (
              <div key={c.cat}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.cat}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.textMuted }}>
                    {formatCurrency(c.montant)}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.07)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${totalPeriode ? (c.montant / totalPeriode) * 100 : 0}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${THEME.goldLight}, ${THEME.gold})`,
                      boxShadow: '0 0 12px rgba(212,167,44,0.5)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibles.length === 0 ? (
        <div className="sam-card">
          <EmptyState
            icon={<Receipt size={30} />}
            text="Aucune dépense sur cette période"
            sub="Enregistrez une dépense pour suivre ce que la marina dépense chaque semaine."
          />
        </div>
      ) : (
        <div className="sam-table-wrap sam-card">
          <table className="sam-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Dépense</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(e.date)}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.libelle}</div>
                    {e.note && (
                      <div
                        style={{
                          fontSize: 12,
                          color: THEME.textMuted,
                          marginTop: 3,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {e.note}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`sam-badge ${e.source === 'maintenance' ? 'sam-badge-info' : 'sam-badge-neutral'}`}
                    >
                      {e.categorie}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatCurrency(e.montant)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {e.source === 'maintenance' ? (
                      <span style={{ fontSize: 12, color: THEME.textMuted }}>
                        Depuis la fiche véhicule
                      </span>
                    ) : (
                      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="sam-btn sam-btn-ghost sam-btn-sm"
                          onClick={() => setModalExpense(db.expenses.find((x) => x.id === e.id))}
                          aria-label="Modifier la dépense"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="sam-btn sam-btn-danger sam-btn-sm"
                          onClick={() => setDeleteExpense(e)}
                          aria-label="Supprimer la dépense"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseModal
        open={modalExpense !== undefined}
        onClose={() => setModalExpense(undefined)}
        expense={modalExpense}
        categories={categories}
        actions={actions}
        notify={notify}
      />

      <ConfirmDialog
        open={!!deleteExpense}
        onCancel={() => setDeleteExpense(null)}
        danger
        title="Supprimer cette dépense ?"
        message={
          deleteExpense
            ? `"${deleteExpense.libelle}" (${formatCurrency(deleteExpense.montant)}) sera définitivement supprimée.`
            : ''
        }
        confirmLabel="Supprimer"
        onConfirm={async () => {
          await actions.deleteExpense(deleteExpense.id);
          setDeleteExpense(null);
        }}
      />
    </div>
  );
}
