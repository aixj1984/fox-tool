# Page Topology — tool.browser.qq.com (/)

## Overall Layout
Fixed-width desktop-only layout. **No responsive breakpoints** — at <~1230px the content overflows with a horizontal scrollbar (verified at 390px: sidebar stays 240px, content stays 1140px, shoved off-screen via `margin: 0 -990px 0 0`).

The page is a single `<main>` containing one wrapper `div` with 4 children:

1. **`.left-nav`** — fixed left sidebar (240px × 100vh, `#F6F7FA`, z-index 50). Contains logo + category nav.
2. **`.left-nav-placeholder`** — static 240px spacer (pushes content right of the fixed sidebar).
3. **`.nav-button-wrap`** — fixed right floating mini-nav (50×230, right:30px, bottom:60px, z-index 2). 4 circular buttons.
4. **`.main-content`** — relative, left:240px, 1140px wide, contains:
   - `.top-content` (110px) — search bar + share button + 权益卡 badge
   - `.banner-container` (277px) — two featured panels (最新工具 / 最热工具)
   - `.tool-list-container` (7020px) — the 160-card tool grid (3 columns)
   - `.footer-container` (215px) — footer

## Section Order (top to bottom)
1. Left sidebar (fixed, full height) — overlays
2. Right floating nav (fixed) — overlays
3. Top content row: search (804px) | share btn (40px) | 权益卡 (256px)
4. Banner: 最新工具 panel | 最热工具 panel (each 555×277, gap via margins)
5. Tool grid: 160 visible cards, 3 cols × 390px, each card 360×100
6. Footer: tagline + license links + copyright + QR code

## z-index layers
- Sidebar: 50 (top)
- Right floating nav: 2
- Content: default flow

## Interaction Model per Section
| Section | Model |
|---|---|
| Sidebar nav links | click → **full page navigation** to `/category/*` (NOT client-side filter). Verified: clicking 图片工具 navigates to /category/img. |
| Logo | click → navigate to `/` |
| Search input | static (no placeholder, no autocomplete panel populated). The stats text overlays the empty input. Non-functional for this clone. |
| Share button | hover → tooltip popup ("复制链接" / "QQ 微信扫码分享"). JS-driven. |
| 权益卡 box | static link/badge (brown text "QQ浏览器 · 工具权益卡") |
| Banner "更多工具" | link (navigates to category page) |
| Banner featured cards | click → navigate to tool href |
| Tool cards | click → navigate to tool href. **No hover effect** (verified: no `:hover` rule, no transform/shadow change on hover). Static links. |
| Right floating: back-to-top | click → smooth scroll to top (`window.scrollTo({top:0,behavior:'smooth'})`) |
| Right floating: QQ群/共建/反馈 | click → navigate to external links |
| Stats counter | time-driven count-up animation (number increments live) |

## Key dimensions (desktop 1440px)
- Sidebar: 240px wide
- Main content: 1140px wide, left margin 240px
- Inner content padding: 30px right margin on banner/tool-list (`margin: 0 30px`)
- Tool grid: 3 columns of 390px (1140 total), card 360×100 with margin `30px 30px 0 0`
- Banner: 2 panels of 555×277, margin `0 15px` each, container margin `0 30px`

## Fonts
- Body/cards/nav: `"Microsoft YaHei"` (system)
- Search input: `Arial` (system)
- No web fonts loaded.
