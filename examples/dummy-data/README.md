# dummy-data

Captured form submissions from the smoke test land here as `submission-<timestamp>.json`.

Each file is exactly what a real form's submit handler receives from the SDK:
- **text tags** → `{ "type": "text", "value": "..." }`
- **file tags** → `{ "type": "file", "fileName": "...", "driveFileId": "...", "driveUrl": "..." }`

This is proof that values and document references really arrive. Actual file bytes stay in the
user's Google Drive (zero-copy) — the SDK delivers a reference, never the raw file (browser
security forbids setting a native file input).
