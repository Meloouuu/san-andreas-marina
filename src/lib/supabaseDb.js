import { supabase } from './supabase';

/* Supabase renvoie les dates differemment selon le type de la colonne :
   une colonne 'date' donne "2026-08-30", une colonne 'timestamp' donne
   "2026-08-30T00:00:00+00:00". L'application compare les dates sous forme
   de texte : sans normalisation, une location du jour n'est plus comptee
   dans la semaine en cours et les graphiques restent vides.
   On ramene donc tout au format JJ attendu : "AAAA-MM-JJ" et "HH:MM". */

function toDate(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toTime(value) {
  if (!value) return '';
  const found = String(value).match(/(\d{2}):(\d{2})/);
  return found ? `${found[1]}:${found[2]}` : String(value);
}

function mapUser(u) {
  return {
    id: u.id || '',
    prenom: u.prenom || '',
    nom: u.nom || '',
    sexe: u.sexe || 'Homme',
    dateNaissance: toDate(u.date_naissance),
    photo: u.photo || '',
    email: u.email || '',
    password: u.password || '',
    telephone: u.telephone || '',
    iban: u.iban || '',
    role: u.role || 'employe',
    dateEntree: toDate(u.date_entree),
    contratSigne: !!u.contrat_signe,
    visiteMedicale: !!u.visite_medicale,
    dateCreation: toDate(u.date_creation),
  };
}

function mapCitizen(c) {
  return {
    id: c.id,
    prenom: c.prenom,
    nom: c.nom,
    telephone: c.telephone || '',
    identifiant: c.identifiant || '',
    photo: c.photo || '',
    dateCreation: toDate(c.date_creation),
  };
}

function mapVehicle(v, notes) {
  return {
    id: v.id,
    nom: v.nom,
    categorieId: v.categorie_id,
    photo: v.photo || '',
    identifiant: v.identifiant || '',
    statut: v.statut,
    etat: v.etat,
    description: v.description || '',
    dateAjout: toDate(v.date_ajout),
    heuresMoteur: Number(v.heures_moteur || 0),
    heuresVol: Number(v.heures_vol || 0),
    notes: notes
      .filter(n => n.vehicule_id === v.id)
      .map(n => ({
        id: n.id,
        text: n.text || '',
        date: toDate(n.date),
        auteur: n.auteur || '',
      })),
  };
}

export async function loadDatabase() {
  const [
    categoriesRes,
    usersRes,
    citizensRes,
    vehiclesRes,
    notesRes,
    permitsRes,
    rentalsRes,
    maintenancesRes,
    professionalAppointmentsRes,
  ] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('users').select('*'),
    supabase.from('citizens').select('*'),
    supabase.from('vehicles').select('*'),
    supabase.from('vehicle_notes').select('*'),
    supabase.from('permits').select('*'),
    supabase.from('rentals').select('*'),
    supabase.from('maintenances').select('*'),
    supabase.from('professional_appointments').select('*'),
  ]);

  const results = [
    categoriesRes,
    usersRes,
    citizensRes,
    vehiclesRes,
    notesRes,
    permitsRes,
    rentalsRes,
    maintenancesRes,
    professionalAppointmentsRes,
  ];

  const failed = results.find(r => r && r.error);

  if (failed) {
    throw failed.error;
  }

  return {
    categories: categoriesRes.data || [],

    users: (usersRes.data || []).map(mapUser),

    citizens: (citizensRes.data || []).map(mapCitizen),

    vehicles: (vehiclesRes.data || []).map(v =>
      mapVehicle(v, notesRes.data || [])
    ),

    permits: (permitsRes.data || []).map(p => ({
      id: p.id,
      numero: p.numero,
      citizenId: p.citizen_id,
      type: p.type,
      formateurId: p.formateur_id,
      date: toDate(p.date),
      statut: p.statut,
    })),

    rentals: (rentalsRes.data || []).map(r => ({
      id: r.id,
      numero: r.numero,
      vehiculeId: r.vehicule_id,
      employeId: r.employe_id,
      citizenId: r.citizen_id,
      client: r.client,
      telephone: r.telephone || '',
      prix: Number(r.prix || 0),
      date: toDate(r.date),
      heure: toTime(r.heure),
      duree: r.duree || '',
      statut: r.statut,
      notes: r.notes || '',
    })),

    maintenances: (maintenancesRes.data || []).map(m => ({
      id: m.id,
      vehiculeId: m.vehicule_id,
      date: toDate(m.date),
      type: m.type,
      cout: Number(m.cout || 0),
      responsable: m.responsable || '',
      commentaire: m.commentaire || '',
    })),

    professionalAppointments:
      (professionalAppointmentsRes.data || []).map(a => ({
        id: a.id,
        titre: a.titre || '',
        date: toDate(a.date),
        heureDebut: toTime(a.heure_debut),
        heureFin: toTime(a.heure_fin),
        contact: a.contact || '',
        telephone: a.telephone || '',
        lieu: a.lieu || '',
        notes: a.notes || '',
        statut: a.statut || 'Prévu',
        dateCreation: toDate(a.date_creation),
      })),
  };
}
export async function saveVehicle(vehicle) {
  const { error } = await supabase
    .from('vehicles')
    .upsert({
      id: vehicle.id,
      nom: vehicle.nom,
      categorie_id: vehicle.categorieId || null,
      photo: vehicle.photo || '',
      identifiant: vehicle.identifiant || null,
      statut: vehicle.statut || '',
      etat: vehicle.etat || '',
      description: vehicle.description || '',
      date_ajout: vehicle.dateAjout || null,
      heures_moteur: Number(vehicle.heuresMoteur || 0),
      heures_vol: Number(vehicle.heuresVol || 0),
    }, { onConflict: 'id' });

  if (error) throw error;
}

export async function deleteVehicle(vehicleId) {
  // Les notes internes partent d'abord : une cle etrangere pourrait
  // sinon empecher la suppression du vehicule.
  const { error: notesError } = await supabase
    .from('vehicle_notes')
    .delete()
    .eq('vehicule_id', vehicleId);

  if (notesError) {
    console.error('Erreur Supabase (notes du vehicule) :', notesError);
    throw notesError;
  }

  const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);

  if (error) {
    console.error('Erreur Supabase (suppression vehicule) :', error);
    throw error;
  }
}

// upsert et non update : la meme fonction sert a creer une nouvelle
// categorie et a modifier une categorie existante.
export async function saveCategory(category) {
  const { data, error } = await supabase
    .from('categories')
    .upsert(
      {
        id: category.id,
        nom: category.nom,
        description: category.description || '',
        icone: category.icone || '',
        statut: category.statut || 'Actif',
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Erreur Supabase (categories) :', error);
    throw error;
  }

  return data;
}

export async function deleteCategory(categoryId) {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);

  if (error) {
    console.error('Erreur Supabase (suppression categorie) :', error);
    throw error;
  }
}
export async function saveCitizen(citizen) {

  const { data, error } = await supabase
    .from('citizens')
    .upsert({
      id: citizen.id,
      prenom: citizen.prenom,
      nom: citizen.nom,
      telephone: citizen.telephone || '',
      identifiant: citizen.identifiant || '',
      photo: citizen.photo || '',
      date_creation: citizen.dateCreation || null,
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('❌ ERREUR SUPABASE citoyen :', error);
    throw error;
  }


  return data;
}

export async function deleteCitizen(citizenId) {

  const { error } = await supabase
    .from('citizens')
    .delete()
    .eq('id', citizenId);

  if (error) {
    console.error('❌ ERREUR SUPPRESSION CITOYEN :', error);
    throw error;
  }

}
export async function savePermit(permit) {

  const { data, error } = await supabase
    .from('permits')
    .upsert({
      id: permit.id,
      numero: permit.numero,
      citizen_id: permit.citizenId || null,
      type: permit.type || '',
      formateur_id: permit.formateurId || null,
      date: permit.date || null,
      statut: permit.statut || '',
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('❌ ERREUR SUPABASE permis :', error);
    throw error;
  }


  return data;
}
export async function saveVehicleNote(note) {

  const { data, error } = await supabase
    .from('vehicle_notes')
    .insert({
      id: note.id,
      vehicule_id: note.vehicleId,
      text: note.text || '',
      date: note.date || null,
      auteur: note.auteur || '',
    })
    .select()
    .single();

  if (error) {
    console.error('❌ ERREUR SUPABASE vehicle_notes :', error);
    throw error;
  }


  return data;
}


export async function saveMaintenance(maintenance) {

  const { data, error } = await supabase
    .from('maintenances')
    .upsert({
      id: maintenance.id,
      vehicule_id: maintenance.vehiculeId,
      date: maintenance.date || null,
      type: maintenance.type || '',
      cout: Number(maintenance.cout || 0),
      responsable: maintenance.responsable || '',
      commentaire: maintenance.commentaire || '',
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('❌ ERREUR SUPABASE maintenances :', error);
    throw error;
  }


  return data;
}


export async function saveRental(rental) {

  const { data, error } = await supabase
    .from('rentals')
    .upsert({
      id: rental.id,
      numero: rental.numero || '',
      vehicule_id: rental.vehiculeId || null,
      employe_id: rental.employeId || null,
      citizen_id: rental.citizenId || null,
      client: rental.client || '',
      telephone: rental.telephone || '',
      prix: Number(rental.prix || 0),
      date: rental.date || null,
      heure: rental.heure || null,
      duree: rental.duree || null,
      statut: rental.statut || '',
      notes: rental.notes || '',
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('❌ ERREUR SUPABASE rentals :', error);
    throw error;
  }


  return data;
}


export async function deleteRental(rentalId) {

  const { error } = await supabase
    .from('rentals')
    .delete()
    .eq('id', rentalId);

  if (error) {
    console.error('❌ ERREUR SUPPRESSION LOCATION :', error);
    throw error;
  }

}
export async function saveUser(user) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      prenom: user.prenom || '',
      nom: user.nom || '',
      sexe: user.sexe || '',
      date_naissance: user.dateNaissance || null,
      photo: user.photo || '',
      email: user.email || '',
      telephone: user.telephone || '',
      iban: user.iban || '',
      role: user.role || '',
      date_entree: user.dateEntree || null,
      contrat_signe: user.contratSigne || false,
      visite_medicale: user.visiteMedicale || false,
      date_creation: user.dateCreation || null,
      password: user.password || '',
    })
    .select()
    .single();

  if (error) {
    console.error('❌ ERREUR SUPABASE users :', error);
    throw error;
  }

  return data;
}

export async function updateUser(id, user) {
  return saveUser({
    ...user,
    id,
  });
}

export async function deleteUser(id) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ ERREUR SUPABASE suppression user :', error);
    throw error;
  }
}
export async function saveProfessionalAppointment(appointment) {
  const row = {
    id: appointment.id,
    titre: appointment.titre,
    date: appointment.date,
    heure_debut: appointment.heureDebut,
    heure_fin: appointment.heureFin,
    contact: appointment.contact || '',
    telephone: appointment.telephone || '',
    lieu: appointment.lieu || '',
    notes: appointment.notes || '',
    statut: appointment.statut || 'Prévu',
  };

  const { error } = await supabase
    .from('professional_appointments')
    .upsert(row);

  if (error) {
    throw error;
  }
}

export async function deleteProfessionalAppointment(id) {
  const { error } = await supabase
    .from('professional_appointments')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}
