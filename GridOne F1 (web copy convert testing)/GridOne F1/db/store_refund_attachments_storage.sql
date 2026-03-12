-- Supabase Storage for MiniStore refund attachments
-- Run this in Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'refund-attachments',
  'refund-attachments',
  true,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "refund_attachments_public_read" on storage.objects;
create policy "refund_attachments_public_read"
on storage.objects
for select
to public
using (bucket_id = 'refund-attachments');

drop policy if exists "refund_attachments_user_insert" on storage.objects;
create policy "refund_attachments_user_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'refund-attachments'
  and name like ('refunds/' || auth.uid()::text || '/%')
);

drop policy if exists "refund_attachments_admin_update" on storage.objects;
create policy "refund_attachments_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'refund-attachments'
  and public.is_ministore_admin()
)
with check (
  bucket_id = 'refund-attachments'
  and public.is_ministore_admin()
);

drop policy if exists "refund_attachments_admin_delete" on storage.objects;
create policy "refund_attachments_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'refund-attachments'
  and public.is_ministore_admin()
);
