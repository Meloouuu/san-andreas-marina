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
├── App.jsx               TOUTE l'application (~7600 lignes, 94 composants)
└── lib/
    ├── supabase.js       client Supabase (clés via variables d'environnement)
    └── supabaseDb.js     toutes les lectures et écritures en base
```

---

## Architecture d'App.jsx

Un seul fichier, volontairement. Découper aiderait la lisibilité mais
compliquerait les allers-retours avec le propriétaire du projet, qui remplace
souvent le fichier entier. **Ne le découpe pas sans le lui demander.**

Ordre du fichier :

1. Imports, `THEME`, `LOGO` (le logo est un base64 de ~144 Ko, ligne 98 — ne
   le touche pas, ne le reformate pas)
2. Fonctions utilitaires (dates, formatage, identifiants)
3. `seedDatabase()` — données de démonstration, plus utilisées depuis Supabase,
   conservées comme référence de la forme des données
4. `GlobalStyles` — **tout le CSS de l'application** dans une balise `<style>`
5. Composants réutilisables (Badge, Avatar, Modal, StatCard…)
6. Pages, dans l'ordre de la navigation
7. `store` — persistance de la session uniquement
8. `App` — état global, chargement, actions, routage

### État et données

Tout l'état vit dans `App` : `db` (objet unique contenant `users`, `vehicles`,
`categories`, `rentals`, `permits`, `citizens`, `maintenances`,
`professionalAppointments`) et `session` (utilisateur connecté).

Le routage est un simple `switch` sur `page` dans `renderPage()`.

### Le pattern des actions

Toutes les écritures passent par l'objet `actions`, transmis en propriété aux
pages. Chaque action suit le même schéma :

```js
addRental: async (data) => {
  try {
    const { saveRental } = await import('./lib/supabaseDb');
    const rental = { id: uid('r'), ...data };
    await saveRental(rental);          // 1. base
    setDb(prev => ({ ...prev, ... })); // 2. écran
    notify('...', 'success');          // 3. retour utilisateur
  } catch (error) {
    notify(`Erreur : ${error.message}`, 'error');
  }
}
```

`actions` dépend de `[db]` : plusieurs actions lisent `db` pour retrouver la
ligne courante avant de la modifier. Ne repasse pas cette dépendance à `[]`.

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

- **Les mots de passe sont en clair** dans la table `users`, lue depuis le
  navigateur avec la clé anonyme. N'importe quel visiteur peut les lire dans
  l'onglet réseau. La correction propre est Supabase Auth.
- **Les permissions ne sont vérifiées que dans l'interface.** Les boutons
  d'administration sont masqués aux employés, mais rien n'empêche de contourner
  cela depuis la console. Il faudrait des politiques RLS côté Supabase.
- **Le dépôt est public** : ne place jamais de clé ni de mot de passe dans le
  code. Les clés Supabase passent par `.env`, qui est ignoré par git.

---

## Base de données

Tables : `categories`, `users`, `citizens`, `vehicles`, `vehicle_notes`,
`permits`, `rentals`, `maintenances`, `professional_appointments`.

`loadDatabase()` les charge toutes en parallèle au démarrage et lève une
exception si l'une échoue, ce qui déclenche l'écran « Connexion à la base
impossible ».

Les écritures utilisent `upsert` avec `onConflict: 'id'` : la même fonction sert
à créer et à modifier.

---

## Commandes

```bash
npm install
npm run dev      # développement, http://localhost:5173
npm run build    # production, sortie dans dist/
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

Vérifie systématiquement que chaque fonction appelée par `App.jsx` existe bien
dans `supabaseDb.js` : ce décalage s'est déjà produit deux fois.
