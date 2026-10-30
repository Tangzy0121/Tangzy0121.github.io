// Copy the Vite build into the GitHub Pages root (../). Removes only stale
// hashed bundles under ../assets; never touches git or anything else.
import { cpSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(src, 'dist');
const site = join(src, '..');
const assets = join(site, 'assets');
if (existsSync(assets)) for (const f of readdirSync(assets)) if (/^index-.*\.(js|css)$/.test(f)) rmSync(join(assets, f));
cpSync(dist, site, { recursive: true });
console.log(`deployed ${dist} -> ${site}`);
