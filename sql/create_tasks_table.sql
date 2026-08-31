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
--   - RLS est explicitement désactivé plus bas, pour rester aligné sur les
--     autres tables du projet. Ce n'est pas un nouveau trou de sécurité :
--     c'est la limite déjà connue et documentée dans CLAUDE.md (les droits
--     ne sont vérifiés que dans l'interface). Sans cela, l'écriture est
--     refusée : « new row violates row-level security policy ».

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

-- Droits d'accès pour la clé anonyme utilisée par le site.
-- Indispensable : sans ces droits, l'API Supabase répond « Could not find
-- the table 'public.tasks' » exactement comme si la table n'existait pas
-- (PostgREST masque les tables auxquelles le rôle n'a pas accès). Une table
-- créée depuis l'éditeur SQL n'hérite pas toujours de ces droits, alors
-- qu'une table créée depuis l'interface Table Editor les reçoit.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.tasks to anon, authenticated;

-- Aligne la table sur les 8 autres tables du projet. Supabase peut activer
-- RLS d'office sur une table nouvellement créée : la lecture renvoie alors
-- une liste vide et toute écriture est refusée.
alter table public.tasks disable row level security;

-- Prise en compte immédiate par l'API.
notify pgrst, 'reload schema';


-- ------------------------------------------------------------------
-- Si l'application affiche toujours « la to-do list n'est pas encore
-- installée » après avoir lancé le script ci-dessus.
--
-- 1) Vérifier que la table a bien été créée sur CE projet :
--
--      select table_name
--      from information_schema.tables
--      where table_schema = 'public' and table_name = 'tasks';
--
--    - Une ligne "tasks" est renvoyée -> passer au point 2.
--    - Aucune ligne -> le script n'a pas été exécuté sur ce projet
--      (mauvais projet, ou requête non lancée) : relancer le script.
--
-- 2) L'API Supabase garde en mémoire la liste des tables ; après la
--    création d'une table, ce cache met parfois un moment à se mettre à
--    jour. Pour le forcer, exécuter :
--
--      notify pgrst, 'reload schema';
--
--    Puis recharger la page du site.
-- ------------------------------------------------------------------
