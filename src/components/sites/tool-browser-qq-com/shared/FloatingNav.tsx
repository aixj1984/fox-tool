"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon, QqGroupIcon } from "./icons";
import { cn } from "@/lib/utils";

// Right floating mini-nav: back-to-top, QQ群, 共建, 反馈.
// Live: position fixed, right:30px, bottom:60px, 4 white 50x50 rounded buttons.
export function FloatingNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  // 功能按钮统一不跳转：点击无外部链接，仅保留按钮形态。
  const items = [
    {
      key: "top",
      label: "回到顶部",
      onClick: scrollToTop,
      content: <ArrowUpIcon className="text-[#242424]" />,
    },
    {
      key: "qq",
      label: "QQ群：459317399",
      onClick: undefined,
      content: <QqGroupIcon className="text-[#242424]" />,
    },
    {
      key: "build",
      label: "共建",
      onClick: undefined,
      content: <span className="text-[14px] text-[#242424]">共建</span>,
    },
    {
      key: "feedback",
      label: "反馈",
      onClick: undefined,
      content: <span className="text-[14px] text-[#242424]">反馈</span>,
    },
  ];

  return (
    <div
      className="fixed right-[30px] bottom-[60px] z-[2] flex flex-col"
      style={{ display: visible ? "flex" : "none" }}
      aria-label="浮动导航"
    >
      {items.map((it, i) => (
        <div
          key={it.key}
          className={cn(
            "flex h-[50px] w-[50px] items-center justify-center rounded-[10px] bg-white",
            i < items.length - 1 && "mb-[10px]",
          )}
          title={it.label ?? undefined}
        >
          <button
            type="button"
            onClick={it.onClick}
            className="flex h-full w-full cursor-pointer items-center justify-center bg-transparent"
            aria-label={it.label ?? "回到顶部"}
          >
            {it.content}
          </button>
        </div>
      ))}
    </div>
  );
}
