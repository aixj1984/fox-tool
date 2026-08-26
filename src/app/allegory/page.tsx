"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { ALLEGORIES } from "./allegory-data";

const DESCRIPTION =
  "歇后语工具可以帮助您查找和学习各种歇后语。通过这款工具，您可以输入歇后语的前半部分或关键词，快速获取完整的歇后语及其解释，便于语言学习、文化了解和日常交流。";

export default function AllegoryPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim();
    if (q === "") return ALLEGORIES.slice(0, 50);
    return ALLEGORIES.filter(
      (a) => a.first.includes(q) || a.second.includes(q) || a.meaning.includes(q),
    );
  }, [query]);

  const copyAll = results
    .map((a) => `${a.first}——${a.second}（${a.meaning}）`)
    .join("\n");

  return (
    <ToolPageShell title="歇后语" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            搜索歇后语
          </label>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="输入前半句或关键词，例如 哑巴、竹篮"
            className="w-[360px]"
          />
          <div className="mt-[10px] flex items-center justify-between">
            <span className="text-[13px] text-[#8F8F8F]">
              共收录 {ALLEGORIES.length} 条歇后语{query.trim() !== "" ? `，匹配 ${results.length} 条` : ""}
            </span>
            {results.length > 0 && <CopyButton text={copyAll} label="复制全部" />}
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2">
          {results.map((a, idx) => (
            <ToolCard key={idx}>
              <div className="flex flex-col gap-[8px]">
                <div className="text-[16px] font-semibold text-[#242424]">
                  <span className="text-[#242424]">{a.first}</span>
                  <span className="text-[#136CE9]">——{a.second}</span>
                </div>
                <div className="rounded-[6px] bg-[#F6F7FA] px-[12px] py-[8px] text-[13px] leading-[20px] text-[#8F8F8F]">
                  {a.meaning}
                </div>
              </div>
            </ToolCard>
          ))}
          {results.length === 0 && (
            <ToolCard className="md:col-span-2">
              <p className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                未找到匹配的歇后语，请尝试其他关键词。
              </p>
            </ToolCard>
          )}
        </div>
      </div>
    </ToolPageShell>
  );
}
