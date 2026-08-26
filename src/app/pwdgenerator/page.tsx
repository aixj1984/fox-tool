"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "随机密码生成专为生成强大且安全的随机密码而设计。通过这款工具，您可以根据指定的长度和字符类型，快速生成高强度的随机密码，帮助您保护账户安全，防止密码被破解。";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>/?";
const AMBIGUOUS = new Set("Il1O0o`'\"|~");

interface Options {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

function buildPool(o: Options): string {
  let pool = "";
  if (o.upper) pool += UPPER;
  if (o.lower) pool += LOWER;
  if (o.digits) pool += DIGITS;
  if (o.symbols) pool += SYMBOLS;
  if (o.excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.has(c)).join("");
  }
  return pool;
}

function secureInt(maxExclusive: number): number {
  // Uniform random in [0, maxExclusive) using crypto.getRandomValues.
  const max = 0x100000000;
  const limit = max - (max % maxExclusive);
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % maxExclusive;
  }
}

function generate(o: Options): string {
  const pool = buildPool(o);
  if (pool.length === 0) return "";
  const chars: string[] = [];
  for (let i = 0; i < o.length; i++) {
    chars.push(pool[secureInt(pool.length)]);
  }
  return chars.join("");
}

function strength(pwd: string, o: Options): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "未生成", color: "#E5E7EB" };
  let charset = 0;
  if (o.upper) charset += 26;
  if (o.lower) charset += 26;
  if (o.digits) charset += 10;
  if (o.symbols) charset += SYMBOLS.length;
  if (o.excludeAmbiguous) charset -= 12; // approximate reduction
  charset = Math.max(charset, 1);
  const entropy = pwd.length * Math.log2(charset);
  if (entropy < 28) return { score: 1, label: "很弱", color: "#E5484D" };
  if (entropy < 36) return { score: 2, label: "弱", color: "#F5A623" };
  if (entropy < 60) return { score: 3, label: "中等", color: "#F5C518" };
  if (entropy < 128) return { score: 4, label: "强", color: "#3CC68A" };
  return { score: 5, label: "极强", color: "#1FA971" };
}

export default function Page() {
  const [opts, setOpts] = useState<Options>({
    length: 16,
    upper: true,
    lower: true,
    digits: true,
    symbols: false,
    excludeAmbiguous: false,
  });
  const [pwd, setPwd] = useState("");

  const regen = useCallback(() => {
    setPwd(generate(opts));
  }, [opts]);

  // Generate once on mount so the page shows a usable password immediately.
  useEffect(() => {
    setPwd(generate(opts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const st = strength(pwd, opts);

  const toggle = (key: keyof Options) => (checked: boolean) =>
    setOpts((o) => ({ ...o, [key]: checked }));

  const noCharset = !opts.upper && !opts.lower && !opts.digits && !opts.symbols;

  return (
    <ToolPageShell title="随机密码生成" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>生成的密码</ToolLabel>
          <div className="mb-[12px] flex flex-wrap items-center gap-[12px]">
            <code className="min-h-[44px] flex-1 break-all rounded-[8px] bg-[#F6F7FA] px-[14px] py-[12px] font-mono text-[20px] tracking-wide text-[#242424]">
              {pwd || "请至少选择一种字符类型"}
            </code>
            <CopyButton text={pwd} label="复制密码" />
            <ToolButton onClick={regen} disabled={noCharset}>
              重新生成
            </ToolButton>
          </div>

          {/* Strength meter */}
          <div className="flex items-center gap-[12px]">
            <span className="text-[13px] text-[#8F8F8F]">强度</span>
            <div className="flex h-[8px] flex-1 gap-[4px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: i <= st.score ? st.color : "#E5E7EB",
                  }}
                />
              ))}
            </div>
            <span className="w-[48px] text-right text-[13px] font-medium" style={{ color: st.color }}>
              {st.label}
            </span>
          </div>
        </ToolCard>

        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>密码长度：{opts.length}</ToolLabel>
            <input
              type="range"
              min={4}
              max={64}
              value={opts.length}
              onChange={(e) => setOpts((o) => ({ ...o, length: Number(e.target.value) }))}
              className="w-full accent-[#136CE9]"
            />
            <div className="flex justify-between text-[12px] text-[#8F8F8F]">
              <span>4</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          <ToolLabel>字符类型</ToolLabel>
          <div className="mb-[16px] grid grid-cols-2 gap-[12px] sm:grid-cols-4">
            <CheckRow label="大写字母 A-Z" checked={opts.upper} onChange={toggle("upper")} />
            <CheckRow label="小写字母 a-z" checked={opts.lower} onChange={toggle("lower")} />
            <CheckRow label="数字 0-9" checked={opts.digits} onChange={toggle("digits")} />
            <CheckRow label="符号 !@#$" checked={opts.symbols} onChange={toggle("symbols")} />
          </div>

          <CheckRow
            label="排除易混淆字符（Il1O0o 等）"
            checked={opts.excludeAmbiguous}
            onChange={toggle("excludeAmbiguous")}
          />

          {noCharset && (
            <p className="mt-[12px] text-[13px] text-[#E5484D]">
              请至少选择一种字符类型。
            </p>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-[8px] text-[14px] text-[#242424]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-[16px] w-[16px] accent-[#136CE9]"
      />
      <span>{label}</span>
    </label>
  );
}
