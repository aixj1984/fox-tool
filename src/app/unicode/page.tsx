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

// Encode every character to \uXXXX (BMP) or surrogate pair \uXXXX\uXXXX (astral).
function unicodeEncode(text: string): string {
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    if (cp < 0x10000) {
      out += "\\u" + cp.toString(16).padStart(4, "0");
    } else {
      const hi = 0xd800 + ((cp - 0x10000) >> 10);
      const lo = 0xdc00 + ((cp - 0x10000) & 0x3ff);
      out +=
        "\\u" + hi.toString(16).padStart(4, "0") +
        "\\u" + lo.toString(16).padStart(4, "0");
    }
  }
  return out;
}

// Decode \uXXXX, \xNN, &#NN; and &#xHH; sequences; pass through other chars.
function unicodeDecode(text: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\" && text[i + 1] === "u") {
      const hex = text.slice(i + 2, i + 6);
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        out += String.fromCharCode(parseInt(hex, 16));
        i += 6;
        continue;
      }
    } else if (ch === "\\" && text[i + 1] === "x") {
      const hex = text.slice(i + 2, i + 4);
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        out += String.fromCharCode(parseInt(hex, 16));
        i += 4;
        continue;
      }
    } else if (ch === "&" && text[i + 1] === "#") {
      const rest = text.slice(i);
      const mHex = rest.match(/^&#x([0-9a-fA-F]+);/);
      if (mHex) {
        out += String.fromCodePoint(parseInt(mHex[1], 16));
        i += mHex[0].length;
        continue;
      }
      const mDec = rest.match(/^&#(\d+);/);
      if (mDec) {
        out += String.fromCodePoint(parseInt(mDec[1], 10));
        i += mDec[0].length;
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out;
}

const DESCRIPTION =
  "Unicode编解码是一款实用的在线工具，专为将文本进行Unicode编码和解码而设计。通过这款工具，您可以轻松将普通文本转换为Unicode编码形式，或将Unicode编码转换回普通文本，满足各种编程、数据处理和文本处理需求。";

export default function Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input) return "";
    try {
      return mode === "encode" ? unicodeEncode(input) : unicodeDecode(input);
    } catch (e) {
      return "解码失败：" + (e instanceof Error ? e.message : String(e));
    }
  }, [input, mode]);

  return (
    <ToolPageShell title="Unicode编解码" description={DESCRIPTION}>
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
          编码（文本 → Unicode）
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
          解码（Unicode → 文本）
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
            {mode === "encode" ? "输入文本" : "输入 Unicode 编码"}
          </ToolLabel>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={
              mode === "encode"
                ? "请输入需要编码的文本，例如：你好，世界"
                : "请输入需要解码的 Unicode，例如：\\u4f60\\u597d"
            }
            rows={12}
          />
          <p className="mt-[10px] text-[13px] text-[#8F8F8F]">
            支持 \\uXXXX、\\xNN、&amp;#NN; 及 &amp;#xHH; 编码格式。
          </p>
        </ToolCard>

        <ToolCard>
          <div className="mb-[6px] flex items-center justify-between">
            <ToolLabel>
              {mode === "encode" ? "Unicode 编码结果" : "解码文本结果"}
            </ToolLabel>
            <CopyButton text={output} label="复制结果" />
          </div>
          <ToolTextarea
            value={output}
            onChange={() => undefined}
            placeholder="结果将显示在这里"
            rows={12}
            className="bg-[#F9FAFB]"
          />
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
