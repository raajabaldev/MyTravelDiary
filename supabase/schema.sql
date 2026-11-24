-- ============================================================================
-- "The Places I've Been" — Public Read-Only + Owner-Write Database & Storage
-- Run this SQL in your Supabase Project's SQL Editor.
-- ============================================================================

-- 1. Single-owner registry (ensures only designated owner accounts can write)
create table if not exists public.journal_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

revoke all on table public.journal_owners from anon;
grant select on table public.journal_owners to authenticated;

alter table public.journal_owners enable row level security;

drop policy if exists "Owner can verify own membership" on public.journal_owners;
create policy "Owner can verify own membership"
  on public.journal_owners for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Registers the initial owner user if one already exists in Auth
insert into public.journal_owners (user_id)
select id from auth.users
order by created_at asc
limit 1
on conflict (user_id) do nothing;

-- 2. Destinations table (covers both Visited Places and Wishlist Places)
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
  is_published boolean not null default true,
  latitude double precision,
  longitude double precision,
  paper_theme text not null default 'sage',
  sticker_motif text not null default 'aeroplane',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Destination photos table
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

-- Indexes
create index if not exists destinations_user_wishlist_idx
  on public.destinations (user_id, is_wishlist, created_at desc);

create index if not exists destinations_published_idx
  on public.destinations (is_published, is_wishlist, created_at desc);

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

-- 4. Table privileges & Row-Level Security
grant select on table public.destinations to anon;
grant select, insert, update, delete on table public.destinations to authenticated;

grant select on table public.destination_photos to anon;
grant select, insert, update, delete on table public.destination_photos to authenticated;

alter table public.destinations enable row level security;
alter table public.destination_photos enable row level security;

drop policy if exists "Visitors can view published destinations" on public.destinations;
create policy "Visitors can view published destinations"
  on public.destinations for select
  to anon
  using (is_published = true);

drop policy if exists "Owner can view own destinations" on public.destinations;
create policy "Owner can view own destinations"
  on public.destinations for select
  to authenticated
  using (
    is_published = true
    or (
      (select auth.uid()) = user_id
      and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
    )
  );

drop policy if exists "Owner can insert own destinations" on public.destinations;
create policy "Owner can insert own destinations"
  on public.destinations for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  );

drop policy if exists "Owner can update own destinations" on public.destinations;
create policy "Owner can update own destinations"
  on public.destinations for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  );

drop policy if exists "Owner can delete own destinations" on public.destinations;
create policy "Owner can delete own destinations"
  on public.destinations for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  );

drop policy if exists "Visitors can view photos of published destinations" on public.destination_photos;
create policy "Visitors can view photos of published destinations"
  on public.destination_photos for select
  to anon
  using (
    exists (
      select 1 from public.destinations d
      where d.id = destination_id
        and d.is_published = true
    )
  );

drop policy if exists "Owner can view own destination photos" on public.destination_photos;
create policy "Owner can view own destination photos"
  on public.destination_photos for select
  to authenticated
  using (
    exists (
      select 1 from public.destinations d
      where d.id = destination_id
        and (
          d.is_published = true
          or (
            d.user_id = (select auth.uid())
            and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
          )
        )
    )
  );

drop policy if exists "Owner can insert own destination photos" on public.destination_photos;
create policy "Owner can insert own destination photos"
  on public.destination_photos for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
    and exists (
      select 1 from public.destinations d
      where d.id = destination_id and d.user_id = (select auth.uid())
    )
  );

drop policy if exists "Owner can update own destination photos" on public.destination_photos;
create policy "Owner can update own destination photos"
  on public.destination_photos for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  );

drop policy if exists "Owner can delete own destination photos" on public.destination_photos;
create policy "Owner can delete own destination photos"
  on public.destination_photos for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  );

-- 5. Storage Bucket for Travel Photographs (RLS-gated private bucket)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'travel-photos',
  'travel-photos',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Visitors can read published travel photos" on storage.objects;
create policy "Visitors can read published travel photos"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'travel-photos'
    and storage.allow_any_operation(array['object.get_authenticated_info', 'object.get_authenticated'])
    and exists (
      select 1
      from public.destination_photos dp
      join public.destinations d on d.id = dp.destination_id
      where dp.storage_path = storage.objects.name
        and d.is_published = true
    )
  );

drop policy if exists "Owner can read own travel photos" on storage.objects;
create policy "Owner can read own travel photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'travel-photos'
    and (
      (
        (storage.foldername(name))[1] = (select auth.uid())::text
        and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
      )
      or (
        storage.allow_any_operation(array['object.get_authenticated_info', 'object.get_authenticated'])
        and exists (
          select 1
          from public.destination_photos dp
          join public.destinations d on d.id = dp.destination_id
          where dp.storage_path = storage.objects.name
            and d.is_published = true
        )
      )
    )
  );

drop policy if exists "Owner can upload own travel photos" on storage.objects;
create policy "Owner can upload own travel photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  );

drop policy if exists "Owner can update own travel photos" on storage.objects;
create policy "Owner can update own travel photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  )
  with check (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  );

drop policy if exists "Owner can delete own travel photos" on storage.objects;
create policy "Owner can delete own travel photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'travel-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.journal_owners o where o.user_id = (select auth.uid()))
  );
