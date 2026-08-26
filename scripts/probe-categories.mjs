// Fetch the visible-tool list for each category page on tool.browser.qq.com,
// to derive the tool→category mapping used by the original site.
import fs from 'fs';

const CATS = [
  { slug: 'img', name: '图片工具' },
  { slug: 'pdf', name: 'PDF转换工具' },
  { slug: 'data', name: '数据换算工具' },
  { slug: 'life', name: '生活娱乐工具' },
  { slug: 'education', name: '教育工具' },
  { slug: 'text', name: '文本工具' },
  { slug: 'doc', name: '文档转换工具' },
  { slug: 'develop', name: '开发工具' },
  { slug: 'video', name: '视频工具' },
  { slug: 'pc_plugin', name: '浏览器插件' },
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

async function fetchVisibleTools(slug) {
  const url = `https://tool.browser.qq.com/category/${slug}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const html = await res.text();
  // The page renders client-side, so the raw HTML may not have the tool grid.
  // But the mapping is embedded in the page's JS state. Try to find a JSON blob.
  // Look for the tool list data — search for known tool hrefs and surrounding category.
  // Strategy: extract the script that defines the page data.
  // Write raw HTML for inspection if needed.
  return html;
}

const out = {};
for (const c of CATS) {
  const html = await fetchVisibleTools(c.slug);
  // Try to find tools: the page embeds tool objects. Look for an array with hrefs.
  // Heuristic: find all occurrences of "/<tool>.html" or tool names, but we need category.
  // Better: the page's data is in a window.__INITIAL_STATE__ or similar.
  const stateMatch = html.match(/window\.__\w+__\s*=\s*({[\s\S]*?});/);
  out[c.slug] = {
    name: c.name,
    htmlLen: html.length,
    hasState: !!stateMatch,
    statePreview: stateMatch ? stateMatch[1].slice(0, 200) : null,
  };
  console.log(`${c.slug}: html=${html.length} state=${!!stateMatch}`);
}
fs.writeFileSync('docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/category-probe.json', JSON.stringify(out, null, 2));
console.log('done');
