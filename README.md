# San Andreas Marina — Espace professionnel

Application web de gestion interne pour l'entreprise GTA RP **San Andreas Marina**
(location de bateaux, bateaux premium et hélicoptères, délivrance de permis).

---

## Comptes de démonstration

| Rôle | Adresse e-mail | Mot de passe |
|---|---|---|
| Administrateur | `admin@sanandreasmarina.com` | `admin123` |
| Employée | `selina.hunter@sanandreasmarina.com` | `employe123` |

Change ces comptes dès que l'application est en service : ils sont écrits en clair
dans le code source, donc visibles par tout le monde.

---

## Lancer l'application sur ton ordinateur

Il te faut [Node.js](https://nodejs.org) (version LTS).

```bash
npm install     # à faire une seule fois
npm run dev     # lance l'application
```

Ouvre ensuite l'adresse affichée dans le terminal, en général http://localhost:5173

Pour construire la version finale : `npm run build` (le résultat arrive dans `dist/`).

---

## Mettre le site en ligne avec GitHub Pages

Le dépôt contient déjà tout ce qu'il faut. Après avoir envoyé le code sur GitHub :

1. Ouvre ton dépôt sur github.com
2. Onglet **Settings** → menu **Pages** (colonne de gauche)
3. Dans **Source**, choisis **GitHub Actions**

À chaque fois que tu enverras du code sur la branche `main`, le site sera reconstruit
et publié automatiquement sur `https://TON-PSEUDO.github.io/san-andreas-marina/`.

---

## ⚠️ Important : les données ne sont pas partagées

Cette version enregistre tout dans le navigateur de chaque personne
(`localStorage`). Concrètement :

- Chaque employé possède **sa propre copie** des données.
- Si un collègue crée une location, **tu ne la verras pas**.
- Vider le cache du navigateur **efface tout**.
- Les mots de passe sont stockés en clair dans le code, et les permissions sont
  appliquées uniquement dans l'interface. Quelqu'un de motivé peut les contourner
  depuis la console du navigateur.

C'est suffisant pour une démonstration ou un usage personnel, mais pas pour faire
travailler toute une entreprise sur les mêmes données.

### Pour un vrai partage entre employés

Il faut remplacer le stockage local par une base de données en ligne. Le code est
déjà préparé pour ça : tout passe par un seul objet `store` situé en haut de
`src/App.jsx`, juste avant le composant `App`. Il n'y a que ses trois méthodes
(`get`, `set`, `remove`) à réécrire.

[Supabase](https://supabase.com) est un bon choix : offre gratuite suffisante à
cette échelle, base de données, comptes utilisateurs et règles de sécurité
appliquées côté serveur (ce que demande le point 43 du cahier des charges).

---

## Structure du projet

```
├── index.html                    page d'accueil
├── package.json                  dépendances et commandes
├── vite.config.js                configuration de construction
├── .github/workflows/deploy.yml  publication automatique sur GitHub Pages
└── src/
    ├── main.jsx                  point de départ de l'application
    └── App.jsx                   toute l'application
```

## Modules

Location : garage, fiches véhicules, maintenance, locations, planning, historique.
Permis : dossiers candidats, registre, délivrance avec numéro unique automatique.
Entreprise : citoyens, chiffre d'affaires, revenus, documents, administration.

## Technologies

React 18, Vite, Recharts (graphiques), Lucide (icônes).
