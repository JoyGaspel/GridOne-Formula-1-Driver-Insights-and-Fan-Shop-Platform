-- Super Admin MiniStore RPCs
-- Run in Supabase SQL Editor.

create or replace function public.admin_list_store_orders()
returns setof public.store_orders
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  return query
  select *
  from public.store_orders
  order by created_at desc;
end;
$$;

create or replace function public.admin_list_store_carts()
returns setof public.store_cart_items
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  return query
  select *
  from public.store_cart_items
  order by created_at desc;
end;
$$;

create or replace function public.admin_update_store_order(
  p_order_id uuid,
  p_payment_status text default null,
  p_order_status text default null,
  p_delivery_status text default null
)
returns public.store_orders
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
  updated_row public.store_orders;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  update public.store_orders
  set
    payment_status = coalesce(p_payment_status, payment_status),
    order_status = coalesce(p_order_status, order_status),
    delivery_status = coalesce(p_delivery_status, delivery_status)
  where id = p_order_id
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'Order not found';
  end if;

  return updated_row;
end;
$$;

create or replace function public.admin_update_store_order_by_code(
  p_order_code text,
  p_payment_status text default null,
  p_order_status text default null,
  p_delivery_status text default null
)
returns public.store_orders
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
  updated_row public.store_orders;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  update public.store_orders
  set
    payment_status = coalesce(p_payment_status, payment_status),
    order_status = coalesce(p_order_status, order_status),
    delivery_status = coalesce(p_delivery_status, delivery_status)
  where order_code = p_order_code
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'Order not found';
  end if;

  return updated_row;
end;
$$;

create or replace function public.admin_update_store_cart_quantity(
  p_cart_id uuid,
  p_quantity integer
)
returns public.store_cart_items
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
  safe_qty integer := greatest(1, coalesce(p_quantity, 1));
  updated_row public.store_cart_items;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  update public.store_cart_items
  set quantity = safe_qty
  where id = p_cart_id
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'Cart item not found';
  end if;

  return updated_row;
end;
$$;

create or replace function public.admin_delete_store_cart_item(
  p_cart_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  delete from public.store_cart_items where id = p_cart_id;
end;
$$;

alter function public.admin_list_store_orders() owner to postgres;
alter function public.admin_list_store_carts() owner to postgres;
alter function public.admin_update_store_order(uuid, text, text, text) owner to postgres;
alter function public.admin_update_store_order_by_code(text, text, text, text) owner to postgres;
alter function public.admin_update_store_cart_quantity(uuid, integer) owner to postgres;
alter function public.admin_delete_store_cart_item(uuid) owner to postgres;

revoke all on function public.admin_list_store_orders() from public;
revoke all on function public.admin_list_store_carts() from public;
revoke all on function public.admin_update_store_order(uuid, text, text, text) from public;
revoke all on function public.admin_update_store_order_by_code(text, text, text, text) from public;
revoke all on function public.admin_update_store_cart_quantity(uuid, integer) from public;
revoke all on function public.admin_delete_store_cart_item(uuid) from public;

grant execute on function public.admin_list_store_orders() to authenticated;
grant execute on function public.admin_list_store_carts() to authenticated;
grant execute on function public.admin_update_store_order(uuid, text, text, text) to authenticated;
grant execute on function public.admin_update_store_order_by_code(text, text, text, text) to authenticated;
grant execute on function public.admin_update_store_cart_quantity(uuid, integer) to authenticated;
grant execute on function public.admin_delete_store_cart_item(uuid) to authenticated;

create or replace function public.admin_list_store_products()
returns setof public.store_products
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  return query
  select *
  from public.store_products
  order by created_at desc;
end;
$$;

create or replace function public.admin_upsert_store_product(p_product jsonb)
returns public.store_products
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
  upserted_row public.store_products;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  insert into public.store_products (
    id,
    name,
    category,
    team,
    driver,
    price,
    stock,
    sizes,
    description,
    details,
    image,
    images,
    is_active
  )
  values (
    p_product ->> 'id',
    coalesce(p_product ->> 'name', ''),
    coalesce(p_product ->> 'category', ''),
    coalesce(p_product ->> 'team', ''),
    coalesce(p_product ->> 'driver', ''),
    greatest(0, coalesce((p_product ->> 'price')::integer, 0)),
    greatest(0, coalesce((p_product ->> 'stock')::integer, 0)),
    coalesce(
      (
        select array_agg(value::text)
        from jsonb_array_elements_text(coalesce(p_product -> 'sizes', '[]'::jsonb))
      ),
      array['One Size']::text[]
    ),
    coalesce(p_product ->> 'description', ''),
    coalesce(p_product ->> 'details', ''),
    p_product ->> 'image',
    coalesce(
      (
        select array_agg(value::text)
        from jsonb_array_elements_text(coalesce(p_product -> 'images', '[]'::jsonb))
      ),
      '{}'::text[]
    ),
    coalesce((p_product ->> 'is_active')::boolean, true)
  )
  on conflict (id) do update
  set
    name = excluded.name,
    category = excluded.category,
    team = excluded.team,
    driver = excluded.driver,
    price = excluded.price,
    stock = excluded.stock,
    sizes = excluded.sizes,
    description = excluded.description,
    details = excluded.details,
    image = excluded.image,
    images = excluded.images,
    is_active = excluded.is_active
  returning * into upserted_row;

  return upserted_row;
end;
$$;

create or replace function public.admin_delete_store_product(p_id text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_email text := lower(coalesce((auth.jwt() ->> 'email'), ''));
  caller_role text := lower(coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), ''));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if caller_email <> 'gama.orgas.up@phinmaed.com' and caller_role <> 'admin' then
    raise exception 'Not authorized';
  end if;

  delete from public.store_products where id = p_id;
end;
$$;

alter function public.admin_list_store_products() owner to postgres;
alter function public.admin_upsert_store_product(jsonb) owner to postgres;
alter function public.admin_delete_store_product(text) owner to postgres;

revoke all on function public.admin_list_store_products() from public;
revoke all on function public.admin_upsert_store_product(jsonb) from public;
revoke all on function public.admin_delete_store_product(text) from public;

grant execute on function public.admin_list_store_products() to authenticated;
grant execute on function public.admin_upsert_store_product(jsonb) to authenticated;
grant execute on function public.admin_delete_store_product(text) to authenticated;

notify pgrst, 'reload schema';
