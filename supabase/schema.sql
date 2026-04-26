create extension if not exists "pgcrypto";

create table if not exists public.topic_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id bigint not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  backdrop_path text,
  created_at timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type)
);

alter table public.topic_watchlist enable row level security;

create policy "Users can view their own watchlist"
on public.topic_watchlist
for select
using (auth.uid() = user_id);

create policy "Users can add their own watchlist items"
on public.topic_watchlist
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own watchlist items"
on public.topic_watchlist
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own watchlist items"
on public.topic_watchlist
for delete
using (auth.uid() = user_id);
