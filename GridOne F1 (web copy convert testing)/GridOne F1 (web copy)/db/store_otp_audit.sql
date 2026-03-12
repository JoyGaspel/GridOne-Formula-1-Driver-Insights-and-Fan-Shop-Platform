-- OTP + payment audit tables for MiniStore
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.store_otp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  channel text not null default 'email',
  status text not null default 'sent',
  otp_code_hash text,
  otp_code_last4 text,
  sent_at timestamptz not null default now(),
  verified_at timestamptz,
  last_attempt_at timestamptz,
  attempts integer not null default 0
);

create index if not exists store_otp_transactions_user_idx
  on public.store_otp_transactions (user_id, sent_at desc);

create table if not exists public.store_payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.store_orders(id) on delete set null,
  order_code text,
  amount numeric(12, 2) not null default 0,
  payment_method text not null default 'GCash',
  payment_status text not null default 'Payment Successful',
  otp_tx_id uuid references public.store_otp_transactions(id) on delete set null,
  otp_channel text,
  otp_email text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists store_payment_events_user_idx
  on public.store_payment_events (user_id, created_at desc);

alter table public.store_otp_transactions enable row level security;
alter table public.store_payment_events enable row level security;

drop policy if exists "store_otp_transactions_select_own" on public.store_otp_transactions;
create policy "store_otp_transactions_select_own"
  on public.store_otp_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "store_otp_transactions_insert_own" on public.store_otp_transactions;
create policy "store_otp_transactions_insert_own"
  on public.store_otp_transactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "store_otp_transactions_update_own" on public.store_otp_transactions;
create policy "store_otp_transactions_update_own"
  on public.store_otp_transactions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "store_payment_events_select_own" on public.store_payment_events;
create policy "store_payment_events_select_own"
  on public.store_payment_events
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "store_payment_events_insert_own" on public.store_payment_events;
create policy "store_payment_events_insert_own"
  on public.store_payment_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

alter table public.store_orders
  add column if not exists otp_tx_id uuid references public.store_otp_transactions(id) on delete set null;

alter table public.store_orders
  add column if not exists otp_verified_at timestamptz;

alter table public.store_orders
  add column if not exists otp_channel text;

alter table public.store_orders
  add column if not exists otp_email text;
