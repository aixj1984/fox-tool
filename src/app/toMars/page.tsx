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
import { MARS_MAP, MARS_REVERSE_MAP } from "./mars-map";

const DESCRIPTION =
  "火星文翻译器可以帮助您将普通文本转换为火星文，或将火星文转换回普通文本。火星文是一种网络流行的文字变形形式。";

type Mode = "toMars" | "toNormal";

function toMars(text: string): string {
  // Multi-character keys must be matched before single characters so
  // longer phrases take precedence. Sort keys by length descending.
  const keys = Object.keys(MARS_MAP).sort((a, b) => b.length - a.length);
  let out = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const k of keys) {
      if (k.length > 0 && text.startsWith(k, i)) {
        out += MARS_MAP[k];
        i += k.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += text[i];
      i++;
    }
  }
  return out;
}

function toNormal(text: string): string {
  // Reverse: replace 火星文 glyphs with their original. Multi-char first.
  const keys = Object.keys(MARS_REVERSE_MAP).sort((a, b) => b.length - a.length);
  let out = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const k of keys) {
      if (k.length > 0 && text.startsWith(k, i)) {
        out += MARS_REVERSE_MAP[k];
        i += k.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += text[i];
      i++;
    }
  }
  return out;
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("toMars");
  const [input, setInput] = useState("我是一个喜欢写代码的人");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "toMars" ? toMars(input) : toNormal(input);
  }, [input, mode]);

  const swap = () => {
    setMode((m) => (m === "toMars" ? "toNormal" : "toMars"));
    setInput(output);
  };

  return (
    <ToolPageShell title="火星文翻译器" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => setMode("toMars")}
              className={`h-[36px] rounded-[8px] px-[16px] text-[14px] font-medium transition-colors ${
                mode === "toMars"
                  ? "bg-[#136CE9] text-white"
                  : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
              }`}
            >
              普通话 → 火星文
            </button>
            <button
              type="button"
              onClick={() => setMode("toNormal")}
              className={`h-[36px] rounded-[8px] px-[16px] text-[14px] font-medium transition-colors ${
                mode === "toNormal"
                  ? "bg-[#136CE9] text-white"
                  : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
              }`}
            >
              火星文 → 普通话
            </button>
            <div className="ml-auto">
              <ToolButton variant="ghost" onClick={swap}>
                交换 ⇄
              </ToolButton>
            </div>
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
          <ToolCard>
            <div className="mb-[6px] flex items-center justify-between">
              <ToolLabel>输入</ToolLabel>
              <ToolButton variant="ghost" onClick={() => setInput("")}>
                清空
              </ToolButton>
            </div>
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder={mode === "toMars" ? "输入普通文字" : "输入火星文"}
              rows={8}
            />
          </ToolCard>

          <ToolCard>
            <div className="mb-[6px] flex items-center justify-between">
              <ToolLabel>输出</ToolLabel>
              <CopyButton text={output} label="复制结果" />
            </div>
            <ToolTextarea
              value={output}
              onChange={() => {}}
              rows={8}
              className="bg-[#F6F7FA]"
            />
          </ToolCard>
        </div>

        <p className="text-[13px] text-[#8F8F8F]">
          提示：火星文转换是近似还原，反向翻译可能无法完全还原原始文本。
        </p>
      </div>
    </ToolPageShell>
  );
}
