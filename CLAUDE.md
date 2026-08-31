# CLAUDE.md — Contexte du projet

Ce fichier décrit l'architecture, les conventions et les pièges du projet.
Lis-le avant toute modification.

---

## Le projet

Application web de gestion interne pour **San Andreas Marina**, une entreprise
fictive de GTA RP qui loue des bateaux et des hélicoptères et délivre des permis.
L'interface est intégralement en français. Utilisateurs finaux : les employés
de l'entreprise, non techniciens.

Trois pôles : **location** (garage, planning, locations), **permis** (candidats,
registre, délivrance), **entreprise** (employés, revenus, administration).

---

## Stack

React 18 + Vite. Supabase pour les données. Recharts pour les graphiques,
Lucide pour les icônes. Pas de TypeScript, pas de routeur, pas de state manager,
pas de Tailwind.

```
src/
├── main.jsx              point d'entrée
├── App.jsx               orchestration seule : state, chargement, routage
├── theme.js              THEME, LOGO (base64 ~144 Ko), SESSION_KEY
├── lib/
│   ├── supabase.js       client Supabase (clés via variables d'environnement)
│   ├── supabaseDb.js     toutes les lectures et écritures en base
│   ├── sessionStore.js   persistance de la session (localStorage) uniquement
│   ├── utils.js          fonctions pures : dates, formatage, identifiants
│   ├── stats.js          calculs métier : stats, disponibilité, lookups db.*
│   └── password.js       hachage et vérification des mots de passe (PBKDF2)
├── hooks/
│   └── useAppActions.js  toute la logique CRUD Supabase (voir plus bas)
├── components/
│   ├── ui/               composants réutilisables (Badge, Avatar, Modal…)
│   └── layout/           Sidebar, MobileTopBar, MobileDrawer, NotificationBell
└── pages/
    └── *.jsx             une page par fichier, ses modales à côté
                          (ex. GaragePage.jsx contient aussi AddVehicleModal,
                          EditVehicleModal, AddMaintenanceModal)
```

Ce découpage date d'un refactor complet de l'ancien `App.jsx` monolithique
(~7600 lignes, 94 composants). Il n'y a plus de raison de tout remettre dans
un seul fichier : le propriétaire du projet a validé le découpage en dossiers
ci-dessus. Respecte-le en ajoutant du code au bon endroit plutôt qu'en
grossissant `App.jsx` à nouveau.

Note : `seedDatabase()` (données de démonstration) a été supprimé — c'était du
code mort, jamais appelé depuis le passage à Supabase.

### État et données

Tout l'état vit dans `App` (`App.jsx`) : `db` (objet unique contenant `users`,
`vehicles`, `categories`, `rentals`, `permits`, `citizens`, `maintenances`,
`professionalAppointments`) et `session` (utilisateur connecté).

Le routage est un simple `switch` sur `page` dans `renderPage()`, dans `App.jsx`.

### Le pattern des actions

Toutes les écritures passent par l'objet `actions`, construit par le hook
`useAppActions({ db, setDb, notify })` (`src/hooks/useAppActions.js`) et transmis
en propriété aux pages depuis `App.jsx`.

La plupart des entités (véhicules, catégories, citoyens, permis, rendez-vous,
employés) partagent le même schéma add/update/delete via la fabrique
`makeCrudActions()` définie en haut de `useAppActions.js` :

```js
saveEntity: async (entity) => {
  const { saveVehicle } = await import('../lib/supabaseDb');
  return saveVehicle(entity);          // 1. base
},
// puis, en interne : setDb(prev => ({ ...prev, ... }))  // 2. écran
//                    notify('...', 'success')            // 3. retour utilisateur
```

Pour ajouter une entité qui suit ce schéma standard, ajoute un appel à
`makeCrudActions()` plutôt que de réécrire le trio try/save/setDb/notify à la
main. Les locations (`addRental`/`updateRental`) restent des actions à part car
elles doivent aussi répercuter le changement de statut sur le véhicule associé
(voir l'effet de bord ci-dessous) — cette règle est isolée dans
`deriveVehicleStatusForRentalStatut()` (`src/lib/stats.js`).

`useAppActions` dépend de `[db]` : plusieurs actions lisent `db` pour retrouver
la ligne courante avant de la modifier. Ne repasse pas cette dépendance à `[]`.

**Effets de bord à ne pas oublier.** Créer ou modifier une location change aussi
le statut du véhicule (Disponible → Réservé → Loué → Disponible). Ce changement
doit être enregistré par un `saveVehicle` séparé, sinon il est perdu au
rechargement. Ce bug a déjà été corrigé une fois.

---

## Pièges connus

### 1. Formats de date renvoyés par Supabase

Les colonnes de dates sont de type `timestamp`, pas `date`. Supabase renvoie
donc `"2026-08-30T00:00:00+00:00"` alors que l'application compare les dates
sous forme de texte au format `"AAAA-MM-JJ"`.

`"2026-08-30T00:00:00+00:00" <= "2026-08-30"` vaut **faux** : une location du
jour disparaissait des statistiques de la semaine.

`loadDatabase()` normalise donc tout via `toDate()` et `toTime()`. **Toute
nouvelle colonne de date ou d'heure doit passer par ces fonctions.**

### 2. Nommage : camelCase côté application, snake_case côté base

`dateNaissance` dans l'application, `date_naissance` en base. La traduction se
fait uniquement dans `supabaseDb.js` : les fonctions `map*` pour la lecture, les
fonctions `save*` pour l'écriture. Aucun nom de colonne SQL ne doit apparaître
dans `App.jsx`.

### 3. Pas de balises `<form>`

L'application a été déployée un temps dans un environnement où les formulaires
étaient bloqués par la sandbox du navigateur : plus rien ne se validait. Toutes
les fenêtres modales utilisent des `<div>` avec des boutons `type="button"` et
un `onClick`. La validation des champs est manuelle, avec `notify()` en cas
d'erreur. **N'introduis pas de `<form>`.**

### 4. Les classes utilitaires sont maison

`flex`, `gap-3`, `items-center` et consorts ressemblent à Tailwind mais Tailwind
**n'est pas installé**. Ces classes sont définies à la main dans `GlobalStyles`.
Si tu utilises une classe utilitaire qui n'y figure pas, elle ne fera rien
silencieusement. Ajoute-la ou utilise un style en ligne.

### 5. Photos de profil

Les photos sont redimensionnées en 256×256 via un canvas avant enregistrement.
Sans ça, une photo de téléphone saturerait la ligne en base. Garde le
redimensionnement si tu touches à cette partie (`ProfilePage`).

### 6. Identifiants

Générés côté client par `uid(prefix)`, sous forme de texte (`v_a3f9c2`,
`cat_x8k1`). Les colonnes `id` doivent donc être de type `text` et non `uuid`.

---

## Sécurité — limites assumées et connues

Le propriétaire du projet en a été informé. Ne les présente pas comme
résolues, et ne les aggrave pas.

- **Les mots de passe sont hachés** (PBKDF2-SHA256, sel aléatoire, 210 000
  itérations) par `src/lib/password.js`. Ils ne sont plus lisibles : ni dans
  l'onglet réseau, ni dans `db.users`, ni dans l'interface. On ne peut que les
  remplacer, jamais les consulter. Ce qui reste vrai :
  - la vérification a lieu **dans le navigateur** (`authenticateUser()` dans
    `supabaseDb.js` lit l'empreinte du seul compte concerné) ; le hachage
    protège le mot de passe lui-même, pas l'accès à la base ;
  - avec la clé anonyme, un visiteur peut toujours lire la table `users` et
    ses empreintes. Seules des politiques RLS, ou Supabase Auth, y remédient.
  - **Ne remets jamais `select('*')` sur la table `users`** et ne fais jamais
    entrer de mot de passe dans l'état `db` : ce sont les deux fuites qui ont
    été refermées.
- **Les permissions ne sont vérifiées que dans l'interface.** Les boutons
  d'administration sont masqués aux employés, mais rien n'empêche de contourner
  cela depuis la console. Il faudrait des politiques RLS côté Supabase.
- **Le dépôt est public** : ne place jamais de clé ni de mot de passe dans le
  code. Les clés Supabase passent par `.env`, qui est ignoré par git.

---

## Base de données

Tables : `categories`, `users`, `citizens`, `vehicles`, `vehicle_notes`,
`permits`, `rentals`, `maintenances`, `professional_appointments`, `tasks`.

`loadDatabase()` les charge toutes en parallèle au démarrage et lève une
exception si l'une échoue, ce qui déclenche l'écran « Connexion à la base
impossible ».

**Exception : `tasks`.** Cette table (to-do list) est chargée dans le même
`Promise.all` mais son erreur n'est **pas** fatale — elle est seulement
signalée par un `console.warn` et la liste retombe sur `[]`. Raison : la table
a été ajoutée après coup et doit être créée à la main dans Supabase
(`sql/create_tasks_table.sql`) ; sans ce traitement, un projet où le SQL n'a
pas encore été exécuté verrait tout le site tomber sur l'écran d'erreur.
Garde ce comportement si tu touches à `loadDatabase()`.

Les écritures utilisent `upsert` avec `onConflict: 'id'` : la même fonction sert
à créer et à modifier.

---

## Commandes

```bash
npm install
npm run dev      # développement, http://localhost:5173
npm run build    # production, sortie dans dist/
```

Utilitaire ponctuel, à lancer une seule fois pour convertir en empreintes les
mots de passe encore stockés en clair (les employés gardent le même mot de
passe, seul son stockage change) :

```bash
node scripts/hash-passwords.mjs
```

Déploiement automatique sur GitHub Pages à chaque envoi sur `main`, via
`.github/workflows/deploy.yml`.

Variables d'environnement nécessaires, dans un fichier `.env` à la racine :

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## Conventions de style

Interface **entièrement en français**, y compris les messages d'erreur, les
notifications et les commentaires du code.

Palette imposée, définie dans `THEME` : bleu marine `#071525`, panneaux
`#10283F`, or `#D4A72C`. L'or est réservé aux accents (boutons, onglet actif,
bordures, titres). Ambiance voulue : marina privée haut de gamme, sobre et
professionnelle. Pas d'emojis dans la navigation, ils avaient été remplacés par
des icônes Lucide monochromes pour cette raison.

Deux polices : Cormorant Garamond pour les titres via la classe `sam-display`,
Manrope pour le reste.

Les classes CSS sont préfixées `sam-`.

Direction artistique détaillée (palette complète, typographie, spécifications
des composants, espacements, ombres) : voir [design.md](design.md).

---

## Avant de livrer une modification

Le propriétaire n'est pas développeur et teste directement en production. Un
build qui passe ne suffit pas : vérifie que le parcours concerné fonctionne
réellement. Les bugs les plus coûteux de ce projet n'étaient pas des erreurs de
syntaxe mais des régressions silencieuses — une donnée qui ne s'enregistre plus,
une mise en page qui s'effondre, une fonction appelée mais jamais exportée.

Vérifie systématiquement que chaque fonction importée depuis `supabaseDb.js`
(par `useAppActions.js` ou par une page) y existe bien : ce décalage s'est déjà
produit deux fois. De même, un composant utilisé dans un fichier de `pages/`
ou `components/` doit y être importé explicitement — Vite ne signale pas à la
compilation une variable non définie utilisée en JSX, l'erreur n'apparaît que
dans la console du navigateur au moment du rendu.
