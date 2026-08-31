-- Table des dépenses de l'entreprise.
--
-- À exécuter UNE SEULE FOIS dans Supabase :
--   Dashboard du projet > SQL Editor > New query > coller > Run.
--   Le projet doit être celui utilisé par le site (Project Settings > API,
--   la Project URL doit correspondre à celle du fichier .env.local).
--
-- Tant que cette table n'existe pas, la page "Dépenses" affiche un message
-- d'explication et le reste du site continue de fonctionner normalement
-- (la requête est volontairement non bloquante au chargement).
--
-- Cohérence avec le reste de la base :
--   - `id` est du TEXT (identifiants générés côté navigateur par uid(),
--     ex. "dep_a3f9c2"), surtout pas un uuid.
--   - Les colonnes de date sont des timestamp, comme les autres tables :
--     l'application les normalise au chargement via toDate().

create table if not exists public.expenses (
  id            text primary key,
  date          timestamp   not null,
  libelle       text        not null,
  categorie     text        not null default '',
  montant       numeric     not null default 0,
  note          text        not null default '',
  date_creation timestamp   default now()
);

-- Accélère le filtrage par semaine / par mois quand l'historique s'allonge.
create index if not exists expenses_date_idx on public.expenses (date);

-- Droits d'accès pour la clé anonyme utilisée par le site.
-- Indispensable : sans ces droits, l'API répond « Could not find the table
-- 'public.expenses' » exactement comme si la table n'existait pas
-- (PostgREST masque les tables auxquelles le rôle n'a pas accès).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.expenses to anon, authenticated;

-- Supabase active RLS d'office sur une table créée depuis l'éditeur SQL :
-- la lecture renverrait une liste vide et toute écriture serait refusée
-- (« new row violates row-level security policy »). On aligne donc cette
-- table sur les autres tables du projet. Ce n'est pas une nouvelle faille :
-- c'est la limite déjà documentée dans CLAUDE.md (les droits ne sont
-- vérifiés que dans l'interface).
alter table public.expenses disable row level security;

-- Prise en compte immédiate par l'API (sinon la table reste invisible).
notify pgrst, 'reload schema';

-- Vérification : doit renvoyer 7 lignes (les colonnes de la table).
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'expenses'
order by ordinal_position;
