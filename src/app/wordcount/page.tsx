"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolTextarea,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "字数计算专为快速计算文本中的字数、字符数、单词数和句子数而设计。无论您是需要统计文章的字数、检查字符限制，还是进行文本分析，这款工具都能帮助您高效完成任务。";

type Stats = {
  charsWithSpace: number;
  charsNoSpace: number;
  chinese: number;
  englishWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
};

function computeStats(text: string): Stats {
  const charsWithSpace = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;

  // Chinese characters: CJK Unified Ideographs + Ext A (basic plane).
  const chineseMatches = text.match(/[㐀-鿿]/g) ?? [];
  const chinese = chineseMatches.length;

  // English words: sequences of Latin letters/digits/apostrophes.
  const englishMatches = text.match(/[A-Za-z0-9]+(?:['’][A-Za-z]+)*/g) ?? [];
  const englishWords = englishMatches.length;

  // Sentences: split on . ! ? 。！？ while present. Count non-empty segments.
  const sentenceParts = text.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);
  const sentences = sentenceParts.length;

  // Paragraphs: blocks separated by two or more newlines (or blank lines).
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;

  // Lines: count by newline. Empty text = 0; trailing newline behavior kept simple.
  const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;

  return {
    charsWithSpace,
    charsNoSpace,
    chinese,
    englishWords,
    sentences,
    paragraphs,
    lines,
  };
}

type StatItem = { label: string; value: number; hint?: string };

export default function Page() {
  const [text, setText] = useState("");
  const stats = useMemo(() => computeStats(text), [text]);

  const items: StatItem[] = [
    { label: "字符数（含空格）", value: stats.charsWithSpace },
    { label: "字符数（不含空格）", value: stats.charsNoSpace },
    { label: "中文字数", value: stats.chinese, hint: "CJK 汉字" },
    { label: "英文单词数", value: stats.englishWords, hint: "Latin/Digit 词" },
    { label: "句子数", value: stats.sentences, hint: "按 .!?。！？ 切分" },
    { label: "段落数", value: stats.paragraphs, hint: "按空行切分" },
    { label: "行数", value: stats.lines },
  ];

  return (
    <ToolPageShell title="字数计算" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolTextarea
            value={text}
            onChange={setText}
            placeholder="在此粘贴或输入文本，统计结果将实时显示……"
            rows={10}
          />
          <div className="mt-[12px] flex items-center justify-between">
            <span className="text-[13px] text-[#8F8F8F]">
              实时统计，无需点击按钮
            </span>
            <button
              type="button"
              onClick={() => setText("")}
              className="text-[13px] text-[#136CE9] hover:underline"
            >
              清空
            </button>
          </div>
        </ToolCard>

        <ToolCard>
          <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-4">
            {items.map((it) => (
              <div
                key={it.label}
                className="rounded-[10px] border border-[#F6F7FA] bg-[#F9FAFB] p-[16px]"
              >
                <div className="text-[13px] text-[#8F8F8F]">{it.label}</div>
                <div className="mt-[6px] font-mono text-[26px] font-semibold text-[#242424]">
                  {it.value.toLocaleString("zh-CN")}
                </div>
                {it.hint ? (
                  <div className="mt-[2px] text-[11px] text-[#B0B0B0]">
                    {it.hint}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
