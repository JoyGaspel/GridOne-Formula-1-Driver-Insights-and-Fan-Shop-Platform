-- OTP storage table for GCash payment verification
create table if not exists public.store_otp_requests (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  verified_at timestamptz,
  attempts integer not null default 0
);

create index if not exists store_otp_requests_phone_idx
  on public.store_otp_requests (phone, created_at desc);

alter table public.store_otp_requests enable row level security;

-- Only service role should access OTP data
drop policy if exists "No public access to OTP requests" on public.store_otp_requests;
create policy "No public access to OTP requests"
  on public.store_otp_requests
  for all
  using (false)
  with check (false);
