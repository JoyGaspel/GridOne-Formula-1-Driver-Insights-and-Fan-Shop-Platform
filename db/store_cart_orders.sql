-- GridOne Mini Store: cart + orders tables
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.store_cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  name text not null,
  category text not null,
  team text not null,
  image text,
  price integer not null check (price >= 0),
  size text not null,
  stock integer not null check (stock >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists store_cart_items_user_id_idx
  on public.store_cart_items (user_id);

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_code text not null unique,
  items jsonb not null default '[]'::jsonb,
  item_count integer not null default 0 check (item_count >= 0),
  total numeric(12, 2) not null check (total >= 0),
  summary jsonb not null default '{}'::jsonb,
  recipient_full_name text not null,
  recipient_mobile text not null,
  recipient_address text not null,
  payment_method text not null default 'GCash',
  payment_status text not null default 'Payment Successful',
  order_status text not null default 'To Pack',
  delivery_status text not null default 'Warehouse',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.store_orders
  add column if not exists item_count integer not null default 0;

alter table public.store_orders
  add column if not exists summary jsonb not null default '{}'::jsonb;

create index if not exists store_orders_user_id_idx
  on public.store_orders (user_id);

alter table public.store_cart_items enable row level security;
alter table public.store_orders enable row level security;

drop policy if exists "store_cart_select_own" on public.store_cart_items;
create policy "store_cart_select_own"
  on public.store_cart_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "store_cart_insert_own" on public.store_cart_items;
create policy "store_cart_insert_own"
  on public.store_cart_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "store_cart_update_own" on public.store_cart_items;
create policy "store_cart_update_own"
  on public.store_cart_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "store_cart_delete_own" on public.store_cart_items;
create policy "store_cart_delete_own"
  on public.store_cart_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "store_orders_select_own" on public.store_orders;
create policy "store_orders_select_own"
  on public.store_orders
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "store_orders_insert_own" on public.store_orders;
create policy "store_orders_insert_own"
  on public.store_orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "store_orders_update_own" on public.store_orders;
create policy "store_orders_update_own"
  on public.store_orders
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
