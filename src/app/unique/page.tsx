"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolTextarea,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "文本去重工具可以帮助您快速去除文本中的重复内容。通过这款工具，您可以输入或粘贴文本，工具会自动识别并删除重复的行或段落，确保文本的唯一性和整洁性。";

type Mode = "line" | "consecutive";

function dedupe(
  text: string,
  mode: Mode,
  ignoreCase: boolean,
  trimSpace: boolean,
): { output: string; removed: number } {
  if (!text) return { output: "", removed: 0 };

  if (mode === "line") {
    const lines = text.split(/\r\n|\r|\n/);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of lines) {
      const key = normalizeKey(raw, ignoreCase, trimSpace);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(trimSpace ? raw.trim() : raw);
    }
    const removed = lines.length - out.length;
    return { output: out.join("\n"), removed };
  }

  // consecutive: collapse runs of identical lines.
  const lines = text.split(/\r\n|\r|\n/);
  const out: string[] = [];
  let prevKey: string | null = null;
  for (const raw of lines) {
    const key = normalizeKey(raw, ignoreCase, trimSpace);
    if (prevKey !== null && key === prevKey) continue;
    out.push(trimSpace ? raw.trim() : raw);
    prevKey = key;
  }
  const removed = lines.length - out.length;
  return { output: out.join("\n"), removed };
}

function normalizeKey(line: string, ignoreCase: boolean, trimSpace: boolean): string {
  let k = line;
  if (trimSpace) k = k.trim();
  if (ignoreCase) k = k.toLowerCase();
  return k;
}

export default function Page() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("line");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimSpace, setTrimSpace] = useState(false);

  const result = useMemo(
    () => dedupe(text, mode, ignoreCase, trimSpace),
    [text, mode, ignoreCase, trimSpace],
  );

  return (
    <ToolPageShell title="文本去重" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolTextarea
            value={text}
            onChange={setText}
            placeholder="粘贴需要去重的文本，每行一条……"
            rows={10}
          />
          <div className="mt-[12px] flex flex-wrap items-center gap-[16px]">
            <div className="flex rounded-[8px] border border-[#E5E7EB] p-[2px]">
              {(["line", "consecutive"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-[6px] px-[12px] py-[4px] text-[13px] transition-colors ${
                    mode === m
                      ? "bg-[#136CE9] text-white"
                      : "text-[#242424] hover:bg-[#F6F7FA]"
                  }`}
                >
                  {m === "line" ? "按行去重" : "连续重复去重"}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-[6px] text-[13px] text-[#242424]">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="accent-[#136CE9]"
              />
              忽略大小写
            </label>
            <label className="flex cursor-pointer items-center gap-[6px] text-[13px] text-[#242424]">
              <input
                type="checkbox"
                checked={trimSpace}
                onChange={(e) => setTrimSpace(e.target.checked)}
                className="accent-[#136CE9]"
              />
              去首尾空格
            </label>
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
          <div className="mb-[12px] flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#242424]">
              去重结果
            </span>
            <div className="flex items-center gap-[12px]">
              <span className="text-[13px] text-[#8F8F8F]">
                已删除 {result.removed} 行
              </span>
              <CopyButton text={result.output} label="复制结果" />
            </div>
          </div>
          <textarea
            readOnly
            value={result.output}
            placeholder="去重后的文本将在此显示……"
            rows={10}
            className="w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-[#FAFBFC] p-[12px] font-mono text-[14px] leading-[22px] text-[#242424] outline-none"
          />
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
