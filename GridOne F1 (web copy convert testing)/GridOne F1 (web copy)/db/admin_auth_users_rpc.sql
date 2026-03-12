-- Expose auth users to admin dashboard via RPC.
-- Run in Supabase SQL Editor.

create or replace function public.admin_list_auth_users()
returns table (
  id uuid,
  email text,
  name text,
  status text,
  role text,
  registered_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name',
      '-'
    )::text as name,
    (
      case
        when u.banned_until is not null and u.banned_until > now() then 'suspended'
        else 'active'
      end
    )::text as status,
    coalesce(u.raw_app_meta_data ->> 'role', 'user')::text as role,
    u.created_at as registered_at,
    u.last_sign_in_at
  from auth.users u
  order by u.created_at desc;
end;
$$;

revoke all on function public.admin_list_auth_users() from public;
grant execute on function public.admin_list_auth_users() to authenticated;
