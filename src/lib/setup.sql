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