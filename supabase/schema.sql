-- DocFill shared Supabase schema.
-- DO NOT rename tables/columns — docfill-sdk, docfill-pwa and docfill-demo-form all depend on this.

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  form_id text not null,
  required_tags jsonb not null,             -- e.g. ["identity.pan","identity.dob","education.12th_marksheet"]
  status text not null default 'pending',   -- 'pending' | 'filled' | 'expired'
  filled_payload jsonb,                      -- keyed by tag; see README §Payload shape
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes')
);

-- Realtime: let clients subscribe to UPDATEs on sessions.
alter publication supabase_realtime add table sessions;

-- RLS: anonymous insert + select is intentional for this hackathon-scale project.
-- The demo form is unauthenticated. This is a KNOWN SIMPLIFICATION (see README).
alter table sessions enable row level security;

create policy "anon can insert sessions"
  on sessions for insert
  to anon
  with check (true);

create policy "anon can select sessions"
  on sessions for select
  to anon
  using (true);

-- Note: the SDK never UPDATEs sessions. Updates (status -> 'filled', filled_payload)
-- are performed by the PWA, which should authenticate and use its own policy.
