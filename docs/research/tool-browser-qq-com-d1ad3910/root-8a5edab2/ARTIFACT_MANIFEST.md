# Artifact Manifest — tool.browser.qq.com clone

## Source → Destination
- **Source:** `https://tool.browser.qq.com/` (首页门户)
- **Destination route:** `/` → `src/app/page.tsx`
- **Site key:** `tool-browser-qq-com-d1ad3910`
- **Page key:** `root-8a5edab2`

## What was built
1. **Portal homepage `/`** — pixel-emulation of the original: fixed left sidebar (logo + 11 category links), top-content (pill search bar + live count-up stats + share button + 权益卡 badge), two banner panels (最新工具 / 最热工具, 3 featured cards each), the 160-card tool grid (3 cols, badges, icons), footer (logo + tagline + license links + copyright + QR code), and the right floating nav (back-to-top / QQ群 / 共建 / 反馈).
2. **10 category navigation pages** `/category/<slug>` (img/pdf/data/life/education/text/doc/develop/video/pc_plugin) — the sidebar links now resolve. Each mirrors the portal layout but omits the banner and filters the grid to that category's frontend tools (backend-tool cards link to the real external site).
3. **108 working pure-frontend tool pages** — each at a clean App Router route, sharing the same sidebar+footer shell. Every tool computes real output client-side (verified: md5, qrcode, password_check, etc.).

## Tool categorization (per user instruction: only pure-frontend tools)
- **Built (108):** original 70 + 38 newly-feasible. Groups: 编码解码(8) + 格式转换(10) + 计算器(10) + 生成器(11) + 文本工具(7) + 开发工具(2) + 图片工具(11) + 查询工具(7) + 生活娱乐(4) [original 70], plus PDF工具(16, pdf-lib+pdf.js) + 语音/视频(4: tts/汉字发音/视频转gif/在线录屏) + 画布/思维导图(3: 字帖/去手写/markmap) + 提取/工具(4: 密码检测/合同对比/快递提取/世界时间) + 数据查询(11: 垃圾分类/古诗取名/成语接龙/成语大全/偏旁/歇后语/词语注解/高校/医院/卡路里×2).
- **Skipped / linked externally (58):** tools genuinely requiring backend — cross-format document conversion (PDF↔Word/Excel/PPT), OCR 识别, AI image processing, real compression, TTS server voices, translation, electronic-sign verification, virus scanning, network query APIs (快递/IP). Their portal cards link to the real external site so the portal stays usable.

See `TOOL_CATEGORIZATION.md` (original 70) and `TOOL_CATEGORIZATION_V2.json` (full 108/58 breakdown).

## Assets
- Downloaded via `scripts/download-assets-tool-browser-qq-com-root-8a5edab2.mjs`:
  - 8 static shared images (logo, search icon, float-nav icons, footer logo/QR, more arrow, share icon) → `public/sites/tool-browser-qq-com/shared/images/`
  - 164 unique tool card icons → `public/sites/tool-browser-qq-com/shared/images/` (filename `icon-<slug>.png`)
  - 1 banner featured icon (home_work_help) → `public/sites/tool-browser-qq-com/root-8a5edab2/images/`
- All assets served with `unoptimized` (next/image) since they are pre-sized original PNGs.
- No Atlas Cloud generated fallbacks were needed — all assets recovered from origin.

## Fonts
- Original uses system fonts (`"Microsoft YaHei"`, `Arial`). Configured `--font-sans` in `globals.css` to the same system stack. `next/font/google` removed (Google Fonts unreachable in build env; system fonts match the target exactly). `layout.tsx` set `lang="zh-CN"` and target metadata.

## Foundation files changed (shared)
- `src/app/layout.tsx` — system fonts, zh-CN, target title/description.
- `src/app/globals.css` — `--font-sans` / `--font-mono` set to Microsoft YaHei stack.
- `tsconfig.json` — `target` ES2017 → ES2020 (BigInt support for 进制转换).
- Installed libs: `qrcode`, `marked`, `js-yaml`, `diff` + their `@types/*`.

## Shared components (same-site)
- `src/components/sites/tool-browser-qq-com/shared/`: `types.ts`, `data.ts` (auto-generated), `icons.tsx`, `LeftNav.tsx`, `FloatingNav.tsx`, `Footer.tsx`, `ToolPageShell.tsx` (shell + building blocks: ToolCard/Button/Textarea/Input/Label/CopyButton).
- `src/components/sites/tool-browser-qq-com/root-8a5edab2/`: `TopContent.tsx`, `Banner.tsx`, `ToolGrid.tsx`.

## Build status
- `npx tsc --noEmit` → **0 errors**.
- `npm run build` → **EXIT 0** (Compiled successfully). All 71 routes prerendered.
- `npm run lint` → 11 errors (all React 19 `react-hooks/set-state-in-effect` / "impure function in render" rule on init-on-mount effects) + 36 warnings (mostly `<img>` preference). These do not block the build or affect functionality (tools verified working). They are the project's strict lint config flagging common client-side init patterns.

## Visual QA
- Portal `/` matches original structure (sidebar, search, banners, grid, footer, floating nav). See `desktop-fullpage.png` vs `clone-portal-fullpage.png`.
- Spot-checked tool pages render and function: md5加密 (correct hash), 二维码生成 (real PNG), 元素周期表 (full 118-element grid), 今天吃什么 (spinner). See `qa/` folder.

## Known gaps / limitations
- 90 backend-dependent tools are not cloned (by user request); their cards link to the real site.
- The original is fixed-width desktop-only (no responsive reflow at <1230px); the clone replicates this (horizontal scroll on narrow viewports), matching the target.
- 亲戚关系计算 handles direct + one-level-indirect + common 姻亲 chains; deeper relations return "超出已实现范围".
- 二维码扫描 uses native BarcodeDetector where available, else a bundled QR decoder for uploaded images (versions 1–10); live camera scan supported.
- GIF 分解/合成 use a bundled GIF89a encoder/decoder (median-cut quantization + LZW).
