create extension if not exists pgcrypto;

create table if not exists public.admin_archive_events (
  id text primary key,
  section text not null default '',
  record_id text not null default '',
  record_name text not null default '',
  record_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_registered_users (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null default '',
  name text not null default '',
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists admin_archive_events_created_at_idx
  on public.admin_archive_events (created_at desc);

create index if not exists admin_registered_users_registered_at_idx
  on public.admin_registered_users (registered_at desc);

alter table public.admin_archive_events enable row level security;
alter table public.admin_registered_users enable row level security;

drop policy if exists "admin_archive_events_select_authenticated" on public.admin_archive_events;
create policy "admin_archive_events_select_authenticated"
on public.admin_archive_events
for select
to authenticated
using (true);

drop policy if exists "admin_archive_events_admin_write" on public.admin_archive_events;
create policy "admin_archive_events_admin_write"
on public.admin_archive_events
for all
to authenticated
using (public.is_ministore_admin())
with check (public.is_ministore_admin());

drop policy if exists "admin_registered_users_select_authenticated" on public.admin_registered_users;
create policy "admin_registered_users_select_authenticated"
on public.admin_registered_users
for select
to authenticated
using (true);

drop policy if exists "admin_registered_users_insert_open" on public.admin_registered_users;
create policy "admin_registered_users_insert_open"
on public.admin_registered_users
for insert
to authenticated, anon
with check (true);

drop policy if exists "admin_registered_users_update_admin" on public.admin_registered_users;
create policy "admin_registered_users_update_admin"
on public.admin_registered_users
for update
to authenticated
using (public.is_ministore_admin())
with check (public.is_ministore_admin());

drop policy if exists "admin_registered_users_delete_admin" on public.admin_registered_users;
create policy "admin_registered_users_delete_admin"
on public.admin_registered_users
for delete
to authenticated
using (public.is_ministore_admin());
