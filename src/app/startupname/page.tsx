"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  STARTUP_PREFIX,
  STARTUP_SUFFIX,
  STARTUP_SECOND,
  STARTUP_INDUSTRY,
  type StartupStyle,
} from "./word-bank";

const DESCRIPTION =
  "英文创业公司/项目名生成是一款创意丰富的在线工具，专为帮助创业者和项目团队快速生成独特且有吸引力的英文公司或项目名称而设计。";

const STYLE_LABEL: Record<StartupStyle, string> = {
  compact: "简洁拼合",
  twoword: "双词组合",
  suffix: "后缀风",
  keyword: "关键词衍生",
};

function secureInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function pick<T>(arr: T[]): T {
  return arr[secureInt(arr.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function genOne(style: StartupStyle, keyword: string): string {
  switch (style) {
    case "compact": {
      // Prefix + Suffix joined directly, e.g. "Pixify", "NovaHub".
      return capitalize(pick(STARTUP_PREFIX)) + pick(STARTUP_SUFFIX);
    }
    case "twoword": {
      // Prefix + second word with a space, e.g. "Lumen Health".
      return `${capitalize(pick(STARTUP_PREFIX))} ${pick(STARTUP_SECOND)}`;
    }
    case "suffix": {
      // Keyword (or random prefix) + suffix, e.g. "Shoply", "CloudAI".
      const base = keyword.trim() ? capitalize(keyword.trim()) : capitalize(pick(STARTUP_PREFIX));
      return base + pick(STARTUP_SUFFIX);
    }
    case "keyword": {
      // Industry keyword + a partner word, e.g. "FinForge", "MedLab".
      const industries = Object.values(STARTUP_INDUSTRY).flat();
      const kw = keyword.trim()
        ? capitalize(keyword.trim())
        : pick(industries);
      const partner = pick(STARTUP_SECOND);
      return `${kw} ${partner}`;
    }
  }
}

function genBatch(style: StartupStyle, keyword: string, count: number): string[] {
  const out = new Set<string>();
  let guard = 0;
  while (out.size < count && guard < count * 10) {
    out.add(genOne(style, keyword));
    guard++;
  }
  while (out.size < count) out.add(genOne(style, keyword));
  return [...out];
}

export default function Page() {
  const [style, setStyle] = useState<StartupStyle>("compact");
  const [keyword, setKeyword] = useState("");
  const [names, setNames] = useState<string[]>([]);

  const regen = useCallback(() => {
    setNames(genBatch(style, keyword, 12));
  }, [style, keyword]);

  useEffect(() => {
    regen();
  }, [regen]);

  return (
    <ToolPageShell title="英文创业公司/项目名生成" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
            <div>
              <ToolLabel>风格</ToolLabel>
              <div className="flex flex-wrap gap-[8px]">
                {(Object.keys(STYLE_LABEL) as StartupStyle[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`h-[36px] rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                      style === s
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {STYLE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <ToolLabel>关键词（可选）</ToolLabel>
              <ToolInput
                value={keyword}
                onChange={setKeyword}
                placeholder="例如：Shop、Pay、Cloud"
              />
            </div>
          </div>
          <div className="mt-[16px] flex justify-end">
            <ToolButton onClick={regen}>换一批</ToolButton>
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
          {names.map((n, i) => (
            <div
              key={`${n}-${i}`}
              className="flex items-center justify-between rounded-[10px] border border-[#F6F7FA] bg-white px-[16px] py-[14px] shadow-[0_0_10px_0_rgba(0,0,0,0.06)]"
            >
              <span className="truncate font-mono text-[15px] text-[#242424]">{n}</span>
              <CopyButton text={n} label="复制" />
            </div>
          ))}
        </div>
      </div>
    </ToolPageShell>
  );
}
