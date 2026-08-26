"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { IDIOMS } from "./idiom-data";

const DESCRIPTION =
  "成语接龙工具可以帮助您进行成语接龙游戏，提升您的汉语词汇量和语言表达能力。通过这款工具，您可以输入一个成语，工具会自动生成下一个接龙成语，帮助您继续游戏，适用于学习、娱乐和语言训练等场景。";

interface ChainEntry {
  word: string;
  pinyin: string;
}

// Build a map from a single character to all idioms starting with that char.
const FIRST_CHAR_MAP: Map<string, ChainEntry[]> = (() => {
  const m = new Map<string, ChainEntry[]>();
  for (const id of IDIOMS) {
    const first = id.word[0];
    const arr = m.get(first);
    if (arr) arr.push({ word: id.word, pinyin: id.pinyin });
    else m.set(first, [{ word: id.word, pinyin: id.pinyin }]);
  }
  return m;
})();

function findNext(lastChar: string): ChainEntry[] {
  return FIRST_CHAR_MAP.get(lastChar) ?? [];
}

export default function JielongPage() {
  const [input, setInput] = useState("");
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [error, setError] = useState("");

  const inputNormalized = input.trim();

  const matchInDict = useMemo(() => {
    if (inputNormalized.length !== 4) return null;
    return IDIOMS.find((id) => id.word === inputNormalized) ?? null;
  }, [inputNormalized]);

  const startChain = () => {
    setError("");
    if (inputNormalized.length !== 4) {
      setError("请输入一个四字成语。");
      return;
    }
    const found = IDIOMS.find((id) => id.word === inputNormalized);
    if (!found) {
      setError(`未在词典中找到成语「${inputNormalized}」，请确认输入。`);
      return;
    }
    setChain([{ word: found.word, pinyin: found.pinyin }]);
  };

  const appendNext = (entry: ChainEntry) => {
    setChain((prev) => [...prev, entry]);
  };

  const currentLastChar = chain.length > 0 ? chain[chain.length - 1].word[3] : "";
  const nextOptions = useMemo(() => {
    if (!currentLastChar) return [];
    return findNext(currentLastChar).slice(0, 8);
  }, [currentLastChar]);

  return (
    <ToolPageShell title="成语接龙" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            输入起始成语
          </label>
          <div className="flex items-center gap-[10px]">
            <ToolInput
              value={input}
              onChange={setInput}
              placeholder="例如 一心一意"
              className="w-[240px]"
            />
            <ToolButton onClick={startChain}>开始接龙</ToolButton>
          </div>
          {inputNormalized && !matchInDict && inputNormalized.length === 4 && (
            <p className="mt-[8px] text-[13px] text-[#F59E0B]">
              提示：「{inputNormalized}」未收录在词典中，但仍可尝试接龙。
            </p>
          )}
          {error && <p className="mt-[8px] text-[13px] text-[#E53935]">{error}</p>}
          <div className="mt-[10px] text-[13px] text-[#8F8F8F]">
            词典共收录 {IDIOMS.length} 个成语。输入成语后点击开始，工具将根据末字匹配下一个成语。
          </div>
        </ToolCard>

        {chain.length > 0 && (
          <ToolCard>
            <div className="mb-[14px] flex items-center justify-between">
              <label className="text-[14px] font-medium text-[#242424]">接龙记录</label>
              <button
                type="button"
                onClick={() => setChain([])}
                className="cursor-pointer text-[12px] text-[#8F8F8F] hover:text-[#E53935]"
              >
                清空
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-[6px]">
              {chain.map((entry, idx) => (
                <span key={idx} className="flex items-center gap-[6px]">
                  <span className="inline-flex flex-col items-center rounded-[8px] bg-[#EEF3FE] px-[14px] py-[8px]">
                    <span className="text-[16px] font-semibold text-[#136CE9]">
                      {entry.word}
                    </span>
                    <span className="text-[11px] text-[#8F8F8F]">{entry.pinyin}</span>
                  </span>
                  {idx < chain.length - 1 && (
                    <span className="text-[14px] text-[#8F8F8F]">→</span>
                  )}
                </span>
              ))}
            </div>
          </ToolCard>
        )}

        {nextOptions.length > 0 && (
          <ToolCard>
            <label className="mb-[10px] block text-[14px] font-medium text-[#242424]">
              可接龙成语（末字「{currentLastChar}」开头，共 {findNext(currentLastChar).length} 个）
            </label>
            <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4">
              {nextOptions.map((opt) => (
                <button
                  key={opt.word}
                  type="button"
                  onClick={() => appendNext(opt)}
                  className="cursor-pointer rounded-[8px] border border-[#E5E7EB] px-[12px] py-[10px] text-left transition-colors hover:border-[#136CE9] hover:bg-[#EEF3FE]"
                >
                  <div className="text-[15px] font-medium text-[#242424]">{opt.word}</div>
                  <div className="text-[11px] text-[#8F8F8F]">{opt.pinyin}</div>
                </button>
              ))}
            </div>
            {findNext(currentLastChar).length === 0 && (
              <p className="py-[16px] text-center text-[13px] text-[#8F8F8F]">
                没有以「{currentLastChar}」开头的成语，接龙结束。
              </p>
            )}
          </ToolCard>
        )}

        {chain.length === 0 && nextOptions.length === 0 && (
          <ToolCard>
            <p className="py-[30px] text-center text-[13px] text-[#8F8F8F]">
              输入一个四字成语开始接龙游戏。
            </p>
          </ToolCard>
        )}
      </div>
    </ToolPageShell>
  );
}
