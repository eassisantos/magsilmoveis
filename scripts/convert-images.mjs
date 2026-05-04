/**
 * Converts all PNG/JPEG images in public/images to WebP.
 * Keeps originals. Overwrites .webp if already exists.
 * Run: node scripts/convert-images.mjs
 */
import { createRequire } from 'module';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'public', 'images');

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let converted = 0;
let saved = 0;

for await (const file of walk(ROOT)) {
  const ext = extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

  // Skip og-default.jpg (must stay JPEG for social media scrapers)
  if (basename(file) === 'og-default.jpg') continue;

  const out = file.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const origSize = (await stat(file)).size;

  await sharp(file)
    .webp({ quality: 82, effort: 4, smartSubsample: true })
    .toFile(out);

  const newSize = (await stat(out)).size;
  const pct = Math.round((1 - newSize / origSize) * 100);
  console.log(`✓ ${basename(out)} — ${(origSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (−${pct}%)`);
  converted++;
  saved += (origSize - newSize);
}

console.log(`\n✅ ${converted} imagens convertidas — ${(saved / 1024 / 1024).toFixed(2)}MB economizados`);
