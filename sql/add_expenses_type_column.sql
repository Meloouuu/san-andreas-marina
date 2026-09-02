-- Ajoute la distinction dépense / entrée dans la table `expenses`.
--
-- À exécuter UNE SEULE FOIS dans Supabase :
--   Dashboard du projet > SQL Editor > New query > coller > Run.
--
-- Pourquoi une colonne plutôt qu'une seconde table : les entrées (virement
-- d'un partenaire, remboursement...) se saisissent exactement comme une
-- dépense — même formulaire, mêmes champs. Une colonne `type` suffit à les
-- séparer dans les calculs, et évite de dupliquer toute la mécanique.
--
-- Les lignes déjà enregistrées prennent 'depense' grâce au DEFAULT : aucune
-- donnée existante n'est modifiée ni perdue.

alter table public.expenses
  add column if not exists type text not null default 'depense';

-- Garde-fou : seules deux valeurs sont acceptées. Sans cela, une faute de
-- frappe ferait disparaître une ligne des deux totaux à la fois.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'expenses_type_check'
  ) then
    alter table public.expenses
      add constraint expenses_type_check check (type in ('depense', 'entree'));
  end if;
end $$;

-- Prise en compte immédiate par l'API.
notify pgrst, 'reload schema';

-- Vérification : doit renvoyer une ligne "type | text | depense".
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'expenses' and column_name = 'type';
