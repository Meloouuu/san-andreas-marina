import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { THEME } from '../theme';
import { addDays, formatDate, fullName, startOfWeek, statusTone, todayISO, weekdayLabel } from '../lib/utils';
import { categoryOf, userOf, vehicleOf } from '../lib/stats';
import { Badge, EmptyState, Modal, PageHeader } from '../components/ui';
import { AddRentalModal } from './RentalsPage';

/* ============================================================
   PLANNING
   ============================================================ */

export function AddProfessionalAppointmentModal({ open, onClose, actions, notify, defaultDate }) {
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

export function RentalChip({ r, db, onClick }) {
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
export function ProfessionalAppointmentChip({ appointment, onClick }) {
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

export function PlanningPage({ db, actions, notify, session }) {
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
