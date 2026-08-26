// Generates the shared TypeScript data module + types from tools-raw.json + icon-map.json.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RES = path.join(ROOT, 'docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2');

const toolsRaw = JSON.parse(fs.readFileSync(path.join(RES, 'tools-raw.json'), 'utf8'));
const iconMap = JSON.parse(fs.readFileSync(path.join(RES, 'icon-map.json'), 'utf8'));
const catMap = JSON.parse(fs.readFileSync(path.join(RES, 'category-mapping.json'), 'utf8'));

// tool href -> category slug
const toolToCat = {};
for (const [cat, hrefs] of Object.entries(catMap)) {
  for (const h of hrefs) toolToCat[h] = cat;
}

// All pure-frontend tool hrefs (108): original 70 + 38 newly-feasible.
// These get rewritten to clean App Router routes (e.g. /md5.html -> /md5).
const frontendHrefs = new Set([
  // --- original 70 ---
  '/md5.html','/unicode.html','/urlencode.html','/base64.html','/crypto.html','/image_secret_msg.html','/text_secret_msg.html','/uuid.html',
  '/hexconvert.html','/chinese.html','/num2zh.html','/jsonbeautify.html','/jsoncheck.html','/jsondiff.html','/yaml_2_json.html','/urlparse.html','/colortrans.html','/byte_cal.html',
  '/calculator.html','/bmi.html','/mortgage.html','/invest.html','/wuxianyijin.html','/datecal.html','/shelflife.html','/temperaturetrans.html','/lengthconvert.html','/random.html',
  '/pwdgenerator.html','/qrcode.html','/prettify_qrcode.html','/visit_card.html','/led.html','/nick.html','/fakeword.html','/startupname.html','/naming.html','/compilation.html','/toMars.html',
  '/wordcount.html','/textdiff.html','/unique.html','/regexp.html','/tta.html','/emoji.html','/markdown.html',
  '/timestamp.html','/useragent.html',
  '/imgconvert.html','/img9grid.html','/img_fade.html','/img_pixel.html','/watermark.html','/gifsplitter.html','/gifcreate.html','/img_2_text.html','/img_edit_canvas.html','/biaoqing.html','/qrcode_scan.html',
  '/carnumber.html','/phonenumber.html','/dynasties.html','/capital.html','/periodic.html','/calories_list.html','/zipcode.html',
  '/whattoeat.html','/relatives_name.html','/bloodtype.html','/avatar_pendant.html',
  // --- 38 newly feasible (PDF, audio, canvas, video, data, extract) ---
  '/pdf_split.html','/pdf_merge.html','/pdf_watermark.html','/pdf_page_number.html','/pdf_metadata.html','/pdf_password.html','/pdf_crop.html','/pdf_pagesize.html','/pdf_page_manage.html','/pdf_compress.html','/pdf_sign.html','/img_2_pdf_convert.html',
  '/pdf_2_png.html','/pdf_img_extract.html','/pdf_imagefy.html','/pdf_2_html.html',
  '/tts.html','/hanzifayin.html',
  '/zitie_new.html','/handwriting_erasure.html',
  '/video_2_gif.html','/screen_record.html',
  '/markmap.html',
  '/password_check.html','/contract_comparison.html','/number_acquisition.html','/timer.html',
  '/garbage.html','/makename.html','/jielong.html','/chengyujielong.html','/radical.html','/allegory.html','/explain.html','/school.html','/hospitalrecommend.html','/calories.html','/food_calories.html',
]);
const cleanRoute = (href) => {
  if (frontendHrefs.has(href)) return href.replace(/\.html$/, '');
  // Backend-needed tool: link to the real external site so the card stays usable
  return `https://tool.browser.qq.com${href}`;
};

const slug = (s) => s.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'tool';

// Badge background color map
const badgeColor = (label) => {
  switch (label) {
    case '权益卡':
    case 'hot':
      return '#F44837';
    case 'new':
    case '限免':
      return '#FF8A14';
    case '腾讯管家':
    case '搜狗':
    case '腾讯电子签':
      return '#136CE9';
    case '推荐':
      return '#FFC20D';
    default:
      return '#136CE9'; // empty label
  }
};

// Sidebar categories (from extraction)
const categories = [
  { name: '全部', href: '/' },
  { name: '图片工具', href: '/category/img' },
  { name: 'PDF转换工具', href: '/category/pdf' },
  { name: '数据换算工具', href: '/category/data' },
  { name: '生活娱乐工具', href: '/category/life' },
  { name: '教育工具', href: '/category/education' },
  { name: '文本工具', href: '/category/text' },
  { name: '文档转换工具', href: '/category/doc' },
  { name: '开发工具', href: '/category/develop' },
  { name: '视频工具', href: '/category/video' },
  { name: '浏览器插件', href: '/category/pc_plugin' },
];

// Banner featured cards (from extraction)
const bannerLatest = [
  { title: '学习工具', subtitle: '作业辅导 学习无忧', href: 'https://browser.qq.com/mobile/article_detail/1/11/1157', icon: '/sites/tool-browser-qq-com/root-8a5edab2/images/banner-homework.png', alt: '暑期作业辅导' },
  { title: '在线录屏', subtitle: '在线录屏，支持录制指定浏览器标签页、指定窗口以及整个屏幕', href: '/screen_record.html', icon: null, iconToolName: '在线录屏', alt: '在线录屏' },
  { title: 'Excel转PDF', subtitle: 'Excel转PDF是一款专业的电子表格处理工具，能够轻松地将Excel文件转为PDF文件', href: '/excel_to_pdf.html', icon: null, iconToolName: 'Excel转PDF', alt: 'Excel转PDF' },
];
const bannerHot = [
  { title: '图片压缩', subtitle: '图片压缩是一款轻量级的图像压缩工具，图片压缩能够智能识别图像中的每一个元素，并对它们进行高效的压缩和优化。图片压缩还具有简单易用的界面，让你轻松地将大幅图像转换为小巧玲珑的图片。', href: '/imgcompress.html', icon: null, iconToolName: '图片压缩', alt: '图片压缩' },
  { title: '证件照生成', subtitle: '相片生成证件照工具是一款帮助用户快速生成高质量证件照的工具。证件照生成证件照工具拥有一个简单易用的界面，用户不需要具备专业的计算机技能就可以轻松上手。证件照生成证件照工具适用于各种场景和需求，例如结婚登记、签证办理、学校报名等。', href: '/id_photo.html', icon: null, iconToolName: '证件照生成', alt: '证件照生成' },
  { title: '垃圾分类查询', subtitle: '垃圾分类查询工具是一款免费的工具，可以用来查询生活中的垃圾分类情况。这款工具提供了实时更新的垃圾分类。让用户更加清晰地了解垃圾分类的具体方法和要求。更好地理解和管理垃圾分类工作', href: '/garbage.html', icon: null, iconToolName: '垃圾分类查询', alt: '垃圾分类查询' },
];

// Resolve banner icon filenames via icon-map (by matching tool name → its icon URL → filename)
const urlByName = {};
toolsRaw.data.forEach((t) => { if (t.name && t.icon) urlByName[t.name] = t.icon; });
const resolveIcon = (card) => {
  if (card.icon) return card.icon;
  const url = urlByName[card.iconToolName];
  const fn = url ? iconMap[url] : null;
  return fn ? `/sites/tool-browser-qq-com/shared/images/${fn}` : null;
};

// Build tool list — keep ONLY visible items (160), in original order.
// (The 6 hidden items are duplicates of banner/featured tools and are display:none on the live site.)
const tools = toolsRaw.data
  .filter((t) => t.visible && t.name)
  .map((t) => {
    const fn = iconMap[t.icon];
    return {
      name: t.name,
      desc: t.desc,
      href: cleanRoute(t.href),
      badge: t.label || '',
      badgeColor: badgeColor(t.label),
      icon: fn ? `/sites/tool-browser-qq-com/shared/images/${fn}` : '',
      category: toolToCat[t.href] || '',
    };
  });

// Build category -> list of tools (only locally-built frontend tools, in original order).
// Mirrors the original site's category pages (each category shows its tools, no banner).
// NOTE: some frontend tools are hidden on the home page (`visible:false`) but DO appear on
// their category page on the original site (e.g. 在线录屏, 垃圾分类查询, 去手写). So the
// category map must include ALL frontend tools regardless of home visibility, while the
// home `TOOLS` grid stays pixel-faithful (only `visible` tools).
const allFrontendTools = toolsRaw.data
  .filter((t) => t.name && frontendHrefs.has(t.href))
  .map((t) => {
    const fn = iconMap[t.icon];
    return {
      name: t.name,
      desc: t.desc,
      href: cleanRoute(t.href),
      badge: t.label || '',
      badgeColor: badgeColor(t.label),
      icon: fn ? `/sites/tool-browser-qq-com/shared/images/${fn}` : '',
      category: toolToCat[t.href] || '',
    };
  });

const CATEGORY_TOOLS = {};
for (const cat of Object.keys(catMap)) {
  CATEGORY_TOOLS[cat] = allFrontendTools.filter((t) => t.category === cat);
}

// Shared image path constants
const IMG = {
  logo: '/sites/tool-browser-qq-com/shared/images/logo.png',
  searchIcon: '/sites/tool-browser-qq-com/shared/images/search-icon.png',
  navTop: '/sites/tool-browser-qq-com/shared/images/nav-top.png',
  navQqgroup: '/sites/tool-browser-qq-com/shared/images/nav-qqgroup.png',
  moreArrow: '/sites/tool-browser-qq-com/shared/images/more-arrow.png',
  footerLogo: '/sites/tool-browser-qq-com/shared/images/footer-logo.png',
  footerQrcode: '/sites/tool-browser-qq-com/shared/images/footer-qrcode.png',
  shareLink: '/sites/tool-browser-qq-com/shared/images/share-link.png',
};

const latestCards = bannerLatest.map((c) => {
  const { iconToolName, ...rest } = c;
  return { ...rest, icon: resolveIcon(c) };
});
const hotCards = bannerHot.map((c) => {
  const { iconToolName, ...rest } = c;
  return { ...rest, icon: resolveIcon(c) };
});

// --- Write types.ts ---
const types = `// Auto-generated types for tool.browser.qq.com clone
// DO NOT EDIT BY HAND — regenerate via scripts/generate-data.mjs

export interface Category {
  name: string;
  href: string;
}

export interface ToolItem {
  name: string;
  desc: string;
  href: string;
  badge: string;
  badgeColor: string;
  icon: string;
  category: string;
}

export interface BannerCard {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  alt: string;
}

export interface BannerPanel {
  title: string;
  cards: BannerCard[];
}

export interface SharedImages {
  logo: string;
  searchIcon: string;
  navTop: string;
  navQqgroup: string;
  moreArrow: string;
  footerLogo: string;
  footerQrcode: string;
  shareLink: string;
}
`;

const sharedDir = path.join(ROOT, 'src/components/sites/tool-browser-qq-com/shared');
fs.mkdirSync(sharedDir, { recursive: true });
fs.writeFileSync(path.join(sharedDir, 'types.ts'), types);

// --- Write data.ts ---
const data = `// Auto-generated data for tool.browser.qq.com clone
// DO NOT EDIT BY HAND — regenerate via scripts/generate-data.mjs
import type { Category, ToolItem, BannerPanel, SharedImages } from './types';

export type { Category, ToolItem, BannerCard, BannerPanel, SharedImages } from './types';

export const IMAGES: SharedImages = ${JSON.stringify(IMG, null, 2)};

export const CATEGORIES: Category[] = ${JSON.stringify(categories, null, 2)};

export const BANNER_PANELS: BannerPanel[] = [
  { title: '最新工具', cards: ${JSON.stringify(latestCards, null, 4).replace(/\n/g, '\n  ')} },
  { title: '最热工具', cards: ${JSON.stringify(hotCards, null, 4).replace(/\n/g, '\n  ')} },
];

export const TOOLS: ToolItem[] = ${JSON.stringify(tools, null, 2)};

export const CATEGORY_TOOLS: Record<string, ToolItem[]> = ${JSON.stringify(CATEGORY_TOOLS, null, 2)};

// Stats counter — a representative live value from the site
export const STATS_COUNT = 376890900;
export const STATS_LABEL = '工具箱已累计帮助了';
export const STATS_SUFFIX = '人次';
`;

fs.writeFileSync(path.join(sharedDir, 'data.ts'), data);

console.log('Wrote types.ts + data.ts');
console.log('tools:', tools.length, '| frontend routes:', tools.filter(t=>!t.href.startsWith('http')).length, '| categories:', categories.length, '| banner panels: 2');
console.log('latest cards icons:', latestCards.map((c) => c.icon).filter(Boolean).length + '/3');
console.log('hot cards icons:', hotCards.map((c) => c.icon).filter(Boolean).length + '/3');
