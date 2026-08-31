import { useEffect, useState } from 'react';
import { Calendar, Check, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { THEME } from '../theme';
import { formatDate, todayISO } from '../lib/utils';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  FieldRow,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
} from '../components/ui';

/* ============================================================
   TO-DO LIST — organisation des événements
   ============================================================ */

const PRIORITES = ['Haute', 'Normale', 'Basse'];

/* La priorité "Normale" n'affiche pas de pastille : c'est la valeur par
   défaut, l'afficher partout noierait les tâches réellement urgentes. */
function PriorityTag({ priorite }) {
  if (priorite === 'Haute') return <span className="sam-badge sam-badge-error">Priorité haute</span>;
  if (priorite === 'Basse') return <span className="sam-badge sam-badge-neutral">Priorité basse</span>;
  return null;
}

export function TaskModal({ open, onClose, task, evenements, actions, notify }) {
  const blank = {
    evenement: '',
    titre: '',
    dateEcheance: '',
    priorite: 'Normale',
    note: '',
    fait: false,
  };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) setForm(task || blank);
  }, [open, task]);

  function submit() {
    if (!form.titre.trim()) {
      notify('Veuillez indiquer ce qu’il y a à faire.', 'error');
      return;
    }
    if (!form.evenement.trim()) {
      notify("Veuillez indiquer à quel événement cette tâche se rattache.", 'error');
      return;
    }

    const payload = {
      ...form,
      titre: form.titre.trim(),
      evenement: form.evenement.trim(),
      note: form.note.trim(),
      dateEcheance: form.dateEcheance || '',
    };

    if (task) {
      actions.updateTask(task.id, payload);
    } else {
      actions.addTask({ ...payload, dateCreation: todayISO() });
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? 'Modifier la tâche' : 'Nouvelle tâche'}
      subtitle="Les tâches sont regroupées par événement dans la liste."
    >
      <div>
        <FieldRow label="Événement">
          <input
            className="sam-input"
            list="sam-evenements"
            value={form.evenement}
            onChange={(e) => setForm({ ...form, evenement: e.target.value })}
            placeholder="Ex : Régate du 12 septembre"
          />
          {/* Propose les événements déjà saisis pour éviter les doublons
              d'orthographe qui casseraient le regroupement. */}
          <datalist id="sam-evenements">
            {evenements.map((ev) => (
              <option key={ev} value={ev} />
            ))}
          </datalist>
        </FieldRow>

        <FieldRow label="À faire">
          <input
            className="sam-input"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            placeholder="Ex : Réserver 4 bateaux"
          />
        </FieldRow>

        <div className="flex gap-3 flex-wrap">
          <div style={{ flex: 1, minWidth: 150 }}>
            <FieldRow label="À faire pour le (facultatif)">
              <input
                className="sam-input"
                type="date"
                value={form.dateEcheance}
                onChange={(e) => setForm({ ...form, dateEcheance: e.target.value })}
              />
            </FieldRow>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <FieldRow label="Priorité">
              <Select
                value={form.priorite}
                onChange={(v) => setForm({ ...form, priorite: v })}
                options={PRIORITES.map((p) => ({ value: p, label: p }))}
              />
            </FieldRow>
          </div>
        </div>

        <FieldRow label="Note (facultatif)">
          <textarea
            className="sam-input"
            rows={3}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Détails, contact, quantités..."
          />
        </FieldRow>

        <div className="flex justify-end gap-3">
          <button type="button" className="sam-btn sam-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="sam-btn sam-btn-gold" onClick={submit}>
            {task ? 'Enregistrer' : 'Ajouter la tâche'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function TodoPage({ db, actions, notify }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todo');
  const [modalTask, setModalTask] = useState(undefined);
  const [deleteTask, setDeleteTask] = useState(null);

  const tasks = db.tasks || [];
  const today = todayISO();

  const evenements = [...new Set(tasks.map((t) => t.evenement).filter(Boolean))].sort();

  const enRetard = tasks.filter((t) => !t.fait && t.dateEcheance && t.dateEcheance < today);
  const restantes = tasks.filter((t) => !t.fait);

  const visibles = tasks.filter((t) => {
    if (filter === 'todo' && t.fait) return false;
    if (filter === 'done' && !t.fait) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.titre.toLowerCase().includes(q) ||
      t.evenement.toLowerCase().includes(q) ||
      (t.note || '').toLowerCase().includes(q)
    );
  });

  /* Regroupement par événement. Les événements ayant encore des tâches à
     faire remontent en premier, puis on trie par nom. */
  const groupes = [...new Set(visibles.map((t) => t.evenement || 'Sans événement'))]
    .map((nom) => {
      const items = visibles.filter((t) => (t.evenement || 'Sans événement') === nom);
      const toutes = tasks.filter((t) => (t.evenement || 'Sans événement') === nom);
      return {
        nom,
        items,
        faites: toutes.filter((t) => t.fait).length,
        total: toutes.length,
      };
    })
    .sort((a, b) => {
      const aFini = a.faites === a.total;
      const bFini = b.faites === b.total;
      if (aFini !== bFini) return aFini ? 1 : -1;
      return a.nom.localeCompare(b.nom);
    });

  return (
    <div className="sam-fade-in">
      <PageHeader
        eyebrow="Entreprise"
        title="To-do list"
        subtitle="Les tâches à faire pour préparer les événements de la marina, regroupées par événement."
        action={
          <button className="sam-btn sam-btn-gold" onClick={() => setModalTask(null)}>
            <Plus size={16} /> Nouvelle tâche
          </button>
        }
      />

      {db.tasksUnavailable && (
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
            La to-do list n’est pas encore installée
          </div>
          <p style={{ fontSize: 13.5, color: THEME.textMuted, margin: 0, lineHeight: 1.65 }}>
            Il reste une manipulation à faire une seule fois : ouvrez votre projet sur supabase.com,
            allez dans <b style={{ color: THEME.text }}>SQL Editor</b>, collez le contenu du fichier{' '}
            <b style={{ color: THEME.text }}>sql/create_tasks_table.sql</b> puis cliquez sur{' '}
            <b style={{ color: THEME.text }}>Run</b>. Rechargez ensuite cette page : vos tâches
            pourront être enregistrées et partagées avec toute l’équipe.
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
        <StatCard label="Tâches à faire" value={restantes.length} icon={<ListChecks size={16} />} />
        <StatCard
          label="En retard"
          value={enRetard.length}
          icon={<Calendar size={16} />}
          highlight={enRetard.length > 0}
        />
        <StatCard label="Événements en cours" value={groupes.filter((g) => g.faites < g.total).length} icon={<Check size={16} />} />
      </div>

      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 20 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Tâche, événement ou note..." />
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
            ['todo', 'À faire'],
            ['done', 'Terminées'],
            ['all', 'Toutes'],
          ].map(([id, label]) => (
            <div key={id} className={`sam-tab ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {groupes.length === 0 ? (
        <div className="sam-card">
          <EmptyState
            icon={<ListChecks size={30} />}
            text={tasks.length === 0 ? 'Aucune tâche pour le moment' : 'Aucune tâche ne correspond'}
            sub={
              tasks.length === 0
                ? 'Créez une première tâche pour préparer un événement : elle sera visible par toute l’équipe.'
                : 'Essayez un autre filtre ou une autre recherche.'
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {groupes.map((groupe) => {
            const termine = groupe.faites === groupe.total;
            return (
              <div key={groupe.nom} className="sam-card" style={{ padding: 22 }}>
                <div
                  className="flex items-center justify-between flex-wrap gap-3"
                  style={{
                    marginBottom: 16,
                    paddingBottom: 14,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <h3 className="sam-display" style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>
                    {groupe.nom}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 12.5, color: THEME.textMuted, whiteSpace: 'nowrap' }}>
                      {groupe.faites}/{groupe.total} fait{groupe.faites > 1 ? 's' : ''}
                    </span>
                    <div
                      style={{
                        width: 90,
                        height: 6,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.07)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${groupe.total ? (groupe.faites / groupe.total) * 100 : 0}%`,
                          height: '100%',
                          borderRadius: 999,
                          background: termine
                            ? THEME.success
                            : `linear-gradient(90deg, ${THEME.goldLight}, ${THEME.gold})`,
                          boxShadow: termine ? 'none' : '0 0 12px rgba(212,167,44,0.6)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {groupe.items.map((t) => {
                    const retard = !t.fait && t.dateEcheance && t.dateEcheance < today;
                    return (
                      <div
                        key={t.id}
                        className="flex items-start gap-3"
                        style={{
                          padding: '14px 16px',
                          borderRadius: 16,
                          background: t.fait ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.035)',
                          border: `1px solid ${retard ? 'rgba(224,82,82,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => actions.toggleTask(t.id)}
                          aria-label={t.fait ? 'Marquer comme à faire' : 'Marquer comme faite'}
                          className={`sam-checkbox ${t.fait ? 'checked' : ''}`}
                          style={{ marginTop: 2 }}
                        >
                          {t.fait && <Check size={13} color="#071525" strokeWidth={3} />}
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: t.fait ? THEME.textMuted : THEME.text,
                              textDecoration: t.fait ? 'line-through' : 'none',
                              wordBreak: 'break-word',
                            }}
                          >
                            {t.titre}
                          </div>

                          {t.note && (
                            <div
                              style={{
                                fontSize: 12.5,
                                color: THEME.textMuted,
                                marginTop: 5,
                                lineHeight: 1.55,
                                wordBreak: 'break-word',
                                /* Conserve les retours à la ligne saisis. */
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {t.note}
                            </div>
                          )}

                          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 9 }}>
                            {!t.fait && <PriorityTag priorite={t.priorite} />}
                            {t.dateEcheance && (
                              <span
                                className="flex items-center gap-1"
                                style={{
                                  fontSize: 12,
                                  color: retard ? '#F3A5A5' : THEME.textMuted,
                                  fontWeight: retard ? 700 : 500,
                                }}
                              >
                                <Calendar size={12} />
                                {formatDate(t.dateEcheance)}
                                {retard && ' · en retard'}
                              </span>
                            )}
                            {t.fait && <Badge status="Terminée" label="Terminée" />}
                          </div>
                        </div>

                        <div className="flex gap-2" style={{ flexShrink: 0 }}>
                          <button
                            className="sam-btn sam-btn-ghost sam-btn-sm"
                            onClick={() => setModalTask(t)}
                            aria-label="Modifier la tâche"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className="sam-btn sam-btn-danger sam-btn-sm"
                            onClick={() => setDeleteTask(t)}
                            aria-label="Supprimer la tâche"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal
        open={modalTask !== undefined}
        onClose={() => setModalTask(undefined)}
        task={modalTask}
        evenements={evenements}
        actions={actions}
        notify={notify}
      />

      <ConfirmDialog
        open={!!deleteTask}
        onCancel={() => setDeleteTask(null)}
        danger
        title="Supprimer cette tâche ?"
        message={deleteTask ? `"${deleteTask.titre}" sera définitivement supprimée.` : ''}
        confirmLabel="Supprimer"
        onConfirm={async () => {
          await actions.deleteTask(deleteTask.id);
          setDeleteTask(null);
        }}
      />
    </div>
  );
}
