-- ============================================================================
-- "The Places I've Been" — Personal Travel Journal Database & Private Storage
-- Run this SQL in your Supabase Project's SQL Editor.
-- ============================================================================

-- 1. Destinations table (covers both Visited Places and Wishlist Places)
create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  country text,
  city text,
  travel_date date,
  description text not null default '',
  is_wishlist boolean not null default false,
  wishlist_notes text not null default '',
  is_featured boolean not null default false,
  latitude double precision,
  longitude double precision,
  paper_theme text not null default 'sage',
  sticker_motif text not null default 'aeroplane',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Destination photos table
create table if not exists public.destination_photos (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  storage_path text not null,
  caption text not null default '',
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  rotation_deg double precision not null default 0,
  tape_style text not null default 'sage',
  created_at timestamptz not null default now()
);

-- Indexes for snappy queries
create index if not exists destinations_user_wishlist_idx
  on public.destinations (user_id, is_wishlist, created_at desc);

create index if not exists destination_photos_dest_idx
  on public.destination_photos (destination_id, sort_order asc, created_at asc);

create index if not exists destination_photos_user_idx
  on public.destination_photos (user_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists destinations_set_updated_at on public.destinations;
create trigger destinations_set_updated_at
  before update on public.destinations
  for each row
  execute function public.set_updated_at();

-- 3. Row-Level Security (Strict single-user private access)
alter table public.destinations enable row level security;
alter table public.destination_photos enable row level security;

drop policy if exists "Owner can view own destinations" on public.destinations;
create policy "Owner can view own destinations"
  on public.destinations for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owner can insert own destinations" on public.destinations;
create policy "Owner can insert own destinations"
  on public.destinations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owner can update own destinations" on public.destinations;
create policy "Owner can update own destinations"
  on public.destinations for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owner can delete own destinations" on public.destinations;
create policy "Owner can delete own destinations"
  on public.destinations for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owner can view own destination photos" on public.destination_photos;
create policy "Owner can view own destination photos"
  on public.destination_photos for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Owner can insert own destination photos" on public.destination_photos;
create policy "Owner can insert own destination photos"
  on public.destination_photos for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owner can update own destination photos" on public.destination_photos;
create policy "Owner can update own destination photos"
  on public.destination_photos for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owner can delete own destination photos" on public.destination_photos;
create policy "Owner can delete own destination photos"
  on public.destination_photos for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 4. Private Storage Bucket for Travel Photographs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'travel-photos',
  'travel-photos',
  false,
  15728640, -- 15 MB per photo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: Only the authenticated owner can read/write inside their own <uid>/ folder
drop policy if exists "Owner can read own travel photos" on storage.objects;
create policy "Owner can read own travel photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Owner can upload own travel photos" on storage.objects;
create policy "Owner can upload own travel photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Owner can update own travel photos" on storage.objects;
create policy "Owner can update own travel photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Owner can delete own travel photos" on storage.objects;
create policy "Owner can delete own travel photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

