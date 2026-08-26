import fs from 'fs';
const p = 'C:/Users/xiongjun.ai/.claude/projects/E--01project-01vue-ai-website-cloner-template/055796e8-1785-45d9-8492-f33342c52b67/tool-results/call_6f0f0a6ac1864d9d9780caf1.json';
const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
let text = raw[0].text;
// Strip the trailing "### Ran Playwright code" echo appended by the harness
const cut = text.indexOf('\n### Ran Playwright code');
if (cut >= 0) text = text.slice(0, cut);
// text now is '### Result\n"<escaped json>"' — take from the first quote
const jsonStr = text.slice(text.indexOf('"'));
const obj = JSON.parse(JSON.parse(jsonStr));
const out = 'docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/tools-raw.json';
fs.writeFileSync(out, JSON.stringify(obj, null, 2));
console.log('Wrote', out);
console.log('total:', obj.total, 'visible:', obj.visibleCount);
const badges = {};
obj.data.forEach(d => { if (d.label) badges[d.label] = (badges[d.label] || 0) + 1; });
console.log('badges:', JSON.stringify(badges));
const hosts = {};
obj.data.forEach(d => { try { const u = new URL(d.icon); hosts[u.host] = (hosts[u.host] || 0) + 1; } catch (e) {} });
console.log('icon hosts:', JSON.stringify(hosts));
const visibleNames = obj.data.filter(d => d.visible).map(d => d.name);
console.log('first 5 visible:', visibleNames.slice(0, 5));
console.log('hidden idx:', obj.data.filter(d => !d.visible).map(d => d.idx + ':' + d.name));
