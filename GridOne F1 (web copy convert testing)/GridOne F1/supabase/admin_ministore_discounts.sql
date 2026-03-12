-- MiniStore Discounts schema + admin RPCs

create table if not exists public.store_discounts (
  id text primary key,
  name text not null,
  description text,
  image text,
  type text not null check (type in ('percent', 'fixed')),
  amount numeric not null check (amount >= 0),
  is_active boolean not null default true,
  stackable boolean not null default false,
  priority integer not null default 100,
  starts_at timestamptz,
  ends_at timestamptz,
  categories text[] not null default '{}'::text[],
  teams text[] not null default '{}'::text[],
  drivers text[] not null default '{}'::text[],
  product_ids text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_discounts_active_idx on public.store_discounts (is_active);
create index if not exists store_discounts_schedule_idx on public.store_discounts (starts_at, ends_at);

create or replace function public.set_store_discounts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_store_discounts_updated_at on public.store_discounts;
create trigger trg_store_discounts_updated_at
before update on public.store_discounts
for each row execute function public.set_store_discounts_updated_at();

alter table public.store_discounts enable row level security;

-- Public read for active discounts only
drop policy if exists store_discounts_read_active on public.store_discounts;
create policy store_discounts_read_active
on public.store_discounts
for select
using (is_active = true);

-- Admin RPCs (security definer) to manage discounts
create or replace function public.admin_list_store_discounts()
returns setof public.store_discounts
language sql
security definer
set search_path = public
as $$
  select *
  from public.store_discounts
  order by priority asc, created_at desc;
$$;

create or replace function public.admin_upsert_store_discount(p_discount jsonb)
returns public.store_discounts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_discount public.store_discounts;
begin
  insert into public.store_discounts (
    id,
    name,
    description,
    image,
    type,
    amount,
    is_active,
    stackable,
    priority,
    starts_at,
    ends_at,
    categories,
    teams,
    drivers,
    product_ids
  )
  values (
    p_discount->>'id',
    p_discount->>'name',
    p_discount->>'description',
    p_discount->>'image',
    p_discount->>'type',
    coalesce((p_discount->>'amount')::numeric, 0),
    coalesce((p_discount->>'is_active')::boolean, true),
    coalesce((p_discount->>'stackable')::boolean, false),
    coalesce((p_discount->>'priority')::integer, 100),
    (p_discount->>'starts_at')::timestamptz,
    (p_discount->>'ends_at')::timestamptz,
    coalesce(array(select jsonb_array_elements_text(p_discount->'categories')), '{}'::text[]),
    coalesce(array(select jsonb_array_elements_text(p_discount->'teams')), '{}'::text[]),
    coalesce(array(select jsonb_array_elements_text(p_discount->'drivers')), '{}'::text[]),
    coalesce(array(select jsonb_array_elements_text(p_discount->'product_ids')), '{}'::text[])
  )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    image = excluded.image,
    type = excluded.type,
    amount = excluded.amount,
    is_active = excluded.is_active,
    stackable = excluded.stackable,
    priority = excluded.priority,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    categories = excluded.categories,
    teams = excluded.teams,
    drivers = excluded.drivers,
    product_ids = excluded.product_ids
  returning * into v_discount;

  return v_discount;
end;
$$;

create or replace function public.admin_delete_store_discount(p_discount_id text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.store_discounts where id = p_discount_id;
$$;
