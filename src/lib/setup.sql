-- Création de la table profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  email text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
create policy "Les profils sont visibles par tous les utilisateurs authentifiés"
on profiles for select
to authenticated
using (true);

-- Politique pour permettre l'insertion uniquement lors de la création du profil
create policy "Les utilisateurs peuvent créer leur propre profil"
on profiles for insert
to authenticated
with check (auth.uid() = id);

-- Politique pour permettre la mise à jour uniquement de son propre profil
create policy "Les utilisateurs peuvent mettre à jour leur propre profil"
on profiles for update
to authenticated
using (auth.uid() = id);

-- Création de la table teams
create table if not exists public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  federation text not null,
  level text,
  category text,
  gender text,
  season text,
  description text,
  coach_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Politique pour permettre la lecture des équipes à tous les utilisateurs authentifiés
create policy "Les équipes sont visibles par tous les utilisateurs authentifiés"
on teams for select
to authenticated
using (true);

-- Politique pour permettre la création d'équipes uniquement par les utilisateurs authentifiés
create policy "Les utilisateurs authentifiés peuvent créer des équipes"
on teams for insert
to authenticated
with check (auth.uid() = coach_id);

-- Politique pour permettre la mise à jour uniquement par le coach de l'équipe
create policy "Les coachs peuvent mettre à jour leurs équipes"
on teams for update
to authenticated
using (auth.uid() = coach_id);

-- Politique pour permettre la suppression uniquement par le coach de l'équipe
create policy "Les coachs peuvent supprimer leurs équipes"
on teams for delete
to authenticated
using (auth.uid() = coach_id);

-- Trigger pour mettre à jour le champ updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger teams_updated_at
  before update on teams
  for each row
  execute procedure handle_updated_at(); 