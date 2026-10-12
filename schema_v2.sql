-- Run this ONCE in Supabase SQL Editor (after schema.sql). Adds leaderboard + gallery.

-- Leaderboard: members with the most APPROVED exercises (safe: exposes only name + count)
create or replace function public.get_leaderboard(lim int default 5)
returns table (full_name text, total bigint)
language sql security definer set search_path = public stable as $$
  select p.full_name, count(*) as total
  from workout_requests w join profiles p on p.id = w.member_id
  where w.status = 'approved' and p.active
  group by p.id, p.full_name order by total desc limit lim;
$$;
grant execute on function public.get_leaderboard(int) to anon, authenticated;

-- Gallery
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_path text not null,
  caption text,
  created_at timestamptz not null default now()
);
create table public.gallery_likes (
  photo_id uuid references public.gallery_photos(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (photo_id, user_id)
);
alter table public.gallery_photos enable row level security;
alter table public.gallery_likes enable row level security;

create policy "photos_select" on public.gallery_photos for select using (true);
create policy "photos_insert" on public.gallery_photos for insert with check (user_id = auth.uid());
create policy "photos_delete" on public.gallery_photos for delete using (user_id = auth.uid() or public.is_admin());
create policy "likes_select" on public.gallery_likes for select using (true);
create policy "likes_insert" on public.gallery_likes for insert with check (user_id = auth.uid());
create policy "likes_delete" on public.gallery_likes for delete using (user_id = auth.uid());

-- Storage bucket for images (public read, users upload into their own folder)
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict do nothing;
create policy "gallery_read" on storage.objects for select using (bucket_id = 'gallery');
create policy "gallery_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "gallery_remove" on storage.objects for delete to authenticated
  using (bucket_id = 'gallery' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
