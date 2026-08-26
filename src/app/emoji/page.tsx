"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { kaomojiCategories } from "./kaomoji-data";

const DESCRIPTION =
  "文本颜艺工具收录了大量的可爱颜文字，可以点击喜欢的颜文字进行复制。";

export default function Page() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return kaomojiCategories;
    return kaomojiCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) =>
            it.text.toLowerCase().includes(q) ||
            (it.label ?? "").toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // clipboard may be unavailable; ignore.
    }
    setCopied(text);
    window.setTimeout(() => setCopied(null), 1500);
  };

  const totalCount = useMemo(
    () => kaomojiCategories.reduce((n, c) => n + c.items.length, 0),
    [],
  );

  return (
    <ToolPageShell title="文本颜艺" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="搜索颜文字（如 开心、爱心 或表情片段）……"
            className="w-full"
          />
          <div className="mt-[8px] text-[13px] text-[#8F8F8F]">
            共收录 {totalCount} 个颜文字，点击即可复制到剪贴板
          </div>
        </ToolCard>

        {filtered.length === 0 ? (
          <ToolCard>
            <p className="text-[14px] text-[#8F8F8F]">
              没有找到匹配的颜文字，换个关键词试试。
            </p>
          </ToolCard>
        ) : (
          filtered.map((cat) => (
            <ToolCard key={cat.name}>
              <div className="mb-[12px] flex items-center gap-[8px]">
                <h2 className="text-[16px] font-semibold text-[#242424]">
                  {cat.name}
                </h2>
                <span className="text-[13px] text-[#8F8F8F]">
                  {cat.items.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 md:grid-cols-4">
                {cat.items.map((it, i) => (
                  <button
                    key={`${cat.name}-${i}`}
                    type="button"
                    onClick={() => void handleCopy(it.text)}
                    className="group flex min-h-[56px] items-center justify-center rounded-[8px] border border-[#F6F7FA] bg-[#FAFBFC] px-[10px] py-[8px] text-center transition-colors hover:border-[#136CE9] hover:bg-[#EEF3FE]"
                  >
                    <span className="font-mono text-[15px] leading-[20px] text-[#242424] break-all">
                      {it.text}
                    </span>
                  </button>
                ))}
              </div>
            </ToolCard>
          ))
        )}

        {copied ? (
          <div className="fixed bottom-[24px] left-1/2 z-50 -translate-x-1/2 rounded-[8px] bg-[#242424] px-[16px] py-[8px] text-[14px] text-white shadow-lg">
            已复制：{copied}
          </div>
        ) : null}
      </div>
    </ToolPageShell>
  );
}
