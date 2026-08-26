# Tool Page Build Convention

All pure-frontend tool pages share a convention. Read this before building any tool page.

## Shared shell
Import the shared shell + building blocks from the same-site shared module:

```tsx
import { ToolPageShell, ToolCard, ToolButton, ToolTextarea, ToolInput, ToolLabel, CopyButton } from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
```

`ToolPageShell` provides: fixed left sidebar, floating nav, footer, breadcrumb, `<h1>{title}</h1>`, and `<p>{description}</p>`, then `{children}`. Wrap your tool UI in it.

## Route file location
Each tool page is an App Router route. The portal links to the **clean route** (no `.html`).
- `/md5` → `src/app/md5/page.tsx`
- `/url_parse` → `src/app/url_parse/page.tsx`  (use the path segment as-is; underscores are fine)
- `/jsondiff` → `src/app/jsondiff/page.tsx`

So `src/app/<segment>/page.tsx` where `<segment>` is the tool's href without the leading `/` and without `.html`.

## Page pattern

```tsx
"use client";

import { useState } from "react";
import { ToolPageShell, ToolCard, ToolButton, ToolTextarea, ToolInput, ToolLabel, CopyButton } from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

export default function Page() {
  return (
    <ToolPageShell title="md5加密" description="MD5加密工具...（用 tools-raw 里的 desc 全文）">
      {/* tool UI */}
    </ToolPageShell>
  );
}
```

- Use `"use client"` at the top (tools are interactive).
- `title` = the tool's name; `description` = the tool's full `desc` from data.ts (verbatim).
- Implement the tool to **actually work** client-side — real encoding/calculation/generation, not mockups.

## Tech rules
- TypeScript strict, no `any`. Named exports, default export for the page.
- Tailwind utility classes; 2-space indent; camelCase.
- Use the installed libs where helpful: `qrcode` (QR), `marked` (markdown), `js-yaml` (YAML/JSON), `diff` (text diff). Import them in the page component.
- Browser-native APIs preferred: Web Crypto (`crypto.subtle`) for hashing/AES, `TextEncoder`/`TextDecoder`, `btoa`/`atob`, Canvas for image tools, `getUserMedia` for QR scan.
- For static lookup data (车牌, 电话区号, 朝代, 首都, 元素周期表, 邮编, 食物热量), bundle a compact JS data object in the page (or a colocated `.ts` data file). Keep it real and correct.
- Every tool must produce real output. Include a copy/output mechanism where relevant (CopyButton).
- Verify with `npx tsc --noEmit` before finishing — the page must typecheck.

## Do NOT
- Don't import from `next/image` inside tool pages unless displaying a downloaded asset.
- Don't create backend routes or API endpoints.
- Don't mock results — compute them for real.
- Don't modify shared files (ToolPageShell, data.ts, types.ts, icons, LeftNav, FloatingNav, Footer). If you need a new shared helper, ask — but prefer keeping it local to your page.
