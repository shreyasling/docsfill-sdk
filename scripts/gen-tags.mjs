// Regenerates tags.json from the built registry so the portable copy stays in
// sync with src/tags.ts. Runs automatically after `npm run build`.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DOCFILL_TAGS, TAG_GROUPS, TAG_SCHEMA_VERSION } from '../dist/index.js';

const out = { TAG_SCHEMA_VERSION, groups: TAG_GROUPS, tags: DOCFILL_TAGS };
const path = fileURLToPath(new URL('../tags.json', import.meta.url));
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
console.log(`tags.json regenerated: ${DOCFILL_TAGS.length} tags, schema v${TAG_SCHEMA_VERSION}`);
