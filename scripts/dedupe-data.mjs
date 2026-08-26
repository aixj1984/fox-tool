// Dedupe duplicate keys in a Record<string,string> data file (last-wins).
// Usage: node scripts/dedupe-data.mjs <file.ts> <exportName>
import fs from 'fs';

const file = process.argv[2];
const exportName = process.argv[3];
if (!file || !exportName) {
  console.error('Usage: node dedupe-data.mjs <file.ts> <exportName>');
  process.exit(1);
}

const src = fs.readFileSync(file, 'utf8');
// Match: export const NAME: ... = { ... };
const re = new RegExp(
  `(export const ${exportName}\\s*:\\s*Record<string,\\s*string>\\s*=\\s*\\{)([\\s\\S]*?)(\\};)`,
);
const m = src.match(re);
if (!m) {
  console.error(`Could not find export ${exportName} in ${file}`);
  process.exit(2);
}

// Parse the object body: extract "key": "value" pairs.
const body = m[2];
const pairRe = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
const pairs = [];
let pm;
while ((pm = pairRe.exec(body)) !== null) {
  pairs.push([pm[1], pm[2]]);
}

// Dedupe: last-wins, preserve first-seen order.
const seen = new Map();
for (const [k, v] of pairs) {
  seen.set(k, v); // overwrites, keeps original insertion position
}
const unique = [...seen.entries()];

console.log(`${exportName}: ${pairs.length} pairs → ${unique.length} unique (${pairs.length - unique.length} dupes removed)`);

// Re-emit, ~7 per line.
const lines = [];
for (let i = 0; i < unique.length; i += 7) {
  const chunk = unique.slice(i, i + 7).map(([k, v]) => `  "${k}": "${v}"`).join(', ');
  lines.push(chunk + (i + 7 < unique.length ? ',' : ''));
}
const newBody = '\n' + lines.join('\n') + '\n';
const out = src.replace(re, `${m[1]}${newBody}${m[3]}`);
fs.writeFileSync(file, out);
console.log('Rewrote', file);
