"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { S2T } from "./zh-convert-table";

type Direction = "s2t" | "t2s";

// Build the reverse (traditional → simplified) map.
// When multiple simplified chars map to the same traditional char, the first
// one wins — this is acceptable for common-use conversion.
const T2S: Record<string, string> = (() => {
  const rev: Record<string, string> = {};
  for (const [s, t] of Object.entries(S2T)) {
    if (!(t in rev)) rev[t] = s;
  }
  return rev;
})();

function convert(text: string, dir: Direction): string {
  const map = dir === "s2t" ? S2T : T2S;
  let out = "";
  for (const ch of text) {
    out += ch in map ? map[ch] : ch;
  }
  return out;
}

export default function Page() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("s2t");

  const output = useMemo(() => convert(input, direction), [input, direction]);

  const swap = () => {
    setDirection((d) => (d === "s2t" ? "t2s" : "s2t"));
    setInput(output);
  };

  return (
    <ToolPageShell
      title="简体繁体转换"
      description="简体繁体转换是一款便捷的在线工具，专为将简体中文和繁体中文之间进行转换而设计。通过这款工具，您可以轻松将文本从简体中文转换为繁体中文，或从繁体中文转换为简体中文，满足各种语言处理、文档编辑和跨地区交流的需求。"
    >
      <div className="mb-[16px] flex flex-wrap items-center gap-[10px]">
        <button
          type="button"
          onClick={() => setDirection("s2t")}
          className={`rounded-[8px] px-[18px] py-[8px] text-[14px] font-medium ${
            direction === "s2t"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          简体 → 繁体
        </button>
        <button
          type="button"
          onClick={() => setDirection("t2s")}
          className={`rounded-[8px] px-[18px] py-[8px] text-[14px] font-medium ${
            direction === "t2s"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          繁体 → 简体
        </button>
        <ToolButton variant="ghost" onClick={swap}>
          交换
        </ToolButton>
        <button
          type="button"
          onClick={() => setInput("")}
          className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[8px] bg-[#F6F7FA] px-[20px] text-[14px] font-medium text-[#242424] hover:bg-[#ebedf2]"
        >
          清空
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>
            {direction === "s2t" ? "简体中文（输入）" : "繁体中文（输入）"}
          </ToolLabel>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={direction === "s2t" ? "在此输入简体中文..." : "在此输入繁体中文..."}
            rows={14}
          />
          <p className="mt-[10px] text-[14px] text-[#8F8F8F]">
            {input.length} 个字符
          </p>
        </ToolCard>

        <ToolCard>
          <div className="mb-[6px] flex items-center justify-between">
            <ToolLabel>
              {direction === "s2t" ? "繁体中文（结果）" : "简体中文（结果）"}
            </ToolLabel>
            <CopyButton text={output} label="复制结果" />
          </div>
          <ToolTextarea
            value={output}
            onChange={() => undefined}
            placeholder="转换结果将显示在这里..."
            rows={14}
            className="bg-[#F9FAFB]"
          />
          <p className="mt-[10px] text-[14px] text-[#8F8F8F]">
            {output.length} 个字符
          </p>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
