-- DocFill security hardening — capability-token model for the shared `sessions` table.
--
-- This is the SHARED backend contract that docfill-sdk and docfill-pwa both depend on.
-- It should already be applied by the PWA/SQL side; this file documents it for the SDK repo.
-- Safe to re-run: uses CREATE OR REPLACE and IF NOT EXISTS.
--
-- Effect: direct select/insert/update on `sessions` is revoked for anon. All access goes
-- through three SECURITY DEFINER RPCs gated by a per-session secret token, so a stolen
-- publishable key can no longer dump other users' sessions.

create extension if not exists pgcrypto with schema extensions;

alter table sessions add column if not exists access_token text;
alter table sessions add column if not exists origin text;   -- "which website" audit stamp

-- Realtime is disabled on this table (RLS-locked tables don't stream); the SDK polls.
alter publication supabase_realtime drop table sessions;

-- SDK: create a pending session, returns its id + capability token.
-- p_origin is optional so older SDKs (no origin) still work.
-- Drop any prior 2-arg overload so PostgREST has a single unambiguous candidate.
drop function if exists create_session(text, jsonb);

create or replace function create_session(
  p_form_id text,
  p_required_tags jsonb,
  p_origin text default null
)
returns table (id uuid, access_token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text := encode(gen_random_bytes(32), 'base64');
begin
  return query
  insert into sessions (form_id, required_tags, status, access_token, origin)
  values (p_form_id, p_required_tags, 'pending', v_token, p_origin)
  returning sessions.id, sessions.access_token;
end;
$$;

-- SDK: read a session by id, only with the matching token.
create or replace function get_session(p_id uuid, p_token text)
returns table (
  id uuid,
  form_id text,
  required_tags jsonb,
  status text,
  filled_payload jsonb,
  created_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select s.id, s.form_id, s.required_tags, s.status, s.filled_payload, s.created_at, s.expires_at
  from sessions s
  where s.id = p_id and s.access_token = p_token;
end;
$$;

-- PWA: mark a session filled, only with the matching token.
create or replace function fill_session(p_id uuid, p_token text, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update sessions
  set status = 'filled', filled_payload = p_payload
  where id = p_id and access_token = p_token and status = 'pending';
end;
$$;

-- Lock down the table; expose only the RPCs.
revoke all on table sessions from anon, authenticated;
grant execute on function create_session(text, jsonb, text) to anon, authenticated;
grant execute on function get_session(uuid, text) to anon, authenticated;
grant execute on function fill_session(uuid, text, jsonb) to anon, authenticated;
