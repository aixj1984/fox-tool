"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { POEMS } from "./poem-data";

const DESCRIPTION =
  "古诗词取名在古诗词中提取灵感，为人名、公司名、项目名等进行命名而设计。您可以选择特定的古诗词，生成具有诗意和文化内涵的名字。";

interface NameSuggestion {
  name: string;
  line: string;
  poemTitle: string;
  author: string;
}

// Filter out non-name-worthy characters from poem text.
const BAD_CHARS = new Set([
  "，", "。", "、", "；", "：", "！", "？", "“", "”", "‘", "’",
  " ", "\n", "　", "之", "其", "而", "以", "于", "兮", "曰",
  "不", "无", "有", "亦", "乃", "若", "如", "为", "所", "可",
  "何", "此", "彼", "者", "哉", "矣", "焉", "耳", "夫", "盖",
]);

// Extract 2-char name combinations from a poem's text.
function extractNames(text: string, max = 8): NameSuggestion[] {
  const chars = Array.from(text.replace(/\s/g, ""));
  const results: NameSuggestion[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < chars.length - 1; i++) {
    const a = chars[i];
    const b = chars[i + 1];
    if (BAD_CHARS.has(a) || BAD_CHARS.has(b)) continue;
    const combo = a + b;
    if (seen.has(combo)) continue;
    seen.add(combo);
    // Find the line this combo belongs to.
    const lines = text.split(/[，。、；：！？\n]/);
    const line = lines.find((l) => l.includes(combo)) ?? combo;
    results.push({ name: combo, line, poemTitle: "", author: "" });
    if (results.length >= max) break;
  }
  return results;
}

export default function MakeNamePage() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [randomMode, setRandomMode] = useState(false);
  const [randomIdx, setRandomIdx] = useState(0);

  const activePoem = randomMode ? POEMS[randomIdx % POEMS.length] : POEMS[selectedIdx];

  const suggestions = useMemo<NameSuggestion[]>(() => {
    const names = extractNames(activePoem.text, 8);
    return names.map((n) => ({
      ...n,
      poemTitle: activePoem.title,
      author: activePoem.author,
    }));
  }, [activePoem]);

  const handleRandom = () => {
    setRandomMode(true);
    setRandomIdx(Math.floor(Math.random() * POEMS.length));
  };

  const copyAll = suggestions.map((s) => `${s.name}（出处：${s.poemTitle} · ${s.author}）`).join("\n");

  return (
    <ToolPageShell title="古诗词取名" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        {/* Left: poem selector */}
        <div className="flex flex-col gap-[24px]">
          <ToolCard>
            <ToolLabel>选择古诗词</ToolLabel>
            <div className="mt-[8px] flex gap-[10px]">
              <ToolButton onClick={handleRandom}>随机一首</ToolButton>
              {randomMode && (
                <ToolButton variant="ghost" onClick={() => setRandomMode(false)}>
                  恢复手动选择
                </ToolButton>
              )}
            </div>
          </ToolCard>

          <ToolCard>
            <ToolLabel>诗词列表（共 {POEMS.length} 首）</ToolLabel>
            <div className="mt-[12px] flex max-h-[380px] flex-col gap-[4px] overflow-y-auto pr-[4px]">
              {POEMS.map((p, idx) => (
                <button
                  key={p.title + idx}
                  type="button"
                  onClick={() => {
                    setSelectedIdx(idx);
                    setRandomMode(false);
                  }}
                  className={`cursor-pointer rounded-[6px] px-[12px] py-[8px] text-left transition-colors ${
                    !randomMode && selectedIdx === idx
                      ? "bg-[#EEF3FE] text-[#136CE9]"
                      : "text-[#242424] hover:bg-[#F6F7FA]"
                  }`}
                >
                  <span className="text-[14px] font-medium">{p.title}</span>
                  <span className="ml-[8px] text-[12px] text-[#8F8F8F]">
                    {p.author} · {p.dynasty}
                  </span>
                </button>
              ))}
            </div>
          </ToolCard>
        </div>

        {/* Right: poem display + names */}
        <div className="flex flex-col gap-[24px]">
          <ToolCard>
            <div className="mb-[8px] flex items-center justify-between">
              <span className="text-[16px] font-semibold text-[#242424]">
                {activePoem.title}
              </span>
              <span className="text-[13px] text-[#8F8F8F]">
                {activePoem.author} · {activePoem.dynasty}
              </span>
            </div>
            <div className="whitespace-pre-line rounded-[8px] bg-[#F6F7FA] px-[16px] py-[14px] text-[15px] leading-[28px] text-[#242424]">
              {activePoem.text}
            </div>
          </ToolCard>

          <ToolCard>
            <div className="mb-[14px] flex items-center justify-between">
              <ToolLabel>取名建议</ToolLabel>
              {suggestions.length > 0 && <CopyButton text={copyAll} label="复制全部" />}
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              {suggestions.map((s, idx) => (
                <div
                  key={s.name + idx}
                  className="rounded-[8px] border border-[#F6F7FA] p-[12px] hover:border-[#136CE9]"
                >
                  <div className="text-[20px] font-semibold text-[#136CE9]">{s.name}</div>
                  <div className="mt-[6px] text-[12px] leading-[18px] text-[#8F8F8F]">
                    「{s.line}」
                  </div>
                  <div className="mt-[4px] text-[11px] text-[#8F8F8F]">
                    —— {s.poemTitle} · {s.author}
                  </div>
                </div>
              ))}
              {suggestions.length === 0 && (
                <p className="col-span-2 py-[20px] text-center text-[13px] text-[#8F8F8F]">
                  该诗词未提取到合适的名字组合。
                </p>
              )}
            </div>
          </ToolCard>
        </div>
      </div>
    </ToolPageShell>
  );
}
