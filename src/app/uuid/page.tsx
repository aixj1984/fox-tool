"use client";

import { useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type Format = "lower" | "upper" | "braces";

function generateUuid(): string {
  // crypto.randomUUID is available in all modern browsers and Node 16.7+.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: RFC 4122 v4 using getRandomValues.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex: string[] = [];
  for (const b of bytes) hex.push(b.toString(16).padStart(2, "0"));
  return (
    hex.slice(0, 4).join("") + "-" +
    hex.slice(4, 6).join("") + "-" +
    hex.slice(6, 8).join("") + "-" +
    hex.slice(8, 10).join("") + "-" +
    hex.slice(10, 16).join("")
  );
}

function formatUuid(uuid: string, format: Format): string {
  switch (format) {
    case "upper":
      return uuid.toUpperCase();
    case "braces":
      return "{" + uuid + "}";
    default:
      return uuid;
  }
}

const DESCRIPTION =
  "UUID生成工具是一款免费的在线加密工具，这款工具采用了最先进的技术，提供了一种高效且安全的加密解决方案，可以帮助用户快速方便地生成自己独特的标识符，用于个人隐私和认证的目的。适合对有隐私要求的用户";

export default function Page() {
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<Format>("lower");
  const [list, setList] = useState<string[]>([]);

  const generate = () => {
    const next: string[] = [];
    for (let i = 0; i < count; i++) {
      next.push(formatUuid(generateUuid(), format));
    }
    setList(next);
  };

  const allText = list.join("\n");

  return (
    <ToolPageShell title="uuid生成" description={DESCRIPTION}>
      <ToolCard>
        <div className="flex flex-wrap items-end gap-[20px]">
          <div>
            <ToolLabel>生成数量</ToolLabel>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="h-[40px] cursor-pointer rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              {[1, 5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} 个
                </option>
              ))}
            </select>
          </div>
          <div>
            <ToolLabel>格式</ToolLabel>
            <div className="flex gap-[8px]">
              {(
                [
                  { key: "lower", label: "小写" },
                  { key: "upper", label: "大写" },
                  { key: "braces", label: "带花括号" },
                ] as { key: Format; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFormat(opt.key)}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[16px] text-[14px] font-medium transition-colors ${
                    format === opt.key
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <ToolButton onClick={generate}>生成 UUID</ToolButton>
          {list.length > 0 && (
            <CopyButton text={allText} label="复制全部" />
          )}
        </div>

        <div className="mt-[24px]">
          {list.length === 0 ? (
            <p className="text-[14px] text-[#8F8F8F]">
              点击「生成 UUID」按钮即可生成 UUID v4 标识符。
            </p>
          ) : (
            <ul className="divide-y divide-[#F0F1F4] rounded-[8px] border border-[#E5E7EB]">
              {list.map((uuid, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-[16px] py-[10px]"
                >
                  <code className="font-mono text-[14px] text-[#242424]">
                    {uuid}
                  </code>
                  <CopyButton text={uuid} label="复制" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-[16px] text-[13px] text-[#8F8F8F]">
          使用 crypto.randomUUID() 生成符合 RFC 4122 v4 标准的随机 UUID。
        </p>
      </ToolCard>
    </ToolPageShell>
  );
}
