"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type Base = 2 | 8 | 10 | 16;

const BASES: { value: Base; label: string }[] = [
  { value: 2, label: "二进制 (Base 2)" },
  { value: 8, label: "八进制 (Base 8)" },
  { value: 10, label: "十进制 (Base 10)" },
  { value: 16, label: "十六进制 (Base 16)" },
];

function parseBigInt(raw: string, base: Base): bigint | null {
  const s = raw.trim().toLowerCase();
  if (s === "") return null;
  const sign: bigint = s.startsWith("-") ? BigInt(-1) : BigInt(1);
  const digits = s.startsWith("-") ? s.slice(1) : s;
  if (digits === "") return null;
  const digitSet =
    base === 2 ? /^[01]+$/ : base === 8 ? /^[0-7]+$/ : base === 10 ? /^[0-9]+$/ : /^[0-9a-f]+$/;
  if (!digitSet.test(digits)) return null;
  let value = BigInt(0);
  for (const ch of digits) {
    const code = ch.charCodeAt(0);
    let d: number;
    if (code >= 48 && code <= 57) d = code - 48;
    else d = code - 87; // a-f
    if (d >= base) return null;
    value = value * BigInt(base) + BigInt(d);
  }
  return sign * value;
}

function bigIntToString(value: bigint, base: Base): string {
  if (value === BigInt(0)) return "0";
  const negative = value < BigInt(0);
  let n = negative ? -value : value;
  const bigBase = BigInt(base);
  const digitChars = "0123456789abcdef";
  let out = "";
  while (n > BigInt(0)) {
    const rem = n % bigBase;
    out = digitChars[Number(rem)] + out;
    n = n / bigBase;
  }
  return (negative ? "-" : "") + out;
}

export default function Page() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<Base>(10);

  const { decimal, error } = useMemo(() => {
    if (input.trim() === "") return { decimal: null as bigint | null, error: "" };
    const v = parseBigInt(input, fromBase);
    if (v === null) return { decimal: null, error: "输入与所选进制不匹配，请检查后重试。" };
    return { decimal: v, error: "" };
  }, [input, fromBase]);

  const results = useMemo(() => {
    if (decimal === null) return { b2: "", b8: "", b10: "", b16: "" };
    return {
      b2: bigIntToString(decimal, 2),
      b8: bigIntToString(decimal, 8),
      b10: bigIntToString(decimal, 10),
      b16: bigIntToString(decimal, 16).toUpperCase(),
    };
  }, [decimal]);

  const rows = [
    { label: "二进制 (BIN)", value: results.b2 },
    { label: "八进制 (OCT)", value: results.b8 },
    { label: "十进制 (DEC)", value: results.b10 },
    { label: "十六进制 (HEX)", value: results.b16 },
  ];

  return (
    <ToolPageShell
      title="进制转换"
      description="进制转换是一款实用的在线工具，专为将数字在不同进制之间进行转换而设计。通过这款工具，您可以轻松将数字在二进制、八进制、十进制和十六进制等进制之间进行转换，满足各种编程、数学和工程需求。"
    >
      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>输入数字</ToolLabel>
            <ToolInput
              value={input}
              onChange={setInput}
              placeholder={`请输入数字，例如 ${fromBase === 16 ? "FF" : fromBase === 2 ? "1010" : fromBase === 8 ? "17" : "255"}`}
              className="w-full font-mono"
            />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>选择输入进制</ToolLabel>
            <select
              value={fromBase}
              onChange={(e) => setFromBase(Number(e.target.value) as Base)}
              className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              {BASES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          {error ? (
            <p className="text-[14px] text-[#E5484D]">{error}</p>
          ) : (
            <p className="text-[14px] text-[#8F8F8F]">
              支持大整数（BigInt），实时显示四种进制结果。
            </p>
          )}
        </ToolCard>

        <ToolCard>
          <ToolLabel>转换结果</ToolLabel>
          <div className="flex flex-col gap-[14px]">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center gap-[12px] rounded-[8px] border border-[#F6F7FA] bg-[#F9FAFB] px-[12px] py-[10px]"
              >
                <span className="w-[110px] shrink-0 text-[13px] text-[#8F8F8F]">
                  {r.label}
                </span>
                <span className="min-w-0 flex-1 break-all font-mono text-[15px] text-[#242424]">
                  {r.value || "—"}
                </span>
                <CopyButton text={r.value} label="复制" />
              </div>
            ))}
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
