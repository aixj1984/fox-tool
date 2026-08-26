"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, IMAGES } from "./data";
import { cn } from "@/lib/utils";

// Left fixed sidebar: logo + category nav.
// On the live site this is `position: fixed; width: 240px; background #F6F7FA`.
export function LeftNav({ activeHref = "/" }: { activeHref?: string }) {
  return (
    <aside
      className="fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col bg-[#F6F7FA]"
      aria-label="工具分类导航"
    >
      {/* Logo */}
      <Link
        href="/"
        className="mt-10 flex items-center pb-[30px] pl-[30px] no-underline"
      >
        <Image
          src={IMAGES.logo}
          alt="FoxHelper"
          width={30}
          height={30}
          className="mr-[23px] h-[30px] w-[30px] shrink-0"
          unoptimized
        />
        <span className="flex flex-col leading-tight">
          <span className="text-[20px] font-semibold text-black">FoxHelper</span>
          <span className="text-[12px] font-normal text-black">
            在线工具箱平台
          </span>
        </span>
      </Link>

      {/* Nav list */}
      <nav>
        <ul className="m-0 list-none p-0">
          {CATEGORIES.map((cat, i) => {
            const active = cat.href === activeHref;
            return (
              <li
                key={cat.href}
                className={cn("mx-[10px]", i === 0 ? "mt-0" : "mt-5")}
              >
                <Link
                  href={cat.href}
                  className={cn(
                    "flex h-[43px] w-[220px] items-center px-0 text-[16px] font-normal no-underline",
                    "text-[#0000EE]",
                    active && "rounded-[10px] bg-[#E8E8FD]",
                  )}
                >
                  <span className="pl-[20px]">{cat.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

// Spacer that reserves the 240px sidebar width in the flow.
// Height is auto (not h-screen) so the document can grow with content;
// the fixed LeftNav is h-screen on its own and doesn't need a tall placeholder.
export function LeftNavPlaceholder() {
  return <div className="w-[240px] shrink-0" aria-hidden="true" />;
}
