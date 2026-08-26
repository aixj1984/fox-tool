"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { RADICALS, type CharRadical } from "./radical-data";

const DESCRIPTION =
  "汉字偏旁工具可以帮助您查找和学习汉字的偏旁部首。通过这款工具，您可以输入汉字，快速获取该汉字的偏旁部首信息，了解其构造和意义，便于汉字学习和教学。";

const STRUCTURE_COLORS: Record<string, string> = {
  独体: "#8E8E8E",
  左右: "#136CE9",
  上下: "#43A047",
  包围: "#E53935",
  半包围: "#F59E0B",
  品字形: "#9C27B0",
  镶嵌: "#00BCD4",
};

export default function RadicalPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<CharRadical | null>(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (q === "") return [];
    const chars = Array.from(q);
    const found: CharRadical[] = [];
    const seen = new Set<string>();
    for (const ch of chars) {
      if (seen.has(ch)) continue;
      seen.add(ch);
      const item = RADICALS.find((r) => r.char === ch);
      if (item) found.push(item);
    }
    return found;
  }, [query]);

  return (
    <ToolPageShell title="汉字偏旁" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            输入汉字查询偏旁
          </label>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="输入一个或多个汉字，例如 明、林、森"
            className="w-[360px]"
          />
          <div className="mt-[10px] text-[13px] text-[#8F8F8F]">
            共收录 {RADICALS.length} 个常用汉字的偏旁部首信息。
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              查询结果（{results.length}）
            </label>
            {results.length > 0 ? (
              <div className="flex flex-col gap-[8px]">
                {results.map((r) => (
                  <button
                    key={r.char}
                    type="button"
                    onClick={() => setActive(r)}
                    className={`flex items-center gap-[14px] rounded-[8px] border px-[12px] py-[10px] text-left transition-colors ${
                      active?.char === r.char
                        ? "border-[#136CE9] bg-[#EEF3FE]"
                        : "border-[#F6F7FA] hover:bg-[#F6F7FA]"
                    }`}
                  >
                    <span className="text-[28px] font-semibold text-[#242424]">
                      {r.char}
                    </span>
                    <div className="flex flex-1 flex-col">
                      <span className="text-[14px] text-[#242424]">
                        部首：<span className="font-medium">{r.radical}</span>（{r.radicalName}）
                      </span>
                      <span className="text-[12px] text-[#8F8F8F]">
                        {r.strokes}画 · {r.structure}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                请输入汉字进行查询。
              </p>
            )}
          </ToolCard>

          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              汉字详情
            </label>
            {active ? (
              <div className="flex flex-col gap-[16px]">
                <div className="rounded-[10px] bg-[#EEF3FE] px-[20px] py-[16px] text-center">
                  <span className="text-[56px] font-semibold text-[#136CE9]">
                    {active.char}
                  </span>
                </div>
                <DetailRow label="偏旁部首">
                  <span className="text-[16px] font-semibold">{active.radical}</span>
                  <span className="ml-[8px] text-[14px] text-[#8F8F8F]">
                    {active.radicalName}
                  </span>
                </DetailRow>
                <DetailRow label="总笔画">{active.strokes} 画</DetailRow>
                <DetailRow label="汉字结构">
                  <span
                    className="rounded-[6px] px-[10px] py-[2px] text-[13px] font-medium text-white"
                    style={{ background: STRUCTURE_COLORS[active.structure] ?? "#8E8E8E" }}
                  >
                    {active.structure}
                  </span>
                </DetailRow>
              </div>
            ) : (
              <p className="py-[30px] text-center text-[13px] text-[#8F8F8F]">
                从左侧选择一个汉字查看详细信息。
              </p>
            )}
          </ToolCard>
        </div>
      </div>
    </ToolPageShell>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[12px] border-b border-[#F6F7FA] pb-[10px] last:border-0">
      <span className="w-[80px] shrink-0 text-[14px] text-[#8F8F8F]">{label}</span>
      <div className="flex-1 text-[14px] text-[#242424]">{children}</div>
    </div>
  );
}
