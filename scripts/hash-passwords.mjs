/* Convertit en une fois tous les mots de passe encore stockes en clair dans
   la table `users`.

   A lancer une seule fois, depuis la racine du projet :

       node scripts/hash-passwords.mjs

   Les mots de passe restent les memes pour les employes : seul leur mode de
   stockage change (voir src/lib/password.js). Le script est sans risque s'il
   est relance : les comptes deja convertis sont ignores.

   Sans ce script, la conversion se fait de toute facon compte par compte,
   a la premiere connexion reussie de chaque employe. */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { hashPassword, isHashed } from '../src/lib/password.js';

function lireEnv() {
  const variables = {};
  for (const fichier of ['.env.local', '.env']) {
    let contenu;
    try {
      contenu = readFileSync(new URL(`../${fichier}`, import.meta.url), 'utf8');
    } catch {
      continue;
    }
    for (const ligne of contenu.split('\n')) {
      const trouve = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (trouve && !variables[trouve[1]]) {
        variables[trouve[1]] = trouve[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return variables;
}

const env = lireEnv();
const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const cle = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!url || !cle) {
  console.error('❌ VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY introuvables (.env.local ou .env).');
  process.exit(1);
}

const supabase = createClient(url, cle);

const { data, error } = await supabase.from('users').select('id, email, password');

if (error) {
  console.error('❌ Lecture de la table users impossible :', error.message);
  process.exit(1);
}

let convertis = 0;
let dejaFaits = 0;
let vides = 0;

for (const utilisateur of data || []) {
  if (!utilisateur.password) {
    vides += 1;
    console.log(`—  ${utilisateur.email} : aucun mot de passe, ignoré.`);
    continue;
  }
  if (isHashed(utilisateur.password)) {
    dejaFaits += 1;
    continue;
  }

  const empreinte = await hashPassword(utilisateur.password);
  const { error: erreurEcriture } = await supabase
    .from('users')
    .update({ password: empreinte })
    .eq('id', utilisateur.id);

  if (erreurEcriture) {
    console.error(`❌ ${utilisateur.email} : ${erreurEcriture.message}`);
    continue;
  }

  convertis += 1;
  console.log(`✔  ${utilisateur.email} : mot de passe chiffré.`);
}

console.log(
  `\nTerminé — ${convertis} converti(s), ${dejaFaits} déjà chiffré(s), ${vides} sans mot de passe.`,
);
