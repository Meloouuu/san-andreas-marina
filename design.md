# design.md — Direction artistique San Andreas Marina

Ce fichier documente la DA telle qu'elle existe réellement dans le code
(`THEME` dans [src/theme.js](src/theme.js) et `GlobalStyles` dans
[src/components/ui/GlobalStyles.jsx](src/components/ui/GlobalStyles.jsx)).
Il ne redéfinit rien : c'est une photographie de l'existant, à tenir à jour
si la palette ou les composants évoluent. Pour l'architecture et les pièges
techniques, voir [CLAUDE.md](CLAUDE.md).

---

## 1. Positionnement

Marina privée haut de gamme, sobre et professionnelle. L'interface s'adresse à
des employés non techniciens d'une entreprise RP de location de bateaux et
d'hélicoptères — pas à des joueurs, pas de ton "gaming". Référence visuelle :
yacht-club / conciergerie de luxe plutôt que tableau de bord SaaS générique.

**Traitement visuel : panneaux de verre sur fond lumineux.** L'interface est
construite comme un rendu 3D sombre — nappes de lumière diffuses en fond,
panneaux translucides floutés qui captent la lumière sur leur arête haute,
halos dorés autour des éléments actifs, formes très arrondies. L'objectif est
une impression de profondeur et de matière, pas d'aplats plats.

Trois règles qui découlent de ce positionnement :

- **Pas d'emoji comme icône structurelle** — icônes [Lucide](https://lucide.dev)
  monochromes, teintées or au survol et à l'état actif. Les puces de statut
  (`Badge`), les médailles de classement (`GoldPodium`) et les puces de
  notification sont rendues en CSS. Seules subsistent les icônes **de données**
  saisies par l'utilisateur (`category.icone` : 🚤 ⭐ 🚁), qui viennent de la
  base et ne sont pas des éléments d'interface.
- **L'or est un accent, pas une couleur de fond.** Il marque une hiérarchie
  (titre, action principale, onglet actif, halo au focus) ; il ne doit jamais
  couvrir de grandes surfaces. Les halos dorés restent diffus et de faible
  opacité (≤ 0,3).
- **La lumière remplace la bordure.** Un élément se détache par son ombre
  portée, son liseré clair intérieur et son halo — pas par un trait franc.

---

## 2. Palette de couleurs

Définie dans `const THEME` ([src/theme.js](src/theme.js)). **Aucune couleur
d'identité ne doit être codée en dur** : toujours passer par `THEME.xxx`.
Les valeurs `rgba()` dérivées ci-dessous sont des déclinaisons de ces mêmes
couleurs (transparence, halo) — elles n'introduisent aucune teinte nouvelle.

| Rôle | Variable | Valeur | Usage |
|---|---|---|---|
| Fond principal | `THEME.bg` | `#071525` | Fond de `.sam-root`, base des nappes lumineuses |
| Fond secondaire | `THEME.bg2` | `#0B1F33` | Dégradés de la barre latérale, fonds de piste des onglets |
| Carte | `THEME.card` | `#10283F` | Base des panneaux de verre |
| Carte claire | `THEME.cardLight` | `#15304A` | Sommet du dégradé des panneaux |
| Or | `THEME.gold` | `#D4A72C` | Accent principal : boutons primaires, icônes actives, halos |
| Or clair | `THEME.goldLight` | `#F0C75E` | Dégradé avec `gold`, titres de modale, texte d'onglet actif |
| Texte | `THEME.text` | `#FFFFFF` | Texte principal |
| Texte atténué | `THEME.textMuted` | `#AAB7C4` | Labels, sous-titres, texte secondaire |
| Succès | `THEME.success` | `#20C77A` | Statuts positifs (Disponible, En cours, Actif, Valide, Excellent) |
| Erreur | `THEME.error` | `#E05252` | Statuts négatifs (Maintenance, Annulée, Refusé) |
| Avertissement | `THEME.warn` | `#F0C75E` | Statuts intermédiaires (En attente, À surveiller) — même valeur que `goldLight` |
| Bordure | `THEME.border` | `rgba(212,167,44,0.14)` | Conservée pour compatibilité ; les surfaces utilisent désormais un liseré blanc translucide |

### Couleurs dérivées (non centralisées dans THEME)

| Usage | Valeur |
|---|---|
| Texte badge succès | `#4CDB9B` |
| Texte badge erreur / danger | `#F3A5A5` |
| Texte badge info / puce info | `#8FC1F5` |
| Verre de panneau | `linear-gradient(155deg, rgba(21,48,74,0.78), rgba(16,40,63,0.52))` |
| Verre opaque (modale, toast, menu) | `linear-gradient(155deg, rgba(21,48,74,0.94), rgba(11,31,51,0.88))` |
| Liseré de surface | `1px solid rgba(255,255,255,0.07)` |
| Liseré de lumière intérieur | `inset 0 1px 0 rgba(255,255,255,0.07)` |
| Fond de champ | `rgba(7,21,37,0.55)` |
| Scrim de modale | `rgba(3,10,18,0.74)` + `backdrop-filter: blur(10px)` |
| Grain de fond | SVG `feTurbulence` en `data:` URI, `opacity: 0.035` |

### Mapping sémantique des statuts (`statusTone`, [src/lib/utils.js](src/lib/utils.js))

| Statut métier | Tonalité | Couleur de puce |
|---|---|---|
| Disponible, En cours, Actif, Valide, Excellent | `success` | `#20C77A` |
| Loué, Bon | `gold` | `#D4A72C` |
| Réservé(e) | `info` | `#8FC1F5` |
| Maintenance, Annulée, Refusé | `error` | `#E05252` |
| En attente, À surveiller | `warn` | `#F0C75E` |
| Terminée, Annulé, Inactif | `neutral` | `#AAB7C4` |

**Règle :** un nouveau statut métier doit être ajouté à cette table avant
d'être affiché — sinon il retombe silencieusement sur `neutral`.

---

## 3. Typographie

Deux polices, importées depuis Google Fonts dans `GlobalStyles` :

| Police | Rôle | Classe | Graisses chargées |
|---|---|---|---|
| **Cormorant Garamond** (serif) | Titres, montants, identité de marque | `.sam-display` | 500, 600, 700, 700 italique |
| **Manrope** (sans-serif) | Tout le reste : corps, labels, boutons, tableaux | (police par défaut de `.sam-root`) | 400, 500, 600, 700, 800 |

Cette paire crée le contraste "conciergerie" : le serif élégant pour ce qui
doit paraître précieux, le sans-serif neutre pour tout ce qui est fonctionnel
et dense en information.

### Échelle de taille

| Contexte | Taille | Poids |
|---|---|---|
| Titre de page (`PageHeader`) | 38px | 700 |
| Titre de connexion | 30px | 700 |
| Valeur `StatCard` | 34px, chiffres tabulaires | 700 |
| Titre de modale | 23px | 700 |
| Titre de section / carte | 16–21px | 700 |
| Corps de texte | 13.5–14.5px | 400–600 |
| Bouton | 13.5px (12.5px en `sm`) | 700 |
| Label de champ (`.sam-label`) | 11px, majuscules, `letter-spacing: .12em` | 700 |
| Sur-titre (`eyebrow`) | 10.5px, majuscules, `letter-spacing: .18em` | 800 |
| En-tête de tableau | 10.5px, majuscules, `letter-spacing: .11em` | 800 |
| Badge / pastille | 11–11.5px | 700 |

Les micro-labels en majuscules ont un interlettrage large (`.11em` à `.2em`) :
c'est un marqueur fort de la DA, à conserver sur tout nouveau label.

---

## 4. Composants — spécifications visuelles

### Jetons CSS (`.sam-root`)

`GlobalStyles` expose des variables réutilisables plutôt que des valeurs
répétées : `--sam-r-sm/md/lg/xl`, `--sam-pill`, `--sam-glass`,
`--sam-glass-strong`, `--sam-rim`, `--sam-hairline`,
`--sam-shadow-sm/md/lg`, `--sam-glow-gold`, `--sam-glow-gold-soft`,
`--sam-ease`. **Les utiliser plutôt que de recopier une valeur.**

### Fond de l'application (`.sam-root`)

Quatre nappes `radial-gradient` superposées (halo doré en haut à gauche,
masse marine à droite, halo doré diffus en bas à droite, creux central) sur
`THEME.bg`, en `background-attachment: fixed`. Un pseudo-élément `::before`
en `position: fixed; z-index: -1` ajoute un grain SVG à 3,5 %.
`.sam-root` porte `isolation: isolate` pour que ce grain reste derrière le
contenu **sans imposer de positionnement aux enfants** (une règle
`.sam-root > *` casserait tout élément en `position: absolute`).

### Cartes (`.sam-card`)

Verre : dégradé translucide, `backdrop-filter: blur(20px) saturate(125%)`,
liseré `rgba(255,255,255,0.07)`, rayon **22px**, ombre
`0 16px 40px -14px rgba(2,8,16,0.72)` + liseré de lumière intérieur.
Variante `.sam-card-hover` : `translateY(-3px)`, bordure dorée à 34 %,
ombre longue + halo doré doux — transition 280ms.

### Boutons (`.sam-btn`)

Pilule (`border-radius: 999px`), padding `12px 22px`, poids 700.

| Variante | Fond | Texte | Ombre |
|---|---|---|---|
| `.sam-btn-gold` (primaire) | dégradé 135° `goldLight → gold` | `#071525` | halo doré `0 10px 34px -10px` |
| `.sam-btn-ghost` (secondaire) | `rgba(255,255,255,0.045)` + flou | `THEME.text` | aucune |
| `.sam-btn-danger` | `rgba(224,82,82,0.14)` | `#F3A5A5` | aucune |

Survol : `translateY(-1px)` + halo renforcé. Appui : `scale(0.975)`.
Désactivé : `opacity: 0.4`, sans ombre ni transformation.

### Champs de saisie (`.sam-input`)

Fond `rgba(7,21,37,0.55)`, rayon 12px (999px pour les recherches et les
sélecteurs de filtre), ombre intérieure haute. Au focus : bordure or à 65 %,
halo `0 0 0 3px rgba(212,167,44,0.16)` + lueur portée. Label toujours visible
au-dessus (`.sam-label`), jamais de placeholder seul — cohérent avec
l'absence de `<form>` (voir CLAUDE.md, piège n°3).

### Badges de statut (`.sam-badge`)

Pilule, fond à 14–16 % de la couleur sémantique, bordure de la même teinte à
26 %, puce ronde de 6px rendue en CSS avec `box-shadow` de la même couleur
(effet de point lumineux). Voir table des statuts en section 2.

### Tableaux (`.sam-table`)

En-tête sur fond `rgba(7,21,37,0.35)`, majuscules 10.5px très espacées.
Lignes séparées par `rgba(255,255,255,0.045)`, dernière ligne sans trait,
survol `rgba(212,167,44,0.06)`. Conteneur `.sam-table-wrap` en rayon 22px.

### Navigation latérale (`.sam-nav-item`)

Pilule pleine largeur. Survol : fond blanc à 5 % + `translateX(2px)`.
État actif : dégradé horizontal or (22 % → 5 %), bordure dorée à 30 %,
halo doré doux, liseré de lumière, puce dorée à droite avec `box-shadow`.
La barre latérale elle-même est un panneau de verre en dégradé vertical avec
un halo doré derrière le logo.

### Onglets segmentés (`.sam-segmented` / `.sam-segment`)

Piste en pilule `rgba(7,21,37,0.5)` avec ombre intérieure ; onglet actif en
dégradé or, halo doré et liseré de lumière. Sur mobile (`<640px`), le libellé
disparaît sur les onglets inactifs.

### Modales (`Modal`, `ConfirmDialog`)

Scrim `rgba(3,10,18,0.74)` + `blur(10px)`. Carte en verre opaque, rayon 22px,
ombre `0 40px 90px -24px`, halo doré diffus en haut de la carte. Titre en
`.sam-display` couleur `goldLight`. Fermeture par un bouton rond translucide
(Lucide `X`, `aria-label="Fermer"`).

### Notifications (`ToastStack`, `NotificationBell`)

Verre opaque, icône dans une pastille ronde teintée du ton du message, liseré
extérieur coloré à faible opacité. Le panneau de notifications reprend les
mêmes puces CSS que les badges.

### StatCard

Halo radial doré dans l'angle supérieur droit (plus intense si `highlight`),
label en micro-majuscules, icône dans une pastille arrondie dorée avec halo,
valeur en serif 34px à chiffres tabulaires.

### Avatar

Cercle (ou carré à coins arrondis proportionnels si `square`), dégradé or
atténué en l'absence de photo, liseré doré et ombre portée.
`.sam-avatar-edit` (profil) : anneau doré + anneau de fond + ombre profonde.

---

## 5. Espacement, rayons, grille

Rythme de **4px** pour les utilitaires (`.gap-1` à `.gap-6`, `.p-4`).

### Rayons de bordure

| Élément | Rayon | Jeton |
|---|---|---|
| Bouton, badge, onglet, champ de recherche, filtre | 999px | `--sam-pill` |
| Champ de saisie, pastille d'icône | 12px | `--sam-r-sm` |
| Bloc secondaire (carte profil, document, AdminStat) | 16px | `--sam-r-md` |
| Carte, modale, tableau | 22px | `--sam-r-lg` |
| Carte de connexion, écran d'erreur | 28px | `--sam-r-xl` |
| Avatar | 50 % (cercle) ou ~28 % du côté (carré) |  |

### Points de rupture

| Seuil | Effet |
|---|---|
| `max-width: 640px` | onglets segmentés : libellé masqué sauf actif |
| `max-width: 768px` | `.sam-hide-mobile` masqué, padding de contenu `18px 18px 72px` |
| `min-width: 769px` | `.sam-hide-desktop` masqué, padding de contenu `10px 40px 72px` |

### Classes utilitaires disponibles

`flex`, `grid`, `flex-col`, `flex-wrap`, `items-center`, `items-start`,
`justify-between`, `justify-center`, `justify-end`, `gap-1`…`gap-6`, `p-4`,
`min-w-0`, `fixed`, `inset-0`. **Toute classe hors de cette liste ne fait
rien** (pas de Tailwind installé, voir CLAUDE.md piège n°4) : soit l'ajouter
dans `GlobalStyles`, soit utiliser un style en ligne.

---

## 6. Ombres, halos et animations

| Contexte | Valeur | Jeton |
|---|---|---|
| Élévation légère | `0 2px 10px rgba(2,8,16,0.35)` | `--sam-shadow-sm` |
| Carte | `0 16px 40px -14px rgba(2,8,16,0.72)` | `--sam-shadow-md` |
| Carte survolée, menu flottant | `0 34px 70px -22px rgba(2,8,16,0.9)` | `--sam-shadow-lg` |
| Modale | `0 40px 90px -24px rgba(2,8,16,0.95)` |  |
| Halo doré (bouton primaire, onglet actif) | `0 10px 34px -10px rgba(212,167,44,0.5)` | `--sam-glow-gold` |
| Halo doré doux (survol, nav active) | `0 6px 26px -12px rgba(212,167,44,0.42)` | `--sam-glow-gold-soft` |
| Liseré de lumière | `inset 0 1px 0 rgba(255,255,255,0.07)` | `--sam-rim` |
| Focus de champ | `0 0 0 3px rgba(212,167,44,0.16)` |  |

Courbe d'accélération unique : `cubic-bezier(.22,.8,.3,1)` (`--sam-ease`).
Durées : micro-interactions **180–280ms**, apparition de modale **320ms**,
entrée de page **380ms**. Les animations respectent
`prefers-reduced-motion: reduce` (toutes réduites à 0,01ms).

---

## 7. Icônes

[Lucide](https://lucide.dev) exclusivement pour l'interface, monochromes,
trait cohérent (1.9 par défaut, 2.4 à l'état actif dans la navigation).
Couleur par défaut `THEME.textMuted`, passe à `THEME.gold`/`goldLight` au
survol ou à l'état actif. Les icônes seules dans un bouton rond portent un
`aria-label`. Ne pas introduire d'emoji comme icône d'interface (voir
section 1) — les icônes de catégorie saisies en base font exception.

---

## 8. Accessibilité — état actuel et limites connues

Points couverts :
- Contraste texte/fond largement au-dessus du seuil AA sur les surfaces de verre.
- États de focus visibles sur les champs (halo or).
- Boutons désactivés distincts (`opacity: 0.4` + `cursor: not-allowed`).
- `prefers-reduced-motion` respecté globalement.
- Boutons icône seuls des composants partagés (`Modal`, `MobileTopBar`,
  `MobileDrawer`, `NotificationBell`, œil du mot de passe) : `aria-label` présent.
- Les statuts ne reposent plus sur une puce emoji : puce CSS `aria-hidden`
  doublée du libellé texte, toujours affiché.

Points non couverts, à ne pas aggraver :
- Certains boutons icône seuls dans les pages (actions de tableau) n'ont pas
  encore d'`aria-label`.
- `backdrop-filter` n'est pas supporté partout : prévoir que les panneaux
  restent lisibles sans flou (les fonds sont déjà assez opaques pour cela).

---

## 9. Ce qu'il ne faut pas faire

- Ne pas coder une couleur d'identité en dur si `THEME` a déjà l'équivalent.
- Ne pas étendre l'or à des surfaces larges : il reste un accent et un halo.
- Ne pas recopier un rayon ou une ombre : utiliser les jetons de la section 4.
- Ne pas ajouter de règle de positionnement sur `.sam-root > *` (casse les
  éléments en `position: absolute` des pages).
- Ne pas ajouter de classe utilitaire type Tailwind sans la déclarer dans
  `GlobalStyles` (section 5).
- Ne pas introduire d'emoji comme icône d'interface.
- Ne pas créer de nouveau statut métier sans l'ajouter à `statusTone`.
