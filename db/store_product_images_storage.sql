-- Supabase Storage for MiniStore product images
-- Run this in Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-product-images',
  'store-product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "store_product_images_public_read" on storage.objects;
create policy "store_product_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'store-product-images');

drop policy if exists "store_product_images_admin_insert" on storage.objects;
create policy "store_product_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'store-product-images'
  and (
    lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin'
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'gama.orgas.up@phinmaed.com'
  )
);

drop policy if exists "store_product_images_admin_update" on storage.objects;
create policy "store_product_images_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'store-product-images'
  and (
    lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin'
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'gama.orgas.up@phinmaed.com'
  )
)
with check (
  bucket_id = 'store-product-images'
  and (
    lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin'
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'gama.orgas.up@phinmaed.com'
  )
);

drop policy if exists "store_product_images_admin_delete" on storage.objects;
create policy "store_product_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'store-product-images'
  and (
    lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin'
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'gama.orgas.up@phinmaed.com'
  )
);
