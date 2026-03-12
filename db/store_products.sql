-- MiniStore products table
-- Run in Supabase SQL Editor.

create table if not exists public.store_products (
  id text primary key,
  name text not null,
  category text not null,
  team text not null,
  driver text not null,
  price integer not null check (price >= 0),
  stock integer not null check (stock >= 0),
  sizes text[] not null default '{}'::text[],
  description text not null default '',
  details text not null default '',
  image text,
  images text[] not null default '{}'::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_products_created_at_idx
  on public.store_products (created_at desc);

create or replace function public.set_store_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_store_products_updated_at on public.store_products;
create trigger trg_store_products_updated_at
before update on public.store_products
for each row
execute function public.set_store_products_updated_at();

alter table public.store_products enable row level security;

drop policy if exists "store_products_select_public" on public.store_products;
create policy "store_products_select_public"
  on public.store_products
  for select
  to anon, authenticated
  using (is_active = true);
