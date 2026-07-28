-- ═══════════════════════════════════════════════════════════════
-- PetTag — Initial Schema
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── Profiles (papel do usuario autenticado) ───────────────────────
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  role                  text not null check (role in ('admin','owner')),
  must_change_password  boolean not null default true,
  created_at            timestamptz not null default now()
);

-- ── Pets (um registro por tag/coleira) ─────────────────────────────
create table public.pets (
  id             uuid primary key default uuid_generate_v4(),
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  slug           text not null unique,
  name           text not null,
  species        text not null default 'cachorro',
  breed          text,
  sex            text check (sex in ('macho','femea')),
  birth_date     date,
  bio            text,
  owner_name     text,
  phone          text,
  location       text,
  is_configured  boolean not null default false,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint pets_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create index idx_pets_owner on public.pets(owner_id);

-- ── Fotos do pet ────────────────────────────────────────────────────
create table public.pet_photos (
  id             uuid primary key default uuid_generate_v4(),
  pet_id         uuid not null references public.pets(id) on delete cascade,
  storage_path   text not null,
  is_with_owner  boolean not null default false,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

create index idx_pet_photos_pet on public.pet_photos(pet_id, sort_order);

-- ── Vacinas do pet ──────────────────────────────────────────────────
create table public.pet_vaccines (
  id             uuid primary key default uuid_generate_v4(),
  pet_id         uuid not null references public.pets(id) on delete cascade,
  name           text not null,
  applied_date   date,
  next_due_date  date,
  notes          text,
  created_at     timestamptz not null default now()
);

create index idx_pet_vaccines_pet on public.pet_vaccines(pet_id);

-- ── Updated-at trigger ──────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_pets_updated_at
  before update on public.pets
  for each row execute function public.handle_updated_at();

-- ── Helper functions ────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.owns_pet(p_pet_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.pets where id = p_pet_id and owner_id = auth.uid()
  );
$$;

-- ── Row Level Security ────────────────────────────────────────────
alter table public.profiles enable row level security;
create policy "user reads own profile"    on public.profiles for select using (id = auth.uid());
create policy "user updates own profile"  on public.profiles for update using (id = auth.uid());
create policy "admin manages profiles"    on public.profiles for all    using (public.is_admin());

alter table public.pets enable row level security;
create policy "public reads active pets"  on public.pets for select using (active = true);
create policy "owner manages own pet"     on public.pets for all    using (owner_id = auth.uid());
create policy "admin manages all pets"    on public.pets for all    using (public.is_admin());

alter table public.pet_photos enable row level security;
create policy "public reads photos of active pets" on public.pet_photos for select
  using (exists (select 1 from public.pets where pets.id = pet_photos.pet_id and pets.active = true));
create policy "owner manages own pet photos" on public.pet_photos for all
  using (public.owns_pet(pet_id));
create policy "admin manages all pet photos" on public.pet_photos for all
  using (public.is_admin());

alter table public.pet_vaccines enable row level security;
create policy "public reads vaccines of active pets" on public.pet_vaccines for select
  using (exists (select 1 from public.pets where pets.id = pet_vaccines.pet_id and pets.active = true));
create policy "owner manages own pet vaccines" on public.pet_vaccines for all
  using (public.owns_pet(pet_id));
create policy "admin manages all pet vaccines" on public.pet_vaccines for all
  using (public.is_admin());

-- ── Storage bucket + policies ────────────────────────────────────────
-- O bucket "pet-photos" e criado automaticamente pela aplicacao (ensurePetPhotosBucket),
-- mas as policies de acesso precisam ser criadas aqui.

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

create policy "public reads pet photos"
  on storage.objects for select
  using (bucket_id = 'pet-photos');

create policy "owner uploads own pet photos"
  on storage.objects for insert
  with check (
    bucket_id = 'pet-photos'
    and public.owns_pet(((storage.foldername(name))[1])::uuid)
  );

create policy "owner deletes own pet photos"
  on storage.objects for delete
  using (
    bucket_id = 'pet-photos'
    and public.owns_pet(((storage.foldername(name))[1])::uuid)
  );

create policy "admin manages all pet photos in storage"
  on storage.objects for all
  using (bucket_id = 'pet-photos' and public.is_admin());
