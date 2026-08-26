"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { NICK_BANK, type NickCategory } from "./word-bank";

const DESCRIPTION =
  "随机网名生成是一款免费、在线的网名生成工具，它提供了当前最时尚、潮流的网名提供选择，简单易用、个性化程度高。";

const CATEGORY_LABEL: Record<NickCategory, string> = {
  cute: "可爱",
  cool: "酷炫",
  ancient: "古风",
  funny: "搞笑",
};

function secureInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function pick<T>(arr: T[]): T {
  return arr[secureInt(arr.length)];
}

function genOne(cat: NickCategory): string {
  const bank = NICK_BANK[cat];
  // 70% prefix+noun, 20% prefix+noun+suffix, 10% noun only.
  const r = secureInt(10);
  if (r < 1) return pick(bank.noun);
  const base = pick(bank.prefix) + pick(bank.noun);
  if (r < 8) return base;
  return base + pick(bank.suffix);
}

function genBatch(cat: NickCategory, count: number): string[] {
  const out = new Set<string>();
  let guard = 0;
  while (out.size < count && guard < count * 8) {
    out.add(genOne(cat));
    guard++;
  }
  // If the bank is small and collisions are frequent, pad with extra draws.
  while (out.size < count) out.add(genOne(cat));
  return [...out];
}

export default function Page() {
  const [category, setCategory] = useState<NickCategory>("cute");
  const [names, setNames] = useState<string[]>([]);

  const regen = useCallback(() => {
    setNames(genBatch(category, 12));
  }, [category]);

  useEffect(() => {
    regen();
  }, [regen]);

  return (
    <ToolPageShell title="随机网名" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="flex flex-wrap items-center gap-[12px]">
            {(Object.keys(CATEGORY_LABEL) as NickCategory[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`h-[36px] rounded-[8px] px-[16px] text-[14px] font-medium transition-colors ${
                  category === c
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
            <div className="ml-auto">
              <ToolButton onClick={regen}>换一批</ToolButton>
            </div>
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
          {names.map((n, i) => (
            <div
              key={`${n}-${i}`}
              className="flex items-center justify-between rounded-[10px] border border-[#F6F7FA] bg-white px-[16px] py-[14px] shadow-[0_0_10px_0_rgba(0,0,0,0.06)]"
            >
              <span className="truncate text-[16px] text-[#242424]">{n}</span>
              <CopyButton text={n} label="复制" />
            </div>
          ))}
        </div>
      </div>
    </ToolPageShell>
  );
}
