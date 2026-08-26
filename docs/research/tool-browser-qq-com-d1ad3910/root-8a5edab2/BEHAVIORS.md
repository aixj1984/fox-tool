# Behaviors — tool.browser.qq.com (/)

## Scroll Sweep
- **Header/sidebar**: The left sidebar is `position: fixed` and never changes on scroll. No scroll-triggered shrink/shadow.
- **Right floating nav**: `position: fixed`, stays at `top: calc(100vh - 290px)` effectively (bottom:60px). The back-to-top button is always visible (does not fade in/out based on scroll).
- **No scroll-driven animations** on cards or sections. No IntersectionObserver reveals. No scroll-snap. No smooth-scroll library (native scroll only, except the back-to-top button uses `behavior:'smooth'`).
- Page scrolls normally with the fixed sidebar and floating nav staying in place.

## Click Sweep
- **Sidebar category links** (图片工具, PDF转换工具, …): click = **full navigation** to `/category/<slug>`. Confirmed by URL change to `https://tool.browser.qq.com/category/img`. NOT a client-side grid filter.
- **"全部" link**: navigates to `/` (current page — active state highlighted).
- **Logo**: navigates to `/`.
- **Banner "更多工具"**: a link (navigates to the category listing page).
- **Banner featured cards**: navigate to tool href (e.g. `/screen_record.html`, external article URL for the first 新工具 card).
- **Tool cards**: navigate to tool href (e.g. `/pdf_2_word.html`). Plain anchors.
- **Right floating nav**:
  - Button 1 (back-to-top icon): `javascript:window.scrollTo({ top: 0, behavior: 'smooth' })` — smooth scrolls to top.
  - Button 2 (QQ群 icon): navigates to QQ group join URL (external `qm.qq.com`).
  - Button 3 (共建 text): navigates to `feedback.browser.qq.com/qbtool?dev=1&...`.
  - Button 4 (反馈 text): navigates to `feedback.browser.qq.com/qbtool?...`.
- **Footer links**: navigate to external Tencent policy/license URLs.
- **Search**: clicking the search icon / typing — the input has no placeholder and no visible autocomplete panel populates at rest. The `.search-panel` div exists but is height:0 / empty. **Treat search as a static non-functional element** for the clone (input present, stats text overlays it).

## Hover Sweep
- **Tool cards**: **NO hover effect.** Verified via real Playwright hover + stylesheet inspection: no `.tool-item:hover` rule exists; boxShadow/transform/backgroundColor/border all unchanged on hover. The `transition: all` property is set but nothing transitions. Cards are static clickable rectangles.
- **Sidebar nav items**: no documented hover style extracted (links are classic blue `rgb(0,0,238)`). The active item has a light-purple background `rgb(232,232,253)` with radius 10px; inactive items are transparent.
- **Share button (`.share-btn`)**: hover → reveals a popup containing "复制链接" and "QQ 微信扫码分享" text (14px black). The button itself is a 40×40 circle (`#F6F7FA`, radius 20px) with a share-link icon. **Hover-driven tooltip** — JS/CSS controlled. For the clone, implement a hover tooltip.
- **Banner "更多工具"**: likely hover color change on the arrow link (standard link behavior). Not critical.
- **Float nav buttons**: white circles; possible subtle hover (not strongly visible).

## Responsive Sweep
- **Desktop 1440px**: full layout visible. Sidebar 240 + content 1140 + right margin = fits within 1440 with ~60px spare.
- **Tablet 768px**: (inferred, same fixed layout) — content 1140px overflows; horizontal scrollbar appears. No reflow.
- **Mobile 390px**: **No mobile layout.** Sidebar stays 240px fixed; main content stays 1140px but is pushed off-screen via `margin: 0 -990px 0 0` on `.top-content`, `.banner-container`, `.tool-list-container`, `.footer-container`. Only ~150px of content is visible; the rest requires horizontal scrolling. The site is **desktop-only / fixed-width**.
- **Breakpoint**: NONE. The clone must replicate fixed-width behavior (min-width container, horizontal scroll on narrow viewports).

## Time-Driven
- **Stats counter**: "工具箱已累计帮助了 **N** 人次" where N is a live count-up number in a `<b class="count-up-container">` (16px/700, blue `rgb(19,108,233)`). The number increments over time (observed 376871492 → 376890900 across sessions). For the clone, render a static large number (e.g. 376890900) or a simple count-up animation on mount — non-critical to be live.

## Summary
This is a **low-interactivity, fixed-width, desktop-only portal page**. The only meaningful behaviors are:
1. Sidebar nav = navigation links (active state on current category).
2. Share button = hover tooltip.
3. Back-to-top button = smooth scroll.
4. Stats = count-up number.
Everything else is static content + plain links. No scroll animations, no carousels, no tabs, no modals, no hover effects on cards.
