create extension if not exists pgcrypto;

create table if not exists public.teams (
  id text primary key,
  name text not null,
  base text not null default '',
  color text not null default '#dc0000',
  drivers jsonb not null default '[]'::jsonb,
  image text not null default '',
  logo text not null default '',
  car text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drivers (
  id text primary key,
  name text not null,
  number text not null default '',
  country text not null default '',
  team text not null default '',
  description text not null default '',
  image text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.races (
  id text primary key,
  round text not null default '',
  name text not null,
  date text not null default '',
  location text not null default '',
  circuit text not null default '',
  circuit_id text not null default '',
  laps text not null default '',
  distance text not null default '',
  lap_record text not null default '',
  schedule jsonb not null default '{}'::jsonb,
  image text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.circuits (
  id text primary key,
  name text not null,
  location text not null default '',
  country text not null default '',
  round text not null default '',
  type text not null default 'Permanent',
  image text not null default '',
  detail_image text not null default '',
  description text not null default '',
  long_description text not null default '',
  length text not null default '',
  laps text not null default '',
  race_distance text not null default '',
  first_grand_prix text not null default '',
  lap_record text not null default '',
  lap_record_driver text not null default '',
  capacity text not null default '',
  corners text not null default '',
  circuit_type text not null default 'Permanent Circuit',
  direction text not null default 'Clockwise',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row
execute function public.set_updated_at();

drop trigger if exists drivers_set_updated_at on public.drivers;
create trigger drivers_set_updated_at
before update on public.drivers
for each row
execute function public.set_updated_at();

drop trigger if exists races_set_updated_at on public.races;
create trigger races_set_updated_at
before update on public.races
for each row
execute function public.set_updated_at();

drop trigger if exists circuits_set_updated_at on public.circuits;
create trigger circuits_set_updated_at
before update on public.circuits
for each row
execute function public.set_updated_at();

alter table public.teams enable row level security;
alter table public.drivers enable row level security;
alter table public.races enable row level security;
alter table public.circuits enable row level security;

drop policy if exists "teams_public_read" on public.teams;
create policy "teams_public_read"
on public.teams
for select
to authenticated, anon
using (true);

drop policy if exists "drivers_public_read" on public.drivers;
create policy "drivers_public_read"
on public.drivers
for select
to authenticated, anon
using (true);

drop policy if exists "races_public_read" on public.races;
create policy "races_public_read"
on public.races
for select
to authenticated, anon
using (true);

drop policy if exists "circuits_public_read" on public.circuits;
create policy "circuits_public_read"
on public.circuits
for select
to authenticated, anon
using (true);

drop policy if exists "teams_superadmin_write" on public.teams;
create policy "teams_superadmin_write"
on public.teams
for all
to authenticated
using (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'gama.orgas.up@phinmaed.com')
with check (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'gama.orgas.up@phinmaed.com');

drop policy if exists "drivers_superadmin_write" on public.drivers;
create policy "drivers_superadmin_write"
on public.drivers
for all
to authenticated
using (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'gama.orgas.up@phinmaed.com')
with check (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'gama.orgas.up@phinmaed.com');

drop policy if exists "races_superadmin_write" on public.races;
create policy "races_superadmin_write"
on public.races
for all
to authenticated
using (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'gama.orgas.up@phinmaed.com')
with check (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'gama.orgas.up@phinmaed.com');

drop policy if exists "circuits_superadmin_write" on public.circuits;
create policy "circuits_superadmin_write"
on public.circuits
for all
to authenticated
using (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'gama.orgas.up@phinmaed.com')
with check (lower(coalesce((auth.jwt() ->> 'email'), '')) = 'gama.orgas.up@phinmaed.com');
