-- MiniStore order summary patch (safe to run multiple times)
-- Ensures summary exists and backfills old orders.

alter table public.store_orders
  add column if not exists summary jsonb not null default '{}'::jsonb;

alter table public.store_orders
  add column if not exists item_count integer not null default 0;

update public.store_orders
set item_count = coalesce((
  select sum(coalesce((item ->> 'quantity')::integer, 0))
  from jsonb_array_elements(coalesce(items, '[]'::jsonb)) as item
), 0)
where coalesce(item_count, 0) = 0;

update public.store_orders
set summary = jsonb_build_object(
  'itemCount', coalesce(item_count, 0),
  'subtotal', coalesce(total, 0),
  'currency', 'PHP',
  'fullName', coalesce(recipient_full_name, ''),
  'mobile', coalesce(recipient_mobile, ''),
  'address', coalesce(recipient_address, ''),
  'paymentMethod', coalesce(payment_method, 'GCash')
)
where summary is null
   or summary = '{}'::jsonb;
