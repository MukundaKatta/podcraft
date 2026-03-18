-- PodCraft Database Schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Series table
create table public.series (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  default_format text not null default 'interview' check (default_format in ('interview', 'debate', 'explainer', 'qna')),
  default_host_config jsonb not null default '{}'::jsonb,
  episode_count integer not null default 0,
  is_public boolean not null default false,
  rss_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Episodes table
create table public.episodes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid references public.series(id) on delete set null,
  title text not null,
  description text,
  format text not null default 'interview' check (format in ('interview', 'debate', 'explainer', 'qna')),
  status text not null default 'draft' check (status in ('draft', 'processing', 'generating', 'ready', 'published', 'failed')),
  audio_url text,
  audio_duration real,
  audio_size integer,
  cover_image_url text,
  transcript jsonb,
  chapters jsonb,
  host_config jsonb not null default '{}'::jsonb,
  quality_settings jsonb not null default '{}'::jsonb,
  metadata jsonb,
  play_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- Documents table
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('pdf', 'url', 'text')),
  source_url text,
  storage_path text,
  content_text text,
  content_summary text,
  page_count integer,
  word_count integer,
  created_at timestamptz not null default now()
);

-- Analytics events table
create table public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  event_type text not null check (event_type in ('play', 'pause', 'complete', 'seek', 'download', 'share', 'subscribe')),
  listener_id text,
  data jsonb,
  created_at timestamptz not null default now()
);

-- Feed subscriptions table
create table public.feed_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid not null references public.series(id) on delete cascade,
  subscriber_email text,
  subscriber_id text,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_episodes_user_id on public.episodes(user_id);
create index idx_episodes_series_id on public.episodes(series_id);
create index idx_episodes_status on public.episodes(status);
create index idx_episodes_created_at on public.episodes(created_at desc);

create index idx_documents_episode_id on public.documents(episode_id);
create index idx_documents_user_id on public.documents(user_id);

create index idx_analytics_episode_id on public.analytics_events(episode_id);
create index idx_analytics_event_type on public.analytics_events(event_type);
create index idx_analytics_created_at on public.analytics_events(created_at);

create index idx_series_user_id on public.series(user_id);
create index idx_series_rss_slug on public.series(rss_slug);

create index idx_feed_subs_series_id on public.feed_subscriptions(series_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Increment play count
create or replace function public.increment_play_count(episode_id uuid)
returns void as $$
begin
  update public.episodes
  set play_count = play_count + 1
  where id = episode_id;
end;
$$ language plpgsql security definer;

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Update series episode count
create or replace function public.update_series_episode_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' and new.series_id is not null then
    update public.series
    set episode_count = episode_count + 1,
        updated_at = now()
    where id = new.series_id;
  elsif tg_op = 'DELETE' and old.series_id is not null then
    update public.series
    set episode_count = greatest(0, episode_count - 1),
        updated_at = now()
    where id = old.series_id;
  elsif tg_op = 'UPDATE' then
    if old.series_id is distinct from new.series_id then
      if old.series_id is not null then
        update public.series
        set episode_count = greatest(0, episode_count - 1),
            updated_at = now()
        where id = old.series_id;
      end if;
      if new.series_id is not null then
        update public.series
        set episode_count = episode_count + 1,
            updated_at = now()
        where id = new.series_id;
      end if;
    end if;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

create trigger episodes_updated_at
  before update on public.episodes
  for each row execute function public.handle_updated_at();

create trigger series_updated_at
  before update on public.series
  for each row execute function public.handle_updated_at();

create trigger episodes_series_count
  after insert or update or delete on public.episodes
  for each row execute function public.update_series_episode_count();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.series enable row level security;
alter table public.episodes enable row level security;
alter table public.documents enable row level security;
alter table public.analytics_events enable row level security;
alter table public.feed_subscriptions enable row level security;

-- Series policies
create policy "Users can view own series"
  on public.series for select
  using (auth.uid() = user_id);

create policy "Users can insert own series"
  on public.series for insert
  with check (auth.uid() = user_id);

create policy "Users can update own series"
  on public.series for update
  using (auth.uid() = user_id);

create policy "Users can delete own series"
  on public.series for delete
  using (auth.uid() = user_id);

create policy "Public series are viewable by all"
  on public.series for select
  using (is_public = true);

-- Episodes policies
create policy "Users can view own episodes"
  on public.episodes for select
  using (auth.uid() = user_id);

create policy "Users can insert own episodes"
  on public.episodes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own episodes"
  on public.episodes for update
  using (auth.uid() = user_id);

create policy "Users can delete own episodes"
  on public.episodes for delete
  using (auth.uid() = user_id);

-- Documents policies
create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Analytics policies (anyone can insert, only owner can read)
create policy "Anyone can insert analytics"
  on public.analytics_events for insert
  with check (true);

create policy "Episode owners can view analytics"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.episodes
      where episodes.id = analytics_events.episode_id
      and episodes.user_id = auth.uid()
    )
  );

-- Feed subscriptions policies
create policy "Anyone can subscribe"
  on public.feed_subscriptions for insert
  with check (true);

create policy "Series owners can view subscriptions"
  on public.feed_subscriptions for select
  using (
    exists (
      select 1 from public.series
      where series.id = feed_subscriptions.series_id
      and series.user_id = auth.uid()
    )
  );
