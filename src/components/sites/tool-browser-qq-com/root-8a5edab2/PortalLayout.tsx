import {
  LeftNav,
  LeftNavPlaceholder,
} from "@/components/sites/tool-browser-qq-com/shared/LeftNav";
import { FloatingNav } from "@/components/sites/tool-browser-qq-com/shared/FloatingNav";
import { Footer } from "@/components/sites/tool-browser-qq-com/shared/Footer";
import { ToolGrid } from "@/components/sites/tool-browser-qq-com/root-8a5edab2/ToolGrid";
import type { ToolItem } from "@/components/sites/tool-browser-qq-com/shared/data";

// Reusable portal layout: sidebar + top-content + (optional banner) + tool grid + footer.
// Used by the home page (with banner) and category pages (banner omitted, grid filtered).
// 1140px content is centered within the remaining viewport (sidebar takes 240px),
// matching the source site's `margin: 0 auto` on `<main>`.
export function PortalLayout({
  activeHref = "/",
  banner,
  tools,
}: {
  activeHref?: string;
  banner?: React.ReactNode;
  tools: ToolItem[];
}) {
  return (
    <div className="flex bg-white">
      <LeftNav activeHref={activeHref} />
      <LeftNavPlaceholder />
      <FloatingNav />
      <main className="relative w-full min-w-[1140px] flex-1">
        <div className="mx-auto w-[1140px]">
          {banner}
          <FilteredToolGrid tools={tools} />
        </div>
        <Footer />
      </main>
    </div>
  );
}

// A tool grid that renders a provided list (instead of the full 160) — for category pages.
function FilteredToolGrid({ tools }: { tools: ToolItem[] }) {
  return (
    <div
      className="mx-[30px] my-0 mb-[30px] grid"
      style={{ gridTemplateColumns: "390px 390px 390px" }}
    >
      {tools.map((tool) => (
        <ToolCardWrapper key={tool.href + tool.name} tool={tool} />
      ))}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

function ToolCardWrapper({ tool }: { tool: ToolItem }) {
  const isExternal = tool.href.startsWith("http");
  const cls =
    "relative mr-[30px] mt-[30px] block h-[100px] w-[360px] rounded-[10px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] transition-all no-underline hover:shadow-[0_0_16px_0_rgba(0,0,0,0.18)]";
  const inner = (
    <>
      <Image
        src={tool.icon}
        alt={tool.name}
        width={60}
        height={60}
        className="mt-[20px] ml-[20px] h-[60px] w-[60px] shrink-0 object-fill"
        unoptimized
      />
      <div className="absolute left-[90px] top-[25px] w-[240px]">
        <div className="text-[16px] font-semibold leading-[20px] text-[#242424]">
          {tool.name}
        </div>
        <div className="mt-[10px] line-clamp-2 text-[14px] leading-[20px] text-[#8F8F8F]">
          {tool.desc}
        </div>
      </div>
      {tool.badge ? (
        <span
          className="absolute right-0 top-0 rounded-br-[10px] rounded-tl-[0] px-[8px] py-[2px] text-[16px] leading-[20px] text-white"
          style={{ backgroundColor: tool.badgeColor }}
        >
          {tool.badge}
        </span>
      ) : null}
    </>
  );
  if (isExternal) {
    return (
      <a href={tool.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={tool.href} className={cls}>
      {inner}
    </Link>
  );
}
