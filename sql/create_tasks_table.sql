-- Table des tâches de la to-do list (organisation des événements).
--
-- À exécuter UNE SEULE FOIS dans Supabase :
--   Dashboard du projet > SQL Editor > New query > coller > Run.
--
-- Tant que cette table n'existe pas, la page "To-do list" s'affiche vide
-- avec un message d'explication : le reste du site continue de fonctionner
-- normalement (la requête est volontairement non bloquante au chargement).
--
-- Remarques de cohérence avec le reste de la base :
--   - `id` est du TEXT (les identifiants sont générés côté navigateur par
--     uid(), ex. "task_a3f9c2"), surtout pas un uuid.
--   - Les colonnes de date sont des timestamp, comme les autres tables :
--     l'application les normalise au chargement via toDate().
--   - RLS n'est pas activé, pour rester aligné sur les autres tables du
--     projet (limite de sécurité déjà connue et documentée dans CLAUDE.md).

create table if not exists public.tasks (
  id            text primary key,
  evenement     text        not null default '',
  titre         text        not null,
  fait          boolean     not null default false,
  date_echeance timestamp,
  priorite      text        not null default 'Normale',
  note          text        not null default '',
  date_creation timestamp   default now()
);

-- Accélère le regroupement par événement quand la liste s'allonge.
create index if not exists tasks_evenement_idx on public.tasks (evenement);
