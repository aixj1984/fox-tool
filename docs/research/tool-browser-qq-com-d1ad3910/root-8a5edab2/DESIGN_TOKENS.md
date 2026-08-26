# Design Tokens — tool.browser.qq.com (/)

All values from `getComputedStyle()` on the live site at 1440px.

## Fonts
- **Body / cards / nav / headings**: `"Microsoft YaHei"` (system font stack). Fallbacks observed: none additional.
- **Search input**: `Arial`.
- **Font sizes used**:
  - Logo main "帮小忙": 20px / weight 600 / color `rgb(0,0,0)`
  - Logo sub "腾讯QQ浏览器在线工具箱": 12px / weight 400 / `rgb(0,0,0)`
  - Sidebar nav links: 16px / weight 400 / `rgb(0,0,238)` (classic link blue)
  - Search stats text: 16px / `rgb(179,179,179)`; count number `<b>`: 16px / 700 / `rgb(19,108,233)`
  - Search input: 16px / `rgb(36,36,36)` / Arial
  - Banner title (最新工具/最热工具): 16px / 400 / `rgb(51,51,51)`
  - Banner card title: 16px / 600 / `rgb(36,36,36)` (inferred from tool-name)
  - Tool name: 16px / 600 / `rgb(36,36,36)` / line-height 20px
  - Tool desc: 14px / 400 / `rgb(143,143,143)` / line-height 20px
  - Badge label: 16px / 400 / white / line-height 20px
  - Footer tagline: 16px / 600 / `rgb(36,36,36)`
  - Footer license links + copyright: 12px / `rgb(143,143,143)`
  - Float nav button text (共建/反馈): 14px / `rgb(36,36,36)`
  - 权益卡 box text: 14px / 400 / `rgb(142,82,13)` (brown)
  - Share popup text: 14px / `rgb(0,0,0)`

## Colors
- **Page background**: white (`rgb(255,255,255)`) on body/main; sidebar & search bar use `rgb(246,247,250)` (#F6F7FA light gray)
- **Sidebar bg**: `rgb(246, 247, 250)` — `#F6F7FA`
- **Search bar bg**: `rgb(246, 247, 250)` — `#F6F7FA` (pill, radius 30px)
- **Card bg**: `rgb(255,255,255)` white
- **Card shadow**: `rgba(0,0,0,0.1) 0px 0px 10px 0px`
- **Text primary**: `rgb(36,36,36)` — `#242424`
- **Text secondary/muted**: `rgb(143,143,143)` — `#8F8F8F`
- **Text tertiary (stats label)**: `rgb(179,179,179)` — `#B3B3B3`
- **Link blue**: `rgb(0,0,238)` — `#0000EE` (classic)
- **Brand blue** (count number, badges): `rgb(19,108,233)` — `#136CE9`
- **Active nav bg**: `rgb(232,232,253)` — `#E8E8FD` (light purple)
- **Badge backgrounds**:
  - Red `rgb(244,72,55)` — `#F44837` (权益卡, hot)
  - Orange `rgb(255,138,20)` — `#FF8A14` (new, 限免)
  - Blue `rgb(19,108,233)` — `#136CE9` (腾讯管家, 搜狗, 腾讯电子签, empty)
  - Yellow `rgb(255,194,13)` — `#FFC20D` (推荐)
- **Badge text**: white `rgb(255,255,255)`
- **Float nav button bg**: white `rgb(255,255,255)`, radius 10px
- **Footer divider line**: `1px solid rgb(246,247,250)`
- **权益卡 brown**: `rgb(142,82,13)` — `#8E520D`

## Spacing & Layout
- **Sidebar**: 240px wide, fixed
- **Main content**: 1140px wide, margin-left 240px
- **Banner container**: margin `0 30px`; 2 panels each 555×277, margin `0 15px`
- **Banner panel**: padding 0; title margin `20px 20px 13px`; cards container `.banner-item-tool` holds 3 cards each 158×200, margin `0 20px 0 0`
- **Tool grid**: `display:grid; grid-template-columns: 390px 390px 390px` (1140px); cards margin `30px 30px 0 0`; container margin `0 30px 30px 0` (top-content/banner/tool-list/footer all have `margin: 0 -990px 0 0` at narrow widths — but at desktop it's `0 30px` on banner and `0 30px 30px 0` on tool-list)

  NOTE: At 1440px the negative `-990px` margin is NOT applied (only appears <1230px). At desktop: `.top-content` margin 0; `.banner-container` margin `0 30px`; `.tool-list-container` margin `0 30px 30px 0`.

- **Tool card**: 360×100, padding 0, margin `30px 30px 0 0`, position relative
  - Icon img: 60×60, margin `20px 0 0 20px`, object-fit fill
  - `.tool-content`: margin `25px 0 0 10px`, 240×75
  - `.tool-name`: margin 0, line-height 20px
  - `.tool-desc`: margin `10px 0 0`, line-height 20px, overflow hidden (2-line clamp visually)
  - `.label` badge: absolute, top:0, right:0, padding `2px 8px`, radius `0 10px` (top-right corner), line-height 20px

## Border Radius
- Search bar: 30px (pill)
- Tool card: 10px
- Banner panel: 10px
- Active nav item: 10px
- Badge: `0 10px` (top-right corners only)
- Share button: 20px (circle)
- Float nav buttons: 10px

## Shadows
- Tool card: `rgba(0,0,0,0.1) 0px 0px 10px 0px`
- Banner panels: no shadow (white on white page; rely on the page being subtly gray? Actually page bg is white — banner panels are white too. They may have a very subtle border or just spacing. Captured boxShadow: none on banner cards.)

## Borders
- Footer divider: `1px solid #F6F7FA`
- Inputs: none (transparent, no border)
- Cards: `0px none` (no border, only shadow)

## Images / Icons
All served from `https://m4.publicimg.browser.qq.com/`:
- Logo: `/publicimg/nav/qbtool/qbtool-latest.png` (60×60, rendered 30×30)
- Search icon: `/publicimg/nav/qbtool/search_icon.png` (rendered 40×40)
- Float nav-top: `/publicimg/nav/qbtool/nav-top.png` (14×16)
- Float nav-qqgroup: `/publicimg/nav/qbtool/nav-qqgroup.png` (14×16)
- Banner "更多" arrow: `/publicimg/nav/qb_tool/pchom_more/more.png`
- Footer logo: `/publicimg/nav/qbtool/footer-logo.png` (27×30)
- Footer QR: `/publicimg/nav/qbtool/footer-qrcode.png` (79×79)
- Share icon: `/publicimg/pcqb/qbtool/tool-share-link.png`
- Banner featured card icons: `/publicimg/pcqb/home_work_help.png`, `/imgUpload/qbtool.t_tool_info/b91aa2df_*.png`
- Tool card icons: `/imgUpload/qbtool.t_tool_info/b91aa2df_<random>.png` (166 unique icons, each ~120-480px natural, rendered 60×60)
