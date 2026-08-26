import Link from "next/link";
import Image from "next/image";
import type { ToolItem } from "../shared/data";
import { TOOLS } from "../shared/data";
import { imgSrc } from "@/lib/img-path";

// The 160-card tool grid. Live: display:grid; grid-template-columns: 390px 390px 390px;
// container margin 0 30px 30px 0. Each .tool-item (a): 360x100, margin 30px 30px 0 0,
// white, radius 10px, shadow rgba(0,0,0,0.1) 0 0 10px 0. Icon 60x60 margin 20px 0 0 20px.
// .tool-content margin 25px 0 0 10px. .label badge absolute top-right.
export function ToolGrid() {
  return (
    <div
      className="mx-[30px] my-0 mb-[30px] grid"
      style={{
        gridTemplateColumns: "390px 390px 390px",
      }}
    >
      {TOOLS.map((tool) => (
        <ToolCard key={tool.href + tool.name} tool={tool} />
      ))}
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolItem }) {
  const isExternal = tool.href.startsWith("http");
  const linkClass =
    "relative mr-[30px] mt-[30px] block h-[100px] w-[360px] rounded-[10px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] transition-all no-underline hover:shadow-[0_0_16px_0_rgba(0,0,0,0.18)]";
  const inner = (
    <>
      {/* icon */}
      <Image
        src={imgSrc(tool.icon)}
        alt={tool.name}
        width={60}
        height={60}
        className="mt-[20px] ml-[20px] h-[60px] w-[60px] shrink-0 object-fill"
        unoptimized
      />
      {/* text */}
      <div className="absolute left-[90px] top-[25px] w-[240px]">
        <div className="text-[16px] font-semibold leading-[20px] text-[#242424]">
          {tool.name}
        </div>
        <div className="mt-[10px] line-clamp-2 text-[14px] leading-[20px] text-[#8F8F8F]">
          {tool.desc}
        </div>
      </div>
      {/* badge */}
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
      <a
        href={tool.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={tool.href} className={linkClass}>
      {inner}
    </Link>
  );
}
