"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolTextarea,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

interface JsonSummary {
  valid: boolean;
  error?: string;
  errorLine?: number;
  errorCol?: number;
  errorPos?: number;
  summary?: {
    type: string;
    keys?: number;
    length?: number;
    nested?: string;
  };
}

function locatePosition(text: string, pos: number): { line: number; col: number } {
  let line = 1;
  let col = 1;
  const end = Math.min(pos, text.length);
  for (let i = 0; i < end; i++) {
    if (text[i] === "\n") {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }
  return { line, col };
}

function describeType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function describeStructure(value: unknown, depth = 0): string {
  if (depth > 3) return "…";
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[${value.length} 项: ${value.slice(0, 3).map((v) => describeType(v)).join(", ")}${value.length > 3 ? " …" : ""}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return `{${entries.length} 键: ${entries.slice(0, 3).map(([k]) => k).join(", ")}${entries.length > 3 ? " …" : ""}}`;
  }
  return String(value).length > 20 ? `${String(value).slice(0, 20)}…` : String(value);
}

function validate(raw: string): JsonSummary {
  const trimmed = raw.trim();
  if (trimmed === "") return { valid: false, error: "请输入需要校验的 JSON 文本。" };
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return {
      valid: true,
      summary: {
        type: describeType(parsed),
        keys:
          parsed !== null && typeof parsed === "object"
            ? Array.isArray(parsed)
              ? parsed.length
              : Object.keys(parsed as Record<string, unknown>).length
            : undefined,
        length: typeof parsed === "string" ? parsed.length : undefined,
        nested: describeStructure(parsed),
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const posMatch = msg.match(/position\s+(\d+)/i);
    let errorPos: number | undefined;
    let errorLine: number | undefined;
    let errorCol: number | undefined;
    if (posMatch) {
      errorPos = Number(posMatch[1]);
      const { line, col } = locatePosition(raw, errorPos);
      errorLine = line;
      errorCol = col;
    }
    return { valid: false, error: msg, errorLine, errorCol, errorPos };
  }
}

export default function Page() {
  const [input, setInput] = useState("");

  const result = useMemo(() => validate(input), [input]);

  return (
    <ToolPageShell
      title="JSON校验"
      description="JSON检验是一款免费的、高效的Json检验工具，适合所有JavaScript开发人员使用，旨在通过实时监测和分析Json文件来诊断和排除潜在的JavaScript错误"
    >
      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>输入 JSON</ToolLabel>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder='粘贴或输入 JSON 文本以实时校验...'
            rows={14}
          />
        </ToolCard>

        <ToolCard>
          <ToolLabel>校验结果</ToolLabel>
          {input.trim() === "" ? (
            <div className="flex h-[260px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[14px] text-[#8F8F8F]">
              等待输入…
            </div>
          ) : result.valid ? (
            <div className="flex flex-col gap-[14px]">
              <div className="flex items-center gap-[8px] rounded-[8px] bg-[#E8F8EE] px-[16px] py-[12px] text-[15px] font-medium text-[#1A8243]">
                <span>✓</span>
                <span>JSON 格式有效</span>
              </div>
              {result.summary ? (
                <div className="rounded-[8px] border border-[#F6F7FA] bg-[#F9FAFB] p-[16px]">
                  <p className="mb-[8px] text-[14px] font-medium text-[#242424]">结构概要</p>
                  <dl className="grid grid-cols-2 gap-y-[8px] text-[14px]">
                    <dt className="text-[#8F8F8F]">根类型</dt>
                    <dd className="text-[#242424]">{result.summary.type}</dd>
                    {result.summary.keys !== undefined ? (
                      <>
                        <dt className="text-[#8F8F8F]">{result.summary.type === "array" ? "元素数" : "键数"}</dt>
                        <dd className="text-[#242424]">{result.summary.keys}</dd>
                      </>
                    ) : null}
                    {result.summary.length !== undefined ? (
                      <>
                        <dt className="text-[#8F8F8F]">字符串长度</dt>
                        <dd className="text-[#242424]">{result.summary.length}</dd>
                      </>
                    ) : null}
                    <dt className="text-[#8F8F8F]">结构</dt>
                    <dd className="break-all text-[#242424]">{result.summary.nested}</dd>
                  </dl>
                </div>
              ) : null}
              <CopyButton text={JSON.stringify(JSON.parse(input), null, 2)} label="复制格式化结果" />
            </div>
          ) : (
            <div className="flex flex-col gap-[14px]">
              <div className="flex items-center gap-[8px] rounded-[8px] bg-[#FEECEC] px-[16px] py-[12px] text-[15px] font-medium text-[#E5484D]">
                <span>✗</span>
                <span>JSON 格式有误</span>
              </div>
              <div className="rounded-[8px] border border-[#F6F7FA] bg-[#F9FAFB] p-[16px]">
                <p className="mb-[6px] text-[14px] font-medium text-[#242424]">错误信息</p>
                <p className="break-all text-[14px] text-[#E5484D]">{result.error}</p>
                {result.errorLine !== undefined && result.errorCol !== undefined ? (
                  <p className="mt-[8px] text-[14px] text-[#8F8F8F]">
                    位置：第 {result.errorLine} 行，第 {result.errorCol} 列
                    {result.errorPos !== undefined ? `（字符索引 ${result.errorPos}）` : ""}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
