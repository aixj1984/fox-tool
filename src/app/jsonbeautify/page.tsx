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

type Indent = 2 | 4 | 0;

function beautify(raw: string, indent: number): { ok: true; out: string } | { ok: false; err: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, err: "请输入需要格式化的 JSON 文本。" };
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (indent === 0) {
      return { ok: true, out: JSON.stringify(parsed) };
    }
    return { ok: true, out: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    return { ok: false, err: e instanceof Error ? e.message : String(e) };
  }
}

export default function Page() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<Indent>(2);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleFormat = (nextIndent: Indent) => {
    setIndent(nextIndent);
    const res = beautify(input, nextIndent);
    if (res.ok) {
      setOutput(res.out);
      setError("");
    } else {
      setOutput("");
      setError(res.err);
    }
  };

  const live = useMemo(() => beautify(input, indent), [input, indent]);

  const shown = live.ok ? live.out : "";

  return (
    <ToolPageShell
      title="JSON格式化"
      description="JSON格式化是一款实用的在线工具，专为将JSON数据进行格式化和美化而设计。通过这款工具，您可以轻松将杂乱无章的JSON数据转换为结构清晰、易于阅读的格式，帮助您更好地进行数据分析、调试和开发工作。"
    >
      <div className="mb-[16px] flex flex-wrap items-center gap-[10px]">
        <ToolButton onClick={() => handleFormat(2)}>缩进 2 空格</ToolButton>
        <ToolButton onClick={() => handleFormat(4)}>缩进 4 空格</ToolButton>
        <ToolButton onClick={() => handleFormat(0)} variant="ghost">
          压缩 (Minify)
        </ToolButton>
        <button
          type="button"
          onClick={() => {
            setInput("");
            setOutput("");
            setError("");
          }}
          className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[8px] bg-[#F6F7FA] px-[20px] text-[14px] font-medium text-[#242424] hover:bg-[#ebedf2]"
        >
          清空
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>输入 JSON</ToolLabel>
          <ToolTextarea
            value={input}
            onChange={(v) => {
              setInput(v);
              setOutput("");
              setError("");
            }}
            placeholder='{"name":"FoxHelper","tools":["md5","json"],"version":1}'
            rows={14}
          />
          {error ? (
            <p className="mt-[10px] text-[14px] text-[#E5484D]">{error}</p>
          ) : (
            <p className="mt-[10px] text-[14px] text-[#8F8F8F]">
              输入 JSON 后点击上方按钮进行格式化或压缩。
            </p>
          )}
        </ToolCard>

        <ToolCard>
          <div className="mb-[6px] flex items-center justify-between">
            <ToolLabel>格式化结果</ToolLabel>
            <CopyButton text={shown} label="复制结果" />
          </div>
          <ToolTextarea
            value={output || shown}
            onChange={() => undefined}
            placeholder="格式化后的 JSON 将显示在这里"
            rows={14}
            className="bg-[#F9FAFB]"
          />
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
