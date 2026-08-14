# Changelog

All notable changes to `docfill-sdk` are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## 1.0.0

Production-hardening release.

### Added
- **Hybrid watcher**: reliable HTTPS polling plus an optional Realtime **Broadcast**
  accelerator (`realtime` option). Broadcast carries only a wake-up signal; the payload is
  always fetched through the token-gated `get_session` RPC. Works on websocket-blocked networks.
- **Resilient polling**: consecutive-error backoff with `maxPollErrors` abandon, in-flight
  guard, jitter, and expiry handling.
- **Abortable file injection**: `AbortController` + per-file `fetchTimeoutMs`; `destroy()`
  aborts in-flight fetches.
- **URL allow-listing** for file injection (https, or http on localhost only).
- **Typed errors**: `DocFillError` with a `code` (`DocFillErrorCode`).
- **Logging**: `debug` flag and pluggable `logger`.
- **Tag registry v2**: 72 tags across 11 groups (`DOCFILL_TAGS`, `TAG_MAP`, `TAG_GROUPS`,
  `isFileTag`, `TAG_SCHEMA_VERSION`), exported and mirrored to `tags.json`.
- **Tests + CI**: Vitest unit suite and a GitHub Actions workflow.
- `LICENSE`, developer guide, and this changelog.

### Changed
- Accessibility: injected chips now use `role="status"` / `aria-live="polite"`.
- Default poll interval is 1500ms.

## 0.2.0
- Tag registry v2 (expanded document vocabulary).

## 0.1.3
- Security hardening: per-session capability token + SECURITY DEFINER RPCs
  (`create_session` / `get_session` / `fill_session`); direct table access revoked;
  Realtime table streaming removed in favor of polling.

## 0.1.2
- Real file injection into native `<input type="file">` via `DataTransfer`, with reference
  fallback when bytes aren't fetchable.

## 0.1.1
- Baked-in shared backend defaults; developers pass only `formId`.

## 0.1.0
- Initial release: DOM scan, QR rendering, Supabase session, text/file injection.
