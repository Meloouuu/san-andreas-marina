/* Déclenche manuellement un déploiement de l'application sur Dokploy.

   À lancer depuis la racine du projet :

       node deploy-dokploy.mjs

   La clé d'API est lue dans le fichier `.env.local` (variable
   DOKPLOY_API_KEY), qui n'est pas suivi par git : le dépôt étant public,
   la clé ne doit jamais apparaître dans le code.

       DOKPLOY_API_KEY=votre_cle_ici

   Elle peut aussi être fournie par une variable d'environnement du même
   nom, qui a la priorité (pratique dans un pipeline).

   Le script n'affiche jamais la clé : en cas d'erreur, il indique
   seulement le code de réponse et le message renvoyé par Dokploy. */

import { readFileSync } from 'node:fs';

const URL_DEPLOIEMENT = 'https://dokploy.acerom-app-service.com/api/application.deploy';

/* L'identifiant de l'application n'est pas un secret : seul l'appairage
   avec la clé d'API permet de lancer un déploiement. */
const APPLICATION_ID = 'dOOepo39k6nO4CbWNPil5';

/* Même lecture de `.env` que scripts/hash-passwords.mjs : le projet n'a pas
   de dépendance dotenv et il est inutile d'en ajouter une pour deux lignes. */
function lireEnv() {
  const variables = {};
  for (const fichier of ['.env.local', '.env']) {
    let contenu;
    try {
      contenu = readFileSync(new URL(`./${fichier}`, import.meta.url), 'utf8');
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
const cleApi = process.env.DOKPLOY_API_KEY || env.DOKPLOY_API_KEY;
const applicationId = process.env.DOKPLOY_APPLICATION_ID || APPLICATION_ID;

if (!cleApi) {
  console.error("❌ DOKPLOY_API_KEY introuvable.");
  console.error("   Ajoutez cette ligne dans le fichier .env.local, à la racine du projet :");
  console.error('   DOKPLOY_API_KEY=votre_cle');
  process.exit(1);
}

console.log(`Déploiement de l'application ${applicationId} sur Dokploy...`);

let reponse;
try {
  reponse = await fetch(URL_DEPLOIEMENT, {
    method: 'POST',
    headers: {
      'x-api-key': cleApi,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ applicationId }),
    /* Sans cela, une redirection 301/302 transformerait le POST en GET et le
       déploiement ne partirait pas, sans que rien ne le signale. */
    redirect: 'manual',
  });
} catch (erreur) {
  console.error('❌ Serveur Dokploy injoignable :', erreur.message);
  process.exit(1);
}

if (reponse.status >= 300 && reponse.status < 400) {
  console.error(`❌ Dokploy renvoie une redirection (${reponse.status}) vers :`);
  console.error(`   ${reponse.headers.get('location') || 'destination inconnue'}`);
  console.error('   Corrigez URL_DEPLOIEMENT en haut de ce fichier avec cette adresse.');
  process.exit(1);
}

const corps = await reponse.text();

if (!reponse.ok) {
  console.error(`❌ Déploiement refusé (code ${reponse.status}).`);
  if (reponse.status === 401 || reponse.status === 403) {
    console.error("   Clé d'API invalide ou expirée : régénérez-la dans Dokploy,");
    console.error('   puis remplacez DOKPLOY_API_KEY dans .env.local.');
  }
  if (corps) console.error(`   Réponse : ${corps.slice(0, 500)}`);
  process.exit(1);
}

console.log(`✔  Déploiement déclenché (code ${reponse.status}).`);
if (corps) console.log(`   Réponse : ${corps.slice(0, 500)}`);
