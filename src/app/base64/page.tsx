"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolTextarea,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type Mode = "encode" | "decode";

// UTF-8 safe Base64 encode.
function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// UTF-8 safe Base64 decode.
function base64Decode(text: string): { ok: true; out: string } | { ok: false; err: string } {
  try {
    const bin = atob(text.replace(/\s+/g, ""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { ok: true, out: new TextDecoder().decode(bytes) };
  } catch (e) {
    return {
      ok: false,
      err: "解码失败：" + (e instanceof Error ? e.message : "输入不是有效的 Base64"),
    };
  }
}

const DESCRIPTION =
  "Base64编码是一种常用的数据编码方式，能够将二进制数据转换为文本格式，便于在网络传输和数据存储中使用。通过这款工具，您可以轻松进行Base64编码和解码，满足各种编程、数据处理和网络传输需求。";

export default function Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input) return { out: "", err: "" };
    if (mode === "encode") {
      return { out: base64Encode(input), err: "" };
    }
    const r = base64Decode(input);
    return r.ok ? { out: r.out, err: "" } : { out: "", err: r.err };
  }, [input, mode]);

  return (
    <ToolPageShell title="base64编码" description={DESCRIPTION}>
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
          编码（文本 → Base64）
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
          解码（Base64 → 文本）
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
            {mode === "encode" ? "输入文本" : "输入 Base64"}
          </ToolLabel>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={
              mode === "encode"
                ? "请输入需要编码的文本，支持中文等多字节字符"
                : "请输入需要解码的 Base64 字符串"
            }
            rows={12}
          />
        </ToolCard>

        <ToolCard>
          <div className="mb-[6px] flex items-center justify-between">
            <ToolLabel>
              {mode === "encode" ? "Base64 编码结果" : "解码文本结果"}
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
              支持 UTF-8 多字节字符的 Base64 编解码。
            </p>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
