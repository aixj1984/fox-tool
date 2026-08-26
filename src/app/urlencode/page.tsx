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

type Mode = "encode" | "decode";

function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

function urlDecode(text: string): { ok: true; out: string } | { ok: false; err: string } {
  try {
    return { ok: true, out: decodeURIComponent(text) };
  } catch (e) {
    return { ok: false, err: "解码失败：" + (e instanceof Error ? e.message : "输入不是有效的 URL 编码") };
  }
}

const DESCRIPTION =
  "URL编解码是一款实用的在线工具，专为将URL（统一资源定位符）进行编码和解码而设计。通过这款工具，您可以轻松将普通文本转换为URL编码形式，或将URL编码转换回普通文本，满足各种网页开发、数据传输和文本处理需求。";

export default function Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input) return { out: "", err: "" };
    if (mode === "encode") {
      return { out: urlEncode(input), err: "" };
    }
    const r = urlDecode(input);
    return r.ok ? { out: r.out, err: "" } : { out: "", err: r.err };
  }, [input, mode]);

  return (
    <ToolPageShell title="url编解码" description={DESCRIPTION}>
      <div className="mb-[16px] flex flex-wrap items-center gap-[10px]">
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={`h-[40px] cursor-pointer rounded-[8px] px-[20px] text-[14px] font-medium transition-colors ${
            mode === "encode"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          编码（文本 → URL）
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`h-[40px] cursor-pointer rounded-[8px] px-[20px] text-[14px] font-medium transition-colors ${
            mode === "decode"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          解码（URL → 文本）
        </button>
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
            {mode === "encode" ? "输入文本" : "输入 URL 编码"}
          </ToolLabel>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={
              mode === "encode"
                ? "请输入需要编码的文本，例如：https://example.com/搜索?q=你好"
                : "请输入需要解码的 URL 编码，例如：%E4%BD%A0%E5%A5%BD"
            }
            rows={12}
          />
        </ToolCard>

        <ToolCard>
          <div className="mb-[6px] flex items-center justify-between">
            <ToolLabel>
              {mode === "encode" ? "URL 编码结果" : "解码文本结果"}
            </ToolLabel>
            <CopyButton text={result.out} label="复制结果" />
          </div>
          <ToolTextarea
            value={result.out}
            onChange={() => undefined}
            placeholder="结果将显示在这里"
            rows={12}
            className="bg-[#F9FAFB]"
          />
          {result.err ? (
            <p className="mt-[10px] text-[13px] text-[#E5484D]">{result.err}</p>
          ) : (
            <p className="mt-[10px] text-[13px] text-[#8F8F8F]">
              使用 encodeURIComponent / decodeURIComponent 进行编解码。
            </p>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
