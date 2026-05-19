-- Run this entire script in Supabase → SQL Editor → Run
-- Fixes: "Supabase blocked this save" (RLS / permissions for browser anon key)

-- 1) Table API access (required in addition to RLS policies)
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public."Comments" to anon, authenticated;
grant select, insert, update, delete on table public."Sessions" to anon, authenticated;

-- 2) Row Level Security
alter table public."Comments" enable row level security;
alter table public."Sessions" enable row level security;

-- Comments policies (anon = browser app using VITE_SUPABASE_ANON_KEY)
drop policy if exists "anon read comments" on public."Comments";
drop policy if exists "anon insert comments" on public."Comments";
drop policy if exists "anon update comments" on public."Comments";
drop policy if exists "anon delete comments" on public."Comments";

create policy "anon read comments"
  on public."Comments" for select to anon using (true);

create policy "anon insert comments"
  on public."Comments" for insert to anon with check (true);

create policy "anon update comments"
  on public."Comments" for update to anon using (true) with check (true);

create policy "anon delete comments"
  on public."Comments" for delete to anon using (true);

-- Sessions policies
drop policy if exists "anon read sessions" on public."Sessions";
drop policy if exists "anon insert sessions" on public."Sessions";

create policy "anon read sessions"
  on public."Sessions" for select to anon using (true);

create policy "anon insert sessions"
  on public."Sessions" for insert to anon with check (true);

-- 3) Optional: dedicated author columns for Review Mode editor
alter table public."Comments" add column if not exists author_name text;
alter table public."Comments" add column if not exists author_position text;
