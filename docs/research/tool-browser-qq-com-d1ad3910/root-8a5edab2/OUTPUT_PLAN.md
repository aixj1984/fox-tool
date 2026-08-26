# Output Plan — https://tool.browser.qq.com/

Single target URL → single homepage clone. First fresh-template clone, so the existing scaffold `src/app/page.tsx` may be replaced and the clone lives at `/`.

## Keys
- **app-root:** `.` (repository root — single application)
- **site-key:** `tool-browser-qq-com-d1ad3910` (origin slug + SHA-256(origin)[:8])
- **page-key:** `root-8a5edab2` (path `/` → `root-` + SHA-256("/")[:8])

## Destination route
- `src/app/page.tsx` → resolves at `/` (replaces untouched scaffold)

## Artifact roots
- Research: `docs/research/tool-browser-qq-com-d1ad3910/root-8a5edab2/`
  - `BEHAVIORS.md`, `PAGE_TOPOLOGY.md`, `DESIGN_TOKENS.md`, `ARTIFACT_MANIFEST.md`
  - `components/<name>.spec.md`
- Screenshots: `docs/design-references/tool-browser-qq-com-d1ad3910/root-8a5edab2/`

## Component root
- `src/components/sites/tool-browser-qq-com/root-8a5edab2/`
- Shared same-site: `src/components/sites/tool-browser-qq-com/shared/icons.tsx`

## Asset root
- Page: `public/sites/tool-browser-qq-com/root-8a5edab2/`
- Shared same-site: `public/sites/tool-browser-qq-com/shared/` (tool icons reused across the page)

## Download script
- `scripts/download-assets-tool-browser-qq-com-root-8a5edab2.mjs`

## Foundation changes (shared files)
- `src/app/layout.tsx` — replace `next/font/google` (unreachable in this env; target uses system fonts anyway) with a system font stack; set `lang="zh-CN"`; set target metadata.
- `src/app/globals.css` — add target color tokens scoped under a page wrapper where possible; keep shadcn tokens intact for any primitives.
- `src/components/sites/tool-browser-qq-com/shared/icons.tsx` — extracted SVG icons.
- New namespaced types: `src/components/sites/tool-browser-qq-com/shared/types.ts`.

No existing cloned/user routes to preserve (only the scaffold). No collisions — all paths are namespaced and unique.
