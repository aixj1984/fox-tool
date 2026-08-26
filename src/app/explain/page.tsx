"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { WORDS, type Word } from "./word-data";

const DESCRIPTION =
  "词语注解工具可以帮助您查找和学习词语的详细解释和用法。通过这款工具，您可以输入任意词语，快速获取该词语的注解、拼音、词性、例句等信息，便于语言学习、写作和日常交流。";

const POS_COLORS: Record<string, string> = {
  名词: "#136CE9",
  动词: "#43A047",
  形容词: "#E53935",
  副词: "#F59E0B",
  介词: "#9C27B0",
  连词: "#00BCD4",
  助词: "#8E8E8E",
  代词: "#795548",
  数词: "#3F51B5",
  量词: "#FF9800",
  叹词: "#FF5722",
  拟声词: "#4CAF50",
  成语: "#C2185B",
};

export default function ExplainPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Word | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (q === "") return WORDS.slice(0, 60);
    return WORDS.filter(
      (w) =>
        w.word.includes(q) ||
        w.pinyin.includes(q.toLowerCase()) ||
        w.meaning.includes(q),
    );
  }, [query]);

  return (
    <ToolPageShell title="词语注解" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            搜索词语
          </label>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="输入词语或释义关键字"
            className="w-[360px]"
          />
          <div className="mt-[10px] text-[13px] text-[#8F8F8F]">
            共收录 {WORDS.length} 个常用词语，支持按词语、拼音、释义搜索。
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              词语列表（{filtered.length}）
            </label>
            <div className="flex max-h-[460px] flex-col overflow-y-auto pr-[4px]">
              {filtered.map((w) => (
                <button
                  key={w.word}
                  type="button"
                  onClick={() => setActive(w)}
                  className={`flex items-center justify-between border-b border-[#F6F7FA] py-[10px] text-left transition-colors last:border-0 hover:bg-[#F6F7FA] ${
                    active?.word === w.word ? "bg-[#EEF3FE]" : ""
                  }`}
                >
                  <span className="text-[15px] font-medium text-[#242424]">{w.word}</span>
                  <span className="flex items-center gap-[8px]">
                    <span className="text-[12px] text-[#8F8F8F]">{w.pinyin}</span>
                    <span
                      className="rounded-[4px] px-[6px] py-[1px] text-[11px] text-white"
                      style={{ background: POS_COLORS[w.pos] ?? "#8E8E8E" }}
                    >
                      {w.pos}
                    </span>
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                  未找到匹配的词语。
                </p>
              )}
            </div>
          </ToolCard>

          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              词语详情
            </label>
            {active ? (
              <div className="flex flex-col gap-[14px]">
                <div>
                  <div className="text-[24px] font-semibold text-[#242424]">
                    {active.word}
                  </div>
                  <div className="mt-[4px] flex items-center gap-[8px]">
                    <span className="text-[14px] text-[#136CE9]">{active.pinyin}</span>
                    <span
                      className="rounded-[4px] px-[6px] py-[1px] text-[12px] text-white"
                      style={{ background: POS_COLORS[active.pos] ?? "#8E8E8E" }}
                    >
                      {active.pos}
                    </span>
                  </div>
                </div>
                <DetailSection label="释义">{active.meaning}</DetailSection>
                <DetailSection label="例句">{active.example}</DetailSection>
              </div>
            ) : (
              <p className="py-[30px] text-center text-[13px] text-[#8F8F8F]">
                从左侧列表选择一个词语查看详细注解。
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
