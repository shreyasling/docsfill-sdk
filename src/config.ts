/**
 * Platform defaults for the shared DocFill backend.
 *
 * These are baked in so form developers only need to pass `formId`. The
 * Supabase publishable key is browser-safe by design (it can only do what RLS
 * allows), so shipping it in the package is fine. Any option can still be
 * overridden per-instance for self-hosting/testing.
 *
 * Platform owner: update these three values in ONE place if the project,
 * key, or PWA URL ever changes.
 */
export const DEFAULT_SUPABASE_URL = 'https://eovrcvoopynjhoxmetgx.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_9r21sMpAaoMIelRY2A6ROA_eX7CjJd2';
export const DEFAULT_PWA_URL = 'https://docfill-pwa.example.app';
