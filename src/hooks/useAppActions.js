import { useMemo } from 'react';
import { uid } from '../lib/utils';
import { deriveVehicleStatusForRentalStatut } from '../lib/stats';

/* Fabrique les 3 actions add/update/remove partagees par la plupart des
   entites (vehicules, categories, citoyens, permis, rendez-vous, employes) :
   meme enchainement sauvegarde Supabase -> mise a jour de `db` -> notification.
   Elle existait auparavant en 16 copies presque identiques dans App.jsx. */
function makeCrudActions({ db, setDb, notify, listKey, buildEntity, saveEntity, deleteEntity, label, messages }) {
  return {
    add: async (data) => {
      const entity = buildEntity(data);
      try {
        await saveEntity(entity);
        setDb((prev) => ({
          ...prev,
          [listKey]: [...(prev[listKey] || []), entity],
        }));
        notify(messages.added, 'success');
      } catch (error) {
        console.error(`❌ Erreur ajout ${label} :`, error);
        notify(`Erreur : ${error.message}`, 'error');
      }
    },

    update: async (id, patch) => {
      const current = db[listKey].find((item) => item.id === id);
      if (!current) {
        notify(messages.notFound, 'error');
        return;
      }
      const updated = { ...current, ...patch };
      try {
        await saveEntity(updated);
        setDb((prev) => ({
          ...prev,
          [listKey]: prev[listKey].map((item) => (item.id === id ? updated : item)),
        }));
        notify(messages.updated, 'success');
      } catch (error) {
        console.error(`❌ Erreur modification ${label} :`, error);
        notify(`Erreur : ${error.message}`, 'error');
      }
    },

    remove: async (id) => {
      if (!deleteEntity) return;
      try {
        await deleteEntity(id);
        setDb((prev) => ({
          ...prev,
          [listKey]: prev[listKey].filter((item) => item.id !== id),
        }));
        notify(messages.deleted, 'success');
      } catch (error) {
        console.error(`❌ Erreur suppression ${label} :`, error);
        notify(`Erreur : ${error.message}`, 'error');
      }
    },
  };
}

/* Toute la logique d'ecriture vers Supabase (creer/modifier/supprimer un
   vehicule, une location, un permis...). Chaque action suit le meme schema :
   1. sauvegarde en base, 2. mise a jour de l'ecran, 3. notification. */
export function useAppActions({ db, setDb, notify }) {
  return useMemo(() => {
    if (!db) return {};

    const vehicle = makeCrudActions({
      db, setDb, notify,
      listKey: 'vehicles',
      label: 'véhicule',
      buildEntity: (data) => ({ id: uid('v'), ...data }),
      saveEntity: async (entity) => {
        const { saveVehicle } = await import('../lib/supabaseDb');
        return saveVehicle(entity);
      },
      deleteEntity: async (id) => {
        const { deleteVehicle } = await import('../lib/supabaseDb');
        return deleteVehicle(id);
      },
      messages: {
        added: 'Véhicule ajouté avec succès.',
        updated: 'Véhicule modifié avec succès.',
        deleted: 'Véhicule supprimé.',
        notFound: 'Véhicule introuvable.',
      },
    });

    const category = makeCrudActions({
      db, setDb, notify,
      listKey: 'categories',
      label: 'catégorie',
      buildEntity: (data) => ({ id: data.id || uid('cat'), ...data }),
      saveEntity: async (entity) => {
        const { saveCategory } = await import('../lib/supabaseDb');
        return saveCategory(entity);
      },
      deleteEntity: async (id) => {
        const { deleteCategory } = await import('../lib/supabaseDb');
        return deleteCategory(id);
      },
      messages: {
        added: 'Catégorie ajoutée avec succès.',
        updated: 'Catégorie modifiée avec succès.',
        deleted: 'Catégorie supprimée.',
        notFound: 'Catégorie introuvable.',
      },
    });

    const citizen = makeCrudActions({
      db, setDb, notify,
      listKey: 'citizens',
      label: 'citoyen',
      buildEntity: (data) => ({ id: data.id || uid('cit'), ...data }),
      saveEntity: async (entity) => {
        const { saveCitizen } = await import('../lib/supabaseDb');
        return saveCitizen(entity);
      },
      deleteEntity: async (id) => {
        const { deleteCitizen } = await import('../lib/supabaseDb');
        return deleteCitizen(id);
      },
      messages: {
        added: 'Citoyen ajouté avec succès.',
        updated: 'Citoyen modifié avec succès.',
        deleted: 'Citoyen supprimé avec succès.',
        notFound: 'Citoyen introuvable.',
      },
    });

    const permit = makeCrudActions({
      db, setDb, notify,
      listKey: 'permits',
      label: 'permis',
      buildEntity: (data) => ({ id: data.id || uid('permit'), ...data }),
      saveEntity: async (entity) => {
        const { savePermit } = await import('../lib/supabaseDb');
        return savePermit(entity);
      },
      deleteEntity: null,
      messages: {
        added: 'Dossier de permis ajouté avec succès.',
        updated: 'Permis modifié avec succès.',
        notFound: 'Permis introuvable.',
      },
    });

    const professionalAppointment = makeCrudActions({
      db, setDb, notify,
      listKey: 'professionalAppointments',
      label: 'rendez-vous professionnel',
      buildEntity: (data) => ({ id: data.id || uid('rdv'), ...data }),
      saveEntity: async (entity) => {
        const { saveProfessionalAppointment } = await import('../lib/supabaseDb');
        return saveProfessionalAppointment(entity);
      },
      deleteEntity: async (id) => {
        const { deleteProfessionalAppointment } = await import('../lib/supabaseDb');
        return deleteProfessionalAppointment(id);
      },
      messages: {
        added: 'Rendez-vous professionnel ajouté avec succès.',
        updated: 'Rendez-vous professionnel modifié avec succès.',
        deleted: 'Rendez-vous professionnel supprimé.',
        notFound: 'Rendez-vous introuvable.',
      },
    });

    const user = makeCrudActions({
      db, setDb, notify,
      listKey: 'users',
      label: 'utilisateur',
      buildEntity: (data) => ({ id: data.id || uid('user'), ...data }),
      saveEntity: async (entity) => {
        const { saveUser } = await import('../lib/supabaseDb');
        return saveUser(entity);
      },
      deleteEntity: async (id) => {
        const { deleteUser } = await import('../lib/supabaseDb');
        return deleteUser(id);
      },
      messages: {
        added: 'Utilisateur ajouté avec succès.',
        updated: 'Utilisateur modifié avec succès.',
        deleted: 'Utilisateur supprimé.',
        notFound: 'Utilisateur introuvable.',
      },
    });

    const rental = makeCrudActions({
      db, setDb, notify,
      listKey: 'rentals',
      label: 'location',
      buildEntity: (data) => ({ id: uid('r'), ...data }),
      saveEntity: async (entity) => {
        const { saveRental } = await import('../lib/supabaseDb');
        return saveRental(entity);
      },
      deleteEntity: async (id) => {
        const { deleteRental } = await import('../lib/supabaseDb');
        return deleteRental(id);
      },
      messages: {
        added: 'Location ajoutée avec succès.',
        updated: 'Location modifiée avec succès.',
        deleted: 'Location supprimée.',
        notFound: 'Location introuvable.',
      },
    });

    /* Creer ou modifier une location change aussi le statut du vehicule
       (Disponible -> Reserve/Loue -> Disponible). Ce changement doit etre
       enregistre par un saveVehicle separe, sinon il est perdu au
       rechargement (bug deja corrige une fois, voir CLAUDE.md). */
    async function syncVehicleForRental(rental, statut, { allowRelease }) {
      const vehicle = db.vehicles.find((v) => v.id === rental.vehiculeId);
      const updatedVehicle = deriveVehicleStatusForRentalStatut(vehicle, statut, { allowRelease });
      if (updatedVehicle) {
        const { saveVehicle } = await import('../lib/supabaseDb');
        await saveVehicle(updatedVehicle);
      }
      return updatedVehicle;
    }

    return {
      addVehicle: vehicle.add,
      updateVehicle: vehicle.update,
      deleteVehicle: vehicle.remove,

      addVehicleNote: async (vehicleId, note) => {
        try {
          const { saveVehicleNote } = await import('../lib/supabaseDb');
          const vehicleNote = { id: note.id || uid('note'), vehicleId, ...note };

          await saveVehicleNote(vehicleNote);

          setDb((prev) => ({
            ...prev,
            vehicles: prev.vehicles.map((v) =>
              v.id === vehicleId ? { ...v, notes: [...(v.notes || []), vehicleNote] } : v,
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
          const { saveMaintenance } = await import('../lib/supabaseDb');
          const maintenance = { id: uid('m'), vehiculeId: vehicleId, ...data };

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
        const rentalEntity = { id: uid('r'), ...data };
        try {
          const { saveRental } = await import('../lib/supabaseDb');
          await saveRental(rentalEntity);

          const updatedVehicle = await syncVehicleForRental(rentalEntity, rentalEntity.statut, { allowRelease: false });

          setDb((prev) => ({
            ...prev,
            rentals: [...prev.rentals, rentalEntity],
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
        const current = db.rentals.find((r) => r.id === id);
        if (!current) {
          notify('Location introuvable.', 'error');
          return;
        }
        const updatedRental = { ...current, ...patch };
        try {
          const { saveRental } = await import('../lib/supabaseDb');
          await saveRental(updatedRental);

          const updatedVehicle = patch.statut
            ? await syncVehicleForRental(updatedRental, patch.statut, { allowRelease: true })
            : null;

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

      deleteRental: rental.remove,

      addCategory: category.add,
      updateCategory: category.update,
      deleteCategory: category.remove,

      addCitizen: citizen.add,
      updateCitizen: citizen.update,
      deleteCitizen: citizen.remove,

      addPermitDossier: permit.add,
      updatePermit: permit.update,

      addProfessionalAppointment: professionalAppointment.add,
      updateProfessionalAppointment: professionalAppointment.update,
      deleteProfessionalAppointment: professionalAppointment.remove,

      addUser: user.add,
      updateUser: user.update,
      deleteUser: user.remove,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);
}
