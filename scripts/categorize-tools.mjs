// Categorize all 160 tools: pure-frontend (build) vs backend-needed (skip).
// Frontend = achievable fully client-side in the browser (canvas, JS math, local data, encoding libs).
// Backend = requires server-side processing, AI models, OCR, file conversion, or external live APIs.
import fs from 'fs';
const data = fs.readFileSync('src/components/sites/tool-browser-qq-com/shared/data.ts', 'utf8');
const m = data.match(/export const TOOLS[^=]*=\s*(\[[\s\S]*?\]);/);
const tools = eval(m[1]);

// Pure-frontend tool hrefs (we WILL build these as working pages)
const frontendHrefs = new Set([
  // --- Encoders / decoders ---
  '/md5.html', '/unicode.html', '/urlencode.html', '/base64.html', '/crypto.html', '/image_secret_msg.html', '/text_secret_msg.html', '/uuid.html',
  // --- Format converters (text/data, pure JS) ---
  '/hexconvert.html', '/chinese.html', '/num2zh.html', '/jsonbeautify.html', '/jsoncheck.html', '/jsondiff.html', '/yaml_2_json.html', '/urlparse.html', '/colortrans.html', '/byte_cal.html',
  // --- Calculators ---
  '/calculator.html', '/bmi.html', '/mortgage.html', '/invest.html', '/wuxianyijin.html', '/datecal.html', '/shelflife.html', '/temperaturetrans.html', '/lengthconvert.html', '/random.html',
  // --- Generators ---
  '/pwdgenerator.html', '/qrcode.html', '/prettify_qrcode.html', '/visit_card.html', '/led.html', '/nick.html', '/fakeword.html', '/startupname.html', '/naming.html', '/compilation.html', '/toMars.html',
  // --- Text tools ---
  '/wordcount.html', '/textdiff.html', '/unique.html', '/regexp.html', '/tta.html', '/emoji.html', '/markdown.html',
  // --- Dev tools ---
  '/timestamp.html', '/useragent.html',
  // --- Image tools (canvas/client-side) ---
  '/imgconvert.html', '/img9grid.html', '/img_fade.html', '/img_pixel.html', '/watermark.html', '/gifsplitter.html', '/gifcreate.html', '/img_2_text.html', '/img_edit_canvas.html', '/biaoqing.html', '/qrcode_scan.html',
  // --- Query / lookup (static bundled data) ---
  '/carnumber.html', '/phonenumber.html', '/dynasties.html', '/capital.html', '/periodic.html', '/calories_list.html', '/zipcode.html',
  // --- Fun / life (pure logic) ---
  '/whattoeat.html', '/relatives_name.html', '/bloodtype.html', '/avatar_pendant.html',
]);

// Reasons for backend (skip) — keyed by href
const backendReasons = {
  '/pdf_2_word.html':'PDF转换', '/pdf_2_excel.html':'PDF转换', '/pdf_2_html.html':'PDF转换', '/pdf_2_png.html':'PDF转换', '/pdf_2_ppt.html':'PDF转换',
  '/word_2_pdf.html':'文档转换', '/word_convert.html':'文档转换', '/ppt_convert.html':'文档转换', '/excel_convert.html':'文档转换',
  '/pdf_watermark.html':'PDF处理', '/pdf_compress.html':'PDF瘦身', '/office_reduce.html':'文档瘦身',
  '/pdf_sign.html':'PDF签名', '/pdf_split.html':'PDF处理', '/pdf_merge.html':'PDF处理', '/pdf_imagefy.html':'PDF处理',
  '/pdf_page_manage.html':'PDF处理', '/pdf_img_extract.html':'PDF处理', '/pdf_password.html':'PDF处理', '/pdf_crop.html':'PDF处理',
  '/pdf_metadata.html':'PDF处理', '/pdf_page_number.html':'PDF处理', '/pdf_pagesize.html':'PDF处理',
  '/img_2_pdf_convert.html':'图片转PDF', '/ppt_2_pdf.html':'文档转换',
  '/identification.html':'OCR识别', '/bankcard_ocr.html':'OCR识别', '/basic_ocr.html':'OCR识别', '/handwriting_ocr.html':'OCR识别',
  '/ocr_advertise.html':'OCR识别', '/ocr_english.html':'OCR识别', '/passport_ocr.html':'OCR识别', '/waybill.html':'OCR识别',
  '/container_ocr.html':'OCR识别', '/carcard_ocr.html':'OCR识别', '/ocr_bizLicense.html':'OCR识别', '/ocr_businesscard.html':'OCR识别',
  '/ocr_permit.html':'OCR识别', '/bankslip_ocr.html':'OCR识别', '/ocr_dutypaidproof.html':'OCR识别',
  '/ocr_recognize_medical_invoice.html':'OCR识别', '/onlinetaxi_ocr.html':'OCR识别', '/table_recognize.html':'表格OCR',
  '/invoice_extract.html':'发票OCR', '/ocr.html':'OCR识别', '/word_scan.html':'文档扫描OCR',
  '/face_age_transformation.html':'AI人脸处理', '/face_gender_transformation.html':'AI人脸处理',
  '/img_anime_filter.html':'AI图像滤镜', '/img_face_anime.html':'AI头像', '/img_module_face_stylize.html':'AI美化',
  '/img_painting_filter.html':'AI油画', '/img_human_split.html':'AI人像分割', '/img_pic_beauty.html':'AI照片美化',
  '/doc_wrap.html':'AI扭曲恢复', '/img_fix.html':'AI图片修复', '/image_enhance.html':'AI去摩尔纹',
  '/img_ai_cartoon.html':'AI卡通画', '/img_ai_face.html':'AI童话脸', '/img_ai_jordanstyle.html':'AI风格化', '/img_ai_watercolor.html':'AI水彩',
  '/img_enlarge.html':'AI图片放大', '/zitie_new.html':'字帖生成(后端字体/排版)',
  '/password_check.html':'安全检测', '/file_scan.html':'文件安全检测', '/app_inspector.html':'安装包检测',
  '/sogou_box.html':'聚合工具', '/contract_verification.html':'电子签验签', '/contract_comparison.html':'合同对比',
  '/pdf_search.html':'搜索引擎', '/tts.html':'TTS语音', '/video_2_gif.html':'视频转GIF',
  '/kuaidi.html':'快递查询API', '/iplocation.html':'IP归属地API', '/calories.html':'卡路里API', '/food_calories.html':'卡路里API',
  '/hospitalrecommend.html':'医院数据API', '/translate.html':'翻译API', '/hanzifayin.html':'汉字发音TTS',
  '/radical.html':'汉字偏旁词典', '/allegory.html':'歇后语词典', '/explain.html':'词语注解词典',
  '/chengyujielong.html':'成语词典', '/jielong.html':'成语接龙词典', '/makename.html':'古诗词取名词典',
  '/school.html':'高校数据API', '/markmap.html':'思维导图(依赖编辑器/存储)',
  '/partition.html':'硬盘分区(系统级)',
};

const frontend = [];
const backend = [];
for (const t of tools) {
  if (frontendHrefs.has(t.href)) {
    frontend.push(t);
  } else {
    backend.push({ ...t, reason: backendReasons[t.href] || '未明确归类-默认跳过' });
  }
}

// Sanity: every tool is in exactly one bucket
const accounted = new Set([...frontend.map((t) => t.href), ...backend.map((t) => t.href)]);
const unaccounted = tools.filter((t) => !accounted.has(t.href));

// Group frontend tools by category for batched building
const groups = {
  '编码解码': ['/md5.html','/unicode.html','/urlencode.html','/base64.html','/crypto.html','/image_secret_msg.html','/text_secret_msg.html','/uuid.html'],
  '格式转换': ['/hexconvert.html','/chinese.html','/num2zh.html','/jsonbeautify.html','/jsoncheck.html','/jsondiff.html','/yaml_2_json.html','/urlparse.html','/colortrans.html','/byte_cal.html'],
  '计算器': ['/calculator.html','/bmi.html','/mortgage.html','/invest.html','/wuxianyijin.html','/datecal.html','/shelflife.html','/temperaturetrans.html','/lengthconvert.html','/random.html'],
  '生成器': ['/pwdgenerator.html','/qrcode.html','/prettify_qrcode.html','/visit_card.html','/led.html','/nick.html','/fakeword.html','/startupname.html','/naming.html','/compilation.html','/toMars.html'],
  '文本工具': ['/wordcount.html','/textdiff.html','/unique.html','/regexp.html','/tta.html','/emoji.html','/markdown.html'],
  '开发工具': ['/timestamp.html','/useragent.html'],
  '图片工具': ['/imgconvert.html','/img9grid.html','/img_fade.html','/img_pixel.html','/watermark.html','/gifsplitter.html','/gifcreate.html','/img_2_text.html','/img_edit_canvas.html','/biaoqing.html','/qrcode_scan.html'],
  '查询工具': ['/carnumber.html','/phonenumber.html','/dynasties.html','/capital.html','/periodic.html','/calories_list.html','/zipcode.html'],
  '生活娱乐': ['/whattoeat.html','/relatives_name.html','/bloodtype.html','/avatar_pendant.html'],
};

const report = {
  total: tools.length,
  frontendCount: frontend.length,
  backendCount: backend.length,
  unaccounted: unaccounted.map((t) => t.name + ' ' + t.href),
  groups: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
  frontendTools: frontend.map((t) => ({ name: t.name, href: t.href })),
  backendTools: backend.map((t) => ({ name: t.name, href: t.href, reason: t.reason })),
};

fs.writeFileSync('docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/TOOL_CATEGORIZATION.json', JSON.stringify(report, null, 2));
console.log('total:', report.total, '| frontend:', report.frontendCount, '| backend:', report.backendCount, '| unaccounted:', report.unaccounted.length);
console.log('groups:', JSON.stringify(report.groups));
if (report.unaccounted.length) console.log('UNACCOUNTED:', report.unaccounted);
