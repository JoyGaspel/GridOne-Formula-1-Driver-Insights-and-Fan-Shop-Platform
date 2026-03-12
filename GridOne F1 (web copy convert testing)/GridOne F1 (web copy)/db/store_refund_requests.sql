-- GridOne Mini Store: refund requests table
-- Run in Supabase SQL Editor.

create table if not exists public.store_refund_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.store_orders(id) on delete set null,
  order_code text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  media_urls text[] not null default '{}'::text[],
  delivered_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'refunded')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_refund_requests_user_id_idx
  on public.store_refund_requests (user_id);

create index if not exists store_refund_requests_order_code_idx
  on public.store_refund_requests (order_code);

create index if not exists store_refund_requests_created_at_idx
  on public.store_refund_requests (created_at desc);

drop trigger if exists trg_store_refund_requests_updated_at on public.store_refund_requests;
create trigger trg_store_refund_requests_updated_at
  before update on public.store_refund_requests
  for each row
  execute function public.set_updated_at();

alter table public.store_refund_requests enable row level security;

drop policy if exists "store_refund_requests_select_own" on public.store_refund_requests;
create policy "store_refund_requests_select_own"
  on public.store_refund_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "store_refund_requests_insert_own" on public.store_refund_requests;
create policy "store_refund_requests_insert_own"
  on public.store_refund_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "store_refund_requests_admin_select" on public.store_refund_requests;
create policy "store_refund_requests_admin_select"
  on public.store_refund_requests
  for select
  to authenticated
  using (public.is_ministore_admin());

drop policy if exists "store_refund_requests_admin_update" on public.store_refund_requests;
create policy "store_refund_requests_admin_update"
  on public.store_refund_requests
  for update
  to authenticated
  using (public.is_ministore_admin())
  with check (public.is_ministore_admin());

drop policy if exists "store_refund_requests_admin_delete" on public.store_refund_requests;
create policy "store_refund_requests_admin_delete"
  on public.store_refund_requests
  for delete
  to authenticated
  using (public.is_ministore_admin());
