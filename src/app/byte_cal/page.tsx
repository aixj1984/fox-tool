"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type Unit = "bit" | "B" | "KB" | "MB" | "GB" | "TB" | "PB";

const UNITS: Unit[] = ["bit", "B", "KB", "MB", "GB", "TB", "PB"];

const UNIT_LABEL: Record<Unit, string> = {
  bit: "比特 (bit)",
  B: "字节 (B)",
  KB: "千字节 (KB)",
  MB: "兆字节 (MB)",
  GB: "吉字节 (GB)",
  TB: "太字节 (TB)",
  PB: "拍字节 (PB)",
};

// Index into the units array — used to compute the exponent distance.
const UNIT_INDEX: Record<Unit, number> = {
  bit: 0,
  B: 1,
  KB: 2,
  MB: 3,
  GB: 4,
  TB: 5,
  PB: 6,
};

function convertBits(value: number, from: Unit, to: Unit, base: 1000 | 1024): number {
  // 1 Byte = 8 bits. bit and B are in a fixed 8:1 ratio regardless of base.
  // Convert input value to bits first.
  const fromIdx = UNIT_INDEX[from];
  const toIdx = UNIT_INDEX[to];
  let bits: number;
  if (from === "bit") {
    bits = value;
  } else {
    // B is base^0 relative to bytes; KB = base^1 bytes, etc.
    const byteExponent = fromIdx - 1; // B -> 0, KB -> 1, ...
    const bytes = value * Math.pow(base, byteExponent);
    bits = bytes * 8;
  }
  if (to === "bit") return bits;
  const byteExponent = toIdx - 1;
  return bits / 8 / Math.pow(base, byteExponent);
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) return n.toExponential(6);
  if (abs >= 1) {
    // up to 6 significant digits, trim trailing zeros
    return parseFloat(n.toPrecision(8)).toString();
  }
  return parseFloat(n.toPrecision(8)).toString();
}

export default function Page() {
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState<Unit>("MB");
  const [base, setBase] = useState<1000 | 1024>(1024);

  const numeric = useMemo(() => {
    const n = Number(value);
    return value.trim() === "" || isNaN(n) ? null : n;
  }, [value]);

  const results = useMemo(() => {
    if (numeric === null) return null;
    return UNITS.map((u) => ({
      unit: u,
      label: UNIT_LABEL[u],
      value: convertBits(numeric, unit, u, base),
    }));
  }, [numeric, unit, base]);

  return (
    <ToolPageShell
      title="字节数换算"
      description="字节数换算工具可以帮助您在不同的数据单位之间进行转换。通过这款工具，您可以轻松将字节（Byte）、千字节（KB）、兆字节（MB）、吉字节（GB）、太字节（TB）等单位进行相互换算"
    >
      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-[360px_1fr]">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>输入数值</ToolLabel>
            <ToolInput
              value={value}
              onChange={setValue}
              placeholder="请输入数值，例如 1024"
              type="number"
              className="w-full"
            />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>选择单位</ToolLabel>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABEL[u]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <ToolLabel>换算进制</ToolLabel>
            <div className="flex gap-[10px]">
              <button
                type="button"
                onClick={() => setBase(1024)}
                className={`flex-1 rounded-[8px] border px-[12px] py-[10px] text-[14px] ${
                  base === 1024
                    ? "border-[#136CE9] bg-[#E8F1FE] text-[#136CE9]"
                    : "border-[#E5E7EB] bg-white text-[#242424]"
                }`}
              >
                二进制 (1024)
              </button>
              <button
                type="button"
                onClick={() => setBase(1000)}
                className={`flex-1 rounded-[8px] border px-[12px] py-[10px] text-[14px] ${
                  base === 1000
                    ? "border-[#136CE9] bg-[#E8F1FE] text-[#136CE9]"
                    : "border-[#E5E7EB] bg-white text-[#242424]"
                }`}
              >
                十进制 (1000)
              </button>
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <ToolLabel>换算结果</ToolLabel>
          {results ? (
            <div className="flex flex-col gap-[10px]">
              {results.map((r) => (
                <div
                  key={r.unit}
                  className={`flex items-center gap-[12px] rounded-[8px] border px-[12px] py-[10px] ${
                    r.unit === unit
                      ? "border-[#136CE9] bg-[#E8F1FE]"
                      : "border-[#F6F7FA] bg-[#F9FAFB]"
                  }`}
                >
                  <span className="w-[120px] shrink-0 text-[13px] text-[#8F8F8F]">
                    {r.label}
                  </span>
                  <span className="min-w-0 flex-1 break-all font-mono text-[15px] text-[#242424]">
                    {formatNumber(r.value)}
                  </span>
                  <CopyButton text={formatNumber(r.value)} label="复制" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[14px] text-[#8F8F8F]">
              请输入有效数值
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
