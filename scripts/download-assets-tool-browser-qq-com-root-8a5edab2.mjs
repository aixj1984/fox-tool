// Asset downloader for tool.browser.qq.com clone
// Fetches: logo, search icon, float-nav icons, banner more arrow, footer logo/qr, share icon,
// banner featured icons, and all 166 tool card icons into namespaced asset roots.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Asset roots
const SHARED = path.join(ROOT, 'public/sites/tool-browser-qq-com/shared');
const PAGE = path.join(ROOT, 'public/sites/tool-browser-qq-com/root-8a5edab2');
const IMG_SHARED = path.join(SHARED, 'images');
const IMG_PAGE = path.join(PAGE, 'images');
[IMG_SHARED, IMG_PAGE].forEach((d) => fs.mkdirSync(d, { recursive: true }));

// Static (same-site shared) assets — logo, nav icons, footer, search, share
const staticAssets = [
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qbtool/qbtool-latest.png', dest: IMG_SHARED + '/logo.png' },
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qbtool/search_icon.png', dest: IMG_SHARED + '/search-icon.png' },
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qbtool/nav-top.png', dest: IMG_SHARED + '/nav-top.png' },
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qbtool/nav-qqgroup.png', dest: IMG_SHARED + '/nav-qqgroup.png' },
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qb_tool/pchom_more/more.png', dest: IMG_SHARED + '/more-arrow.png' },
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qbtool/footer-logo.png', dest: IMG_SHARED + '/footer-logo.png' },
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qbtool/footer-qrcode.png', dest: IMG_SHARED + '/footer-qrcode.png' },
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/pcqb/qbtool/tool-share-link.png', dest: IMG_SHARED + '/share-link.png' },
  // banner featured card icons
  { url: 'https://m4.publicimg.browser.qq.com/publicimg/pcqb/home_work_help.png', dest: IMG_PAGE + '/banner-homework.png' },
];

// Tool icons — read from the raw extraction
const toolsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/tools-raw.json'), 'utf8'));

// slugify a tool name to a safe filename
const slug = (s) => s.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'tool';

// Build tool icon download list: dedupe by URL, name file by tool slug
const seenUrl = new Set();
const toolIconJobs = [];
const toolIconMap = {}; // url -> filename
for (const t of toolsRaw.data) {
  if (!t.icon) continue;
  if (!seenUrl.has(t.icon)) {
    seenUrl.add(t.icon);
    const fn = `icon-${slug(t.name)}.png`;
    toolIconJobs.push({ url: t.icon, dest: IMG_SHARED + '/' + fn });
    toolIconMap[t.icon] = fn;
  }
}

// Banner featured icons (already in staticAssets for homework; the other two are tool icons reused)
// 在线录屏, Excel转PDF, 图片压缩, 证件照生成, 垃圾分类查询 — these are tool icons, covered by toolIconJobs.

const allJobs = [...staticAssets, ...toolIconJobs];

// Download with concurrency 6
async function download(job) {
  const { url, dest } = job;
  if (fs.existsSync(dest)) {
    return { url, dest, status: 'skip-exists' };
  }
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return { url, dest, status: 'ok', bytes: buf.length };
  } catch (e) {
    return { url, dest, status: 'fail', error: String(e.message || e) };
  }
}

async function run() {
  console.log(`Downloading ${allJobs.length} assets (concurrency 6)...`);
  const results = [];
  const queue = [...allJobs];
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const job = queue.shift();
      const r = await download(job);
      results.push(r);
      if (r.status === 'fail') console.log('FAIL', r.url, r.error);
    }
  });
  await Promise.all(workers);

  const ok = results.filter((r) => r.status === 'ok').length;
  const skip = results.filter((r) => r.status === 'skip-exists').length;
  const fail = results.filter((r) => r.status === 'fail');
  console.log(`Done. ok=${ok} skip=${skip} fail=${fail.length}`);
  if (fail.length) console.log('Failed URLs:\n' + fail.map((f) => '  ' + f.url).join('\n'));

  // Write the icon-map so the data generator can reference local filenames
  fs.writeFileSync(path.join(ROOT, 'docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/icon-map.json'), JSON.stringify(toolIconMap, null, 2));
  console.log('Wrote icon-map.json (' + Object.keys(toolIconMap).length + ' entries)');
}

run();
