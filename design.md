# design.md — Direction artistique San Andreas Marina

Ce fichier documente la DA telle qu'elle existe réellement dans le code
(`THEME` et `GlobalStyles` dans [App.jsx](src/App.jsx)). Il ne redéfinit rien :
c'est une photographie de l'existant, à tenir à jour si la palette ou les
composants évoluent. Pour l'architecture et les pièges techniques, voir
[CLAUDE.md](CLAUDE.md).

---

## 1. Positionnement

Marina privée haut de gamme, sobre et professionnelle. L'interface s'adresse à
des employés non techniciens d'une entreprise RP de location de bateaux et
d'hélicoptères — pas à des joueurs, pas de ton "gaming". Référence visuelle :
yacht-club / conciergerie de luxe plutôt que tableau de bord SaaS générique.

Deux règles qui découlent de ce positionnement et qui ont déjà été appliquées
dans le code :

- **Pas d'emoji dans la navigation ni les icônes structurelles** — remplacés
  par des icônes [Lucide](https://lucide.dev) monochromes, teintées or au survol
  et à l'état actif.
- **L'or est un accent, pas une couleur de fond.** Il marque une hiérarchie
  (titre, action principale, onglet actif, bordure au focus) ; il ne doit
  jamais couvrir de grandes surfaces.

Point d'attention : le composant `Badge` (statuts) utilise encore des puces
emoji (🟢🔴🟠🔵🟡⚪) comme indicateur de couleur — un résidu antérieur à la
règle ci-dessus. À corriger vers des puces `<span>` colorées si ce composant
est retouché, mais ce n'est pas un blocant.

---

## 2. Palette de couleurs

Définie dans `const THEME` ([App.jsx:79](src/App.jsx#L79)). **Aucune couleur
ne doit être codée en dur ailleurs dans le fichier** : toujours passer par
`THEME.xxx`.

| Rôle | Variable | Valeur | Usage |
|---|---|---|---|
| Fond principal | `THEME.bg` | `#071525` | Fond de `.sam-root`, overlay de modale (assombri) |
| Fond secondaire | `THEME.bg2` | `#0B1F33` | Fond des champs de saisie, fond des onglets segmentés |
| Carte | `THEME.card` | `#10283F` | Fond de `.sam-card` (panneaux, modales, StatCard) |
| Carte claire | `THEME.cardLight` | `#15304A` | Variante de survol / sur-élévation d'une carte |
| Or | `THEME.gold` | `#D4A72C` | Accent principal : boutons primaires, bordure active, icônes actives |
| Or clair | `THEME.goldLight` | `#F0C75E` | Dégradé avec `gold`, texte sur fond sombre mis en valeur (titres de modale, onglet actif) |
| Texte | `THEME.text` | `#FFFFFF` | Texte principal |
| Texte atténué | `THEME.textMuted` | `#AAB7C4` | Labels, sous-titres, texte secondaire |
| Succès | `THEME.success` | `#20C77A` | Statuts positifs (Disponible, En cours, Actif, Valide, Excellent) |
| Erreur | `THEME.error` | `#E05252` | Statuts négatifs (Maintenance, Annulée, Refusé) |
| Avertissement | `THEME.warn` | `#F0C75E` | Statuts intermédiaires (En attente, À surveiller) — même valeur que `goldLight` |
| Bordure | `THEME.border` | `rgba(212,167,44,0.14)` | Bordure par défaut des cartes, séparateurs de tableau |

### Couleurs dérivées (non centralisées dans THEME)

Ces teintes reviennent dans plusieurs composants mais ne sont pas dans
`THEME` — les respecter si de nouveaux composants suivent le même besoin :

| Usage | Valeur |
|---|---|
| Texte badge succès | `#4CDB9B` |
| Texte badge erreur / danger | `#F3A5A5` |
| Texte badge info | `#8FC1F5` |
| Fond bouton danger | `rgba(224,82,82,0.12)` |
| Fond bouton danger (hover) | `rgba(224,82,82,0.2)` |
| Scrim de modale | `rgba(3,10,18,0.72)` + `backdrop-filter: blur(3px)` |
| Scrim de survol overlay avatar | `rgba(7,21,37,0.72)` |

### Mapping sémantique des statuts (`statusTone`, [App.jsx:186](src/App.jsx#L186))

| Statut métier | Tonalité | Couleur |
|---|---|---|
| Disponible, En cours, Actif, Valide, Excellent | `success` | vert `#20C77A` / texte `#4CDB9B` |
| Loué, Bon | `gold` | or |
| Réservé(e) | `info` | bleu `#8FC1F5` |
| Maintenance, Annulée, Refusé | `error` | rouge `#E05252` / texte `#F3A5A5` |
| En attente, À surveiller | `warn` | or clair `#F0C75E` |
| Terminée, Annulé, Inactif | `neutral` | `textMuted` |

**Règle :** un nouveau statut métier doit être ajouté à cette table avant
d'être affiché — sinon il retombe silencieusement sur `neutral`.

---

## 3. Typographie

Deux polices, importées depuis Google Fonts dans `GlobalStyles`
([App.jsx:254](src/App.jsx#L254)) :

| Police | Rôle | Classe | Graisses chargées |
|---|---|---|---|
| **Cormorant Garamond** (serif) | Titres, montants, identité de marque | `.sam-display` | 500, 600, 700, 700 italique |
| **Manrope** (sans-serif) | Tout le reste : corps de texte, labels, boutons, tableaux | (police par défaut de `.sam-root`) | 400, 500, 600, 700, 800 |

Cette paire crée le contraste "conciergerie" : le serif élégant pour ce qui
doit paraître précieux (nom de l'entreprise, titres de page, valeurs
chiffrées des `StatCard`), le sans-serif neutre pour tout ce qui est
fonctionnel et dense en information.

### Échelle de taille observée

| Contexte | Taille | Poids |
|---|---|---|
| Titre de page (`PageHeader`) | 30px | 700 |
| Titre de modale | 21px | 700 |
| Titre de section / carte | 16–19px | 700 |
| Valeur `StatCard` | 30px | 700 |
| Corps de texte | 13.5–14.5px | 400–600 |
| Label de champ / en-tête de tableau | 11–12px, majuscules, `letter-spacing: .04–.05em` | 600–700 |
| Badge / pastille | 11–12px | 700 |

Pas d'échelle typographique formalisée en variables : les tailles sont en
`px` directement dans chaque composant. En ajouter une nouvelle, s'aligner
sur les valeurs déjà en usage ci-dessus plutôt que d'introduire une taille
arbitraire.

---

## 4. Composants — spécifications visuelles

### Cartes (`.sam-card`)
Fond `THEME.card`, bordure 1px `THEME.border`, rayon **16px**. Variante
`.sam-card-hover` : légère translation verticale (-2px), bordure dorée
renforcée, ombre `0 10px 30px rgba(0,0,0,0.35)` — transition 180ms.

### Boutons (`.sam-btn`)
Rayon **10px** (8px en taille `sm`), padding `10px 18px`, poids 700.

| Variante | Fond | Texte |
|---|---|---|
| `.sam-btn-gold` (primaire) | dégradé 135° `goldLight → gold` | `#071525` (marine, pas blanc) |
| `.sam-btn-ghost` (secondaire) | transparent, bordure `rgba(255,255,255,0.14)` | `THEME.text` |
| `.sam-btn-danger` | `rgba(224,82,82,0.12)` | `#F3A5A5` |

Retour de survol : `filter: brightness(1.08)` sur le bouton doré, jamais de
changement de layout. Appui : `scale(0.98)`. Désactivé : `opacity: 0.4`.

### Champs de saisie (`.sam-input`)
Fond `THEME.bg2`, rayon 10px, bordure `rgba(255,255,255,0.08)`. Au focus :
bordure or + halo `box-shadow: 0 0 0 3px rgba(212,167,44,0.15)`. Label
toujours visible au-dessus (`.sam-label`), jamais de placeholder-only —
cohérent avec l'absence de `<form>` (voir CLAUDE.md, piège n°3) : la
validation est manuelle, donc le retour visuel du champ doit l'être aussi.

### Badges de statut (`.sam-badge`)
Pilule (`border-radius: 999px`), fond à 12–16% d'opacité de la couleur
sémantique, texte plein. Voir table des statuts en section 2.

### Tableaux (`.sam-table`)
En-têtes en majuscules, `textMuted`, 11px. Lignes séparées par
`rgba(255,255,255,0.05)`, survol `rgba(212,167,44,0.05)`.

### Navigation latérale (`.sam-nav-item`)
État actif : dégradé horizontal `rgba(212,167,44,0.17) → transparent`,
bordure gauche 2px or, icône et texte en `goldLight`/`gold`. C'est le seul
endroit de l'interface où l'or borde un bloc plutôt qu'un simple accent
ponctuel — traitement réservé à "où suis-je dans l'app".

### Onglets segmentés (`.sam-segmented` / `.sam-segment`)
Piste sombre `rgba(7,21,37,0.55)`, onglet actif en dégradé or avec ombre
`0 2px 10px rgba(212,167,44,0.28)`. Sur mobile (`<640px`), le libellé texte
disparaît sur les onglets inactifs pour ne garder que l'icône.

### Modales (`.sam-modal-anim` + structure `Modal`)
Scrim `rgba(3,10,18,0.72)` + flou 3px, carte centrée, animation d'entrée
180ms (translation + scale). Titre en `.sam-display` couleur `goldLight`.
Fermeture toujours disponible via une croix (Lucide `X`) en haut à droite.

### Avatar
Cercle (ou carré à coins arrondis 10px si `square`), dégradé or très
atténué en absence de photo, initiales centrées. Halo `box-shadow` reprenant
`THEME.card` en anneau extérieur pour se détacher du fond.

---

## 5. Espacement, rayons, grille

Pas de système d'espacement formalisé en `rem`/tokens : les valeurs
utilitaires (`.gap-1` à `.gap-6`, `.p-4`) suivent un rythme de **4px** :

| Classe | Valeur |
|---|---|
| `gap-1` | 4px |
| `gap-2` | 8px |
| `gap-3` | 12px |
| `gap-4` | 16px |
| `gap-5` | 20px |
| `gap-6` | 24px |
| `p-4` | 16px |

### Rayons de bordure

| Élément | Rayon |
|---|---|
| Carte | 16px |
| Bouton, champ | 10px |
| Bouton `sm`, onglet | 8–9px |
| Badge, pilule | 999px (plein) |
| Avatar | 50% (cercle) ou 10px (carré) |

### Points de rupture

| Seuil | Effet |
|---|---|
| `max-width: 640px` | onglets segmentés : libellé masqué sauf actif |
| `max-width: 768px` | `.sam-hide-mobile` masqué, padding de contenu réduit à `16px 16px 60px` |
| `min-width: 769px` | `.sam-hide-desktop` masqué, padding de contenu `8px 32px 60px` |

### Classes utilitaires disponibles

`flex`, `grid`, `flex-col`, `flex-wrap`, `items-center`, `items-start`,
`justify-between`, `justify-center`, `justify-end`, `gap-1`…`gap-6`, `p-4`,
`min-w-0`, `fixed`, `inset-0`. **Toute classe hors de cette liste ne fait
rien** (pas de Tailwind installé, voir CLAUDE.md piège n°4) : soit l'ajouter
dans `GlobalStyles`, soit utiliser un style en ligne.

---

## 6. Ombres et animations

| Contexte | Valeur |
|---|---|
| Survol de carte | `0 10px 30px rgba(0,0,0,0.35)` |
| Onglet segmenté actif | `0 2px 10px rgba(212,167,44,0.28)` |
| Anneau autour d'un avatar | `0 0 0 4px THEME.card, 0 6px 20px rgba(0,0,0,0.4)` |
| Focus de champ | `0 0 0 3px rgba(212,167,44,0.15)` |

Durées : micro-interactions à **150–180ms** (`ease`), toasts à **220ms**
(`cubic-bezier(.2,.8,.3,1)`), apparition de modale à **180ms**. Rien
au-dessus de ~250ms — cohérent avec un usage professionnel répété, où une
animation trop longue ralentirait le geste métier plutôt que de le guider.

---

## 7. Icônes

[Lucide](https://lucide.dev) exclusivement, monochromes, trait cohérent.
Couleur par défaut `THEME.textMuted`, passe à `THEME.gold`/`THEME.goldLight`
au survol ou à l'état actif (voir `.sam-nav-icon`). Taille de fermeture de
modale : 20px. Ne pas introduire d'emoji comme icône fonctionnelle (voir
section 1) — seul le composant `Badge` déroge encore à cette règle.

---

## 8. Accessibilité — état actuel et limites connues

Points déjà couverts par le code existant :
- Contraste texte/fond : `#FFFFFF` et `#AAB7C4` sur fond `#071525`/`#10283F`
  sont largement au-dessus du seuil AA (4.5:1).
- États de focus visibles sur les champs (halo or).
- Boutons désactivés visuellement distincts (`opacity: 0.4` + `cursor:
  not-allowed`).

Points non couverts, à garder en tête avant d'ajouter des composants :
- Les statuts (`Badge`) reposent en partie sur la couleur seule ; le texte du
  statut est toujours affiché à côté, ce qui limite le risque, mais les
  puces emoji n'apportent pas d'alternative texte propre (pas d'`aria-label`).
- Pas de `prefers-reduced-motion` géré sur les animations (`samModalIn`,
  `samFadeIn`, `samToastIn`).
- Boutons icône seuls (fermeture de modale, etc.) sans `aria-label` explicite
  à ce jour.

Ce ne sont pas des régressions à corriger dans l'urgence, mais des points à
ne pas aggraver sur les nouveaux écrans.

---

## 9. Ce qu'il ne faut pas faire

- Ne pas coder une couleur en dur si `THEME` a déjà l'équivalent.
- Ne pas étendre l'or à des surfaces larges (fonds de carte, fonds de page) :
  il reste un accent.
- Ne pas ajouter de classe utilitaire type Tailwind sans la déclarer dans
  `GlobalStyles` (section 5).
- Ne pas introduire d'emoji comme icône de navigation ou d'action.
- Ne pas créer de nouveau statut métier sans l'ajouter à `statusTone`
  ([App.jsx:186](src/App.jsx#L186)).
