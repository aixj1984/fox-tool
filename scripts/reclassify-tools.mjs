// Reclassify all tools now that we know categories + which are actually frontend-feasible.
// Previously skipped tools re-evaluated as pure-frontend where feasible.
import fs from 'fs';

const catMap = JSON.parse(fs.readFileSync('docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/category-mapping.json', 'utf8'));
const toolsInfo = JSON.parse(fs.readFileSync('docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/tools-info.json', 'utf8'));

// tool href -> category slug
const toolToCat = {};
for (const [cat, hrefs] of Object.entries(catMap)) {
  for (const h of hrefs) toolToCat[h] = cat;
}

// Already-built frontend tools (70)
const alreadyBuilt = new Set([
  '/md5.html','/unicode.html','/urlencode.html','/base64.html','/crypto.html','/image_secret_msg.html','/text_secret_msg.html','/uuid.html',
  '/hexconvert.html','/chinese.html','/num2zh.html','/jsonbeautify.html','/jsoncheck.html','/jsondiff.html','/yaml_2_json.html','/urlparse.html','/colortrans.html','/byte_cal.html',
  '/calculator.html','/bmi.html','/mortgage.html','/invest.html','/wuxianyijin.html','/datecal.html','/shelflife.html','/temperaturetrans.html','/lengthconvert.html','/random.html',
  '/pwdgenerator.html','/qrcode.html','/prettify_qrcode.html','/visit_card.html','/led.html','/nick.html','/fakeword.html','/startupname.html','/naming.html','/compilation.html','/toMars.html',
  '/wordcount.html','/textdiff.html','/unique.html','/regexp.html','/tta.html','/emoji.html','/markdown.html',
  '/timestamp.html','/useragent.html',
  '/imgconvert.html','/img9grid.html','/img_fade.html','/img_pixel.html','/watermark.html','/gifsplitter.html','/gifcreate.html','/img_2_text.html','/img_edit_canvas.html','/biaoqing.html','/qrcode_scan.html',
  '/carnumber.html','/phonenumber.html','/dynasties.html','/capital.html','/periodic.html','/calories_list.html','/zipcode.html',
  '/whattoeat.html','/relatives_name.html','/bloodtype.html','/avatar_pendant.html',
]);

// NEW frontend-feasible tools (previously "backend") that we WILL now build.
// Key re-evaluations:
//  - PDF page ops: pdf-lib (pure JS) can split/merge/watermark/page-number/metadata/crop/pagesize/page-manage/imagefy(渲染页为图片 via pdf.js)/password(pdf-lib supports encryption)/img-extract(pdf.js render → image). img_2_pdf_convert (images→pdf via pdf-lib).
//  - tts, hanzifayin: browser speechSynthesis (works offline, no backend).
//  - zitie_new (字帖生成): canvas drawing of grid + chars — pure frontend.
//  - markmap (思维导图): markdown→mindmap, pure frontend (markmap-lib or simple SVG).
//  - video_2_gif: video element → canvas frames → gif encoder (heavy but feasible).
//  - password_check: strength estimation — pure frontend.
//  - contract_comparison: PDF/image diff — frontend via pdf.js text extraction + diff, or image diff. Feasible for text-based.
//  - garbage (垃圾分类查询): bundle classification data — frontend.
//  - timer (世界时间校准): Intl/Date — frontend.
//  - number_acquisition (快递信息提取): regex extraction from text — frontend.
//  - makename (古诗词取名): bundle poetry data — frontend.
//  - jielong / chengyujielong (成语接龙/大全): bundle idiom data — frontend.
//  - radical (汉字偏旁), allegory (歇后语), explain (词语注解): bundle dict data — frontend.
//  - school (高校查询), hospitalrecommend (医院推荐): bundle static data — frontend.
//  - calories / food_calories (卡路里查询): bundle food data — frontend.
//  - iplocation (IP归属地): bundle a small IP→region table OR use a free public API at runtime — but to stay pure-frontend/offline, bundle representative data; note limitation.
//  - screen_record (在线录屏): getDisplayMedia + MediaRecorder — pure frontend!
//  - handwriting_erasure (去手写): image processing to remove handwriting — feasible with canvas pixel ops (subtract red channel / threshold) for typical "red pen on printed text".
//  - pdf_search: searching the web for PDFs needs a backend search engine — SKIP.
//  - sogou_box (搜狗百宝箱): aggregator of many sub-tools — SKIP (ill-defined, links out).
//  - contract_verification (合同验签): needs cryptographic signature verification + backend — SKIP.
//  - password_check is frontend (strength). file_scan / app_inspector: virus scanning needs backend — SKIP.
//  - partition (硬盘分区): system-level — SKIP.
//  - OCR family (识别): needs ML model — SKIP all.
//  - AI image family (face/anime/filter/enlarge/fix/enhance/split/beauty/cartoon/watercolor/jordanstyle/doc_wrap): needs ML — SKIP all.
//  - Cross-format doc conversion (pdf_2_word/excel/ppt, word_2_pdf, word_convert, ppt_convert, excel_to_pdf/convert, ppt_2_pdf, excel_convert, table_recognize, word_scan, office_reduce): needs server rendering — SKIP.
//  - pdf_compress (PDF瘦身): pdf-lib can re-save; real compression limited but feasible — BUILD (basic).
//  - pdf_sign (PDF签名): pdf-lib can add an image signature — BUILD.
//  - pdf_2_html: pdf.js extract text+layout → html — feasible but rough; BUILD basic.
//  - pdf_2_png / pdf_img_extract / pdf_imagefy: pdf.js render → png — BUILD.
//  - invoice_extract: OCR — SKIP.
const newFeasible = {
  // PDF tools (pdf-lib + pdf.js)
  '/pdf_split.html': { lib:'pdf-lib', cat:'pdf', name:'PDF拆分' },
  '/pdf_merge.html': { lib:'pdf-lib', cat:'pdf', name:'PDF合并' },
  '/pdf_watermark.html': { lib:'pdf-lib', cat:'pdf', name:'PDF加水印' },
  '/pdf_page_number.html': { lib:'pdf-lib', cat:'pdf', name:'PDF加页码' },
  '/pdf_metadata.html': { lib:'pdf-lib', cat:'pdf', name:'修改PDF元数据' },
  '/pdf_password.html': { lib:'pdf-lib', cat:'pdf', name:'PDF加解密' },
  '/pdf_crop.html': { lib:'pdf-lib', cat:'pdf', name:'PDF页面裁剪' },
  '/pdf_pagesize.html': { lib:'pdf-lib', cat:'pdf', name:'修改PDF页面尺寸' },
  '/pdf_page_manage.html': { lib:'pdf-lib', cat:'pdf', name:'PDF页面管理' },
  '/pdf_compress.html': { lib:'pdf-lib', cat:'pdf', name:'PDF瘦身' },
  '/pdf_sign.html': { lib:'pdf-lib', cat:'pdf', name:'PDF签名' },
  '/img_2_pdf_convert.html': { lib:'pdf-lib', cat:'pdf', name:'图片转PDF' },
  '/pdf_2_png.html': { lib:'pdf.js', cat:'pdf', name:'PDF转图片' },
  '/pdf_img_extract.html': { lib:'pdf.js', cat:'pdf', name:'PDF图片提取' },
  '/pdf_imagefy.html': { lib:'pdf.js+pdf-lib', cat:'pdf', name:'转纯图PDF' },
  '/pdf_2_html.html': { lib:'pdf.js', cat:'pdf', name:'PDF转HTML' },
  // Audio (speechSynthesis)
  '/tts.html': { lib:'speechSynthesis', cat:'text', name:'文本转语音' },
  '/hanzifayin.html': { lib:'speechSynthesis', cat:'education', name:'汉字标准发音' },
  // Canvas/drawing
  '/zitie_new.html': { lib:'canvas', cat:'education', name:'字帖生成' },
  '/handwriting_erasure.html': { lib:'canvas', cat:'education', name:'去手写' },
  // Video
  '/video_2_gif.html': { lib:'canvas+gif-enc', cat:'video', name:'视频转gif' },
  '/screen_record.html': { lib:'getDisplayMedia', cat:'video', name:'在线录屏' },
  // Markdown mindmap
  '/markmap.html': { lib:'markmap', cat:'education', name:'便捷思维导图' },
  // Frontend strength/extract
  '/password_check.html': { lib:'js', cat:'develop', name:'密码安全检测' },
  '/contract_comparison.html': { lib:'pdf.js+diff', cat:'life', name:'合同对比' },
  '/number_acquisition.html': { lib:'regex', cat:'life', name:'快递信息提取' },
  '/timer.html': { lib:'Intl', cat:'life', name:'世界时间校准' },
  // Bundled-data query (new)
  '/garbage.html': { lib:'data', cat:'life', name:'垃圾分类查询' },
  '/makename.html': { lib:'data', cat:'life', name:'古诗词取名' },
  '/jielong.html': { lib:'data', cat:'education', name:'成语接龙' },
  '/chengyujielong.html': { lib:'data', cat:'education', name:'成语大全' },
  '/radical.html': { lib:'data', cat:'education', name:'汉字偏旁' },
  '/allegory.html': { lib:'data', cat:'education', name:'歇后语' },
  '/explain.html': { lib:'data', cat:'education', name:'词语注解' },
  '/school.html': { lib:'data', cat:'education', name:'高校查询' },
  '/hospitalrecommend.html': { lib:'data', cat:'life', name:'医院推荐' },
  '/calories.html': { lib:'data', cat:'life', name:'卡路里查询' },
  '/food_calories.html': { lib:'data', cat:'life', name:'卡路里查询' }, // duplicate-ish; both bundled
};

// Tools that genuinely need backend (final skip list)
const skipReasons = {
  '/pdf_2_word.html':'需服务器渲染', '/pdf_2_excel.html':'需服务器渲染', '/pdf_2_ppt.html':'需服务器渲染',
  '/word_2_pdf.html':'需服务器渲染', '/word_convert.html':'需服务器渲染', '/ppt_convert.html':'需服务器渲染',
  '/excel_to_pdf.html':'需服务器渲染', '/ppt_2_pdf.html':'需服务器渲染', '/excel_convert.html':'需服务器渲染',
  '/office_reduce.html':'需服务器压缩', '/table_recognize.html':'需OCR', '/word_scan.html':'需OCR',
  '/invoice_extract.html':'需OCR', '/ocr.html':'需OCR',
  '/identification.html':'需OCR','/bankcard_ocr.html':'需OCR','/basic_ocr.html':'需OCR','/handwriting_ocr.html':'需OCR',
  '/ocr_advertise.html':'需OCR','/ocr_english.html':'需OCR','/passport_ocr.html':'需OCR','/waybill.html':'需OCR',
  '/container_ocr.html':'需OCR','/carcard_ocr.html':'需OCR','/ocr_bizLicense.html':'需OCR','/ocr_businesscard.html':'需OCR',
  '/ocr_permit.html':'需OCR','/bankslip_ocr.html':'需OCR','/ocr_dutypaidproof.html':'需OCR',
  '/ocr_recognize_medical_invoice.html':'需OCR','/onlinetaxi_ocr.html':'需OCR',
  '/face_age_transformation.html':'需AI','/face_gender_transformation.html':'需AI',
  '/img_anime_filter.html':'需AI','/img_face_anime.html':'需AI','/img_module_face_stylize.html':'需AI',
  '/img_painting_filter.html':'需AI','/img_human_split.html':'需AI','/img_pic_beauty.html':'需AI',
  '/doc_wrap.html':'需AI','/img_fix.html':'需AI','/image_enhance.html':'需AI',
  '/img_ai_cartoon.html':'需AI','/img_ai_face.html':'需AI','/img_ai_jordanstyle.html':'需AI','/img_ai_watercolor.html':'需AI',
  '/img_enlarge.html':'需AI','/id_photo.html':'需AI证件照','/tupianyasuo.html':'需服务器压缩',
  '/file_scan.html':'需病毒库','/app_inspector.html':'需病毒库','/partition.html':'系统级',
  '/pdf_search.html':'需搜索引擎','/sogou_box.html':'聚合外链','/contract_verification.html':'需电子签后端',
  '/kuaidi.html':'需快递API','/iplocation.html':'需IP库API(或打包大数据)',
  '/translate.html':'需翻译API',
};

// Build: already built (70) + new feasible. Add the 5 category-only tools (screen_record, handwriting_erasure, garbage, timer, number_acquisition) — already in newFeasible.
const newBuildList = Object.entries(newFeasible).map(([href, m]) => ({
  href,
  name: m.name,
  cat: m.cat,
  lib: m.lib,
  desc: toolsInfo[href]?.desc || '',
}));

const skipList = Object.entries(skipReasons).map(([href, reason]) => ({
  href, name: toolsInfo[href]?.name || href, reason,
}));

const report = {
  alreadyBuilt: alreadyBuilt.size,
  newFeasibleCount: newBuildList.length,
  skipCount: skipList.length,
  totalFeasible: alreadyBuilt.size + newBuildList.length,
  newBuildList,
  skipList,
};

fs.writeFileSync('docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/TOOL_CATEGORIZATION_V2.json', JSON.stringify(report, null, 2));
console.log('already built:', report.alreadyBuilt);
console.log('NEW feasible to build:', report.newFeasibleCount);
console.log('skip (true backend):', report.skipCount);
console.log('total frontend tools after:', report.totalFeasible);
console.log('\nNew build list:');
newBuildList.forEach(t => console.log('  ' + t.name + ' [' + t.cat + '/' + t.lib + '] -> ' + t.href));
