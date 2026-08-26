"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { CHENGYU, type ChengYu } from "./chengyu-data";

const DESCRIPTION =
  "成语大全查询是一款免费的中国传统文化知识工具，它收录了上亿个成语能够对成成语首字符快速查询， 成语大全查询是一款用心打造的成语故事查询工具，不仅满足了用户对成语的理解需求和娱乐需求，更成为了他们学习和生活中不可或缺的好帮手";

export default function ChengyuJielongPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ChengYu | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (q === "") return CHENGYU.slice(0, 60);
    return CHENGYU.filter(
      (c) => c.word.includes(q) || c.pinyin.includes(q.toLowerCase()) || c.meaning.includes(q),
    );
  }, [query]);

  const firstCharIndex = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of CHENGYU) {
      const first = c.word[0];
      m.set(first, (m.get(first) ?? 0) + 1);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 30);
  }, []);

  return (
    <ToolPageShell title="成语大全" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            搜索成语
          </label>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="输入成语、首字或释义关键字"
            className="w-[360px]"
          />
          <div className="mt-[10px] text-[13px] text-[#8F8F8F]">
            共收录 {CHENGYU.length} 个成语，支持按成语、拼音、释义搜索。
          </div>
        </ToolCard>

        <ToolCard>
          <label className="mb-[10px] block text-[14px] font-medium text-[#242424]">
            首字索引（热门）
          </label>
          <div className="flex flex-wrap gap-[6px]">
            {firstCharIndex.map(([ch, count]) => (
              <button
                key={ch}
                type="button"
                onClick={() => {
                  setQuery(ch);
                  setActive(null);
                }}
                className="h-[32px] cursor-pointer rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] text-[13px] text-[#242424] transition-colors hover:border-[#136CE9] hover:text-[#136CE9]"
              >
                {ch}
                <span className="ml-[4px] text-[11px] text-[#8F8F8F]">{count}</span>
              </button>
            ))}
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              成语列表（{filtered.length}）
            </label>
            <div className="flex max-h-[460px] flex-col overflow-y-auto pr-[4px]">
              {filtered.map((c) => (
                <button
                  key={c.word}
                  type="button"
                  onClick={() => setActive(c)}
                  className={`flex items-center justify-between border-b border-[#F6F7FA] py-[10px] text-left transition-colors last:border-0 hover:bg-[#F6F7FA] ${
                    active?.word === c.word ? "bg-[#EEF3FE]" : ""
                  }`}
                >
                  <span className="text-[15px] font-medium text-[#242424]">{c.word}</span>
                  <span className="text-[12px] text-[#8F8F8F]">{c.pinyin}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                  未找到匹配的成语。
                </p>
              )}
            </div>
          </ToolCard>

          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              成语详情
            </label>
            {active ? (
              <div className="flex flex-col gap-[14px]">
                <div>
                  <div className="text-[24px] font-semibold text-[#242424]">
                    {active.word}
                  </div>
                  <div className="mt-[4px] text-[14px] text-[#136CE9]">
                    {active.pinyin}
                  </div>
                </div>
                <DetailSection label="释义">{active.meaning}</DetailSection>
                <DetailSection label="出处">{active.source}</DetailSection>
                <DetailSection label="例句">{active.example}</DetailSection>
              </div>
            ) : (
              <p className="py-[30px] text-center text-[13px] text-[#8F8F8F]">
                从左侧列表选择一个成语查看详细释义。
              </p>
            )}
          </ToolCard>
        </div>
      </div>
    </ToolPageShell>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] bg-[#F6F7FA] px-[14px] py-[12px]">
      <div className="mb-[6px] text-[13px] font-medium text-[#136CE9]">{label}</div>
      <div className="text-[14px] leading-[24px] text-[#242424]">{children}</div>
    </div>
  );
}
