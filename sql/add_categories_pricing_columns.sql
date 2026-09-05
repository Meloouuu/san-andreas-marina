-- Ajoute les tarifs prédéfinis par catégorie (prix de départ à l'heure et
-- réduction dégressive pour les locations plus longues).
--
-- À exécuter UNE SEULE FOIS dans Supabase :
--   Dashboard du projet > SQL Editor > New query > coller > Run.
--
-- Les catégories déjà créées prennent 0 sur les deux colonnes grâce au
-- DEFAULT : le prix ne se pré-remplit pas tant que le tarif n'a pas été
-- renseigné dans la fiche catégorie, mais rien n'est cassé.

alter table public.categories
  add column if not exists prix_heure numeric not null default 0;

alter table public.categories
  add column if not exists reduction_heure numeric not null default 0;

-- Prise en compte immédiate par l'API.
notify pgrst, 'reload schema';

-- Vérification : doit renvoyer deux lignes (prix_heure, reduction_heure).
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'categories'
  and column_name in ('prix_heure', 'reduction_heure');
