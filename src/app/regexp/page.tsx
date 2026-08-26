"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  ToolTextarea,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "正则表达式是一款编程语言。它提供了大量的函数、规则，用于解决编程中的常见问题，该功能可以通过突出显示匹配项并将其合并为一个字符串的功能，帮助用户快速定位和修改代码";

type FlagKey = "g" | "i" | "m" | "s" | "u" | "y";

const ALL_FLAGS: { key: FlagKey; label: string; desc: string }[] = [
  { key: "g", label: "g", desc: "全局匹配" },
  { key: "i", label: "i", desc: "忽略大小写" },
  { key: "m", label: "m", desc: "多行模式" },
  { key: "s", label: "s", desc: "让 . 匹配换行" },
  { key: "u", label: "u", desc: "Unicode" },
  { key: "y", label: "y", desc: "粘连匹配" },
];

type MatchInfo = {
  value: string;
  index: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string>;
};

export default function Page() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Set<FlagKey>>(new Set(["g"]));
  const [text, setText] = useState("");

  const flagStr = useMemo(
    () => ALL_FLAGS.filter((f) => flags.has(f.key)).map((f) => f.key).join(""),
    [flags],
  );

  const result = useMemo(() => {
    if (!pattern) {
      return { ok: true as const, matches: [] as MatchInfo[], highlights: [] as React.ReactNode[] };
    }
    let re: RegExp;
    try {
      re = new RegExp(pattern, flagStr);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false as const, error: msg };
    }

    const matches: MatchInfo[] = [];
    // Always run a global-style scan by cloning with 'g' so we can find all
    // matches regardless of the user's 'g' choice (for highlighting). We use a
    // separate regex instance to avoid mutating the user's lastIndex semantics.
    const scanFlags = (flagStr.includes("g") ? flagStr : flagStr + "g");
    let scanRe: RegExp;
    try {
      scanRe = new RegExp(pattern, scanFlags);
    } catch {
      return { ok: false as const, error: "无法构造扫描正则" };
    }
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = scanRe.exec(text)) !== null) {
      matches.push({
        value: m[0],
        index: m.index,
        groups: m.slice(1),
        namedGroups: (m.groups as Record<string, string> | undefined) ?? {},
      });
      if (m[0] === "") scanRe.lastIndex += 1; // avoid zero-width infinite loop
      guard += 1;
      if (guard > 50000) break;
    }

    // Build highlight view: split text by match indices.
    const highlights: React.ReactNode[] = [];
    let last = 0;
    matches.forEach((mt, i) => {
      if (mt.index > last) {
        highlights.push(<span key={`t-${i}`}>{text.slice(last, mt.index)}</span>);
      }
      highlights.push(
        <mark
          key={`m-${i}`}
          className="rounded-[2px] bg-[#fde68a] px-[1px] text-[#92400e]"
        >
          {mt.value}
        </mark>,
      );
      last = mt.index + mt.value.length;
    });
    if (last < text.length) {
      highlights.push(<span key="tail">{text.slice(last)}</span>);
    }

    return { ok: true as const, matches, highlights };
  }, [pattern, flagStr, text]);

  const toggleFlag = (k: FlagKey) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  return (
    <ToolPageShell title="正则校验" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>正则表达式</ToolLabel>
          <div className="flex flex-wrap items-center gap-[8px]">
            <span className="font-mono text-[18px] text-[#8F8F8F]">/</span>
            <ToolInput
              value={pattern}
              onChange={setPattern}
              placeholder="例如 \\d+ 或 [a-zA-Z]+"
              className="w-[420px] font-mono"
            />
            <span className="font-mono text-[18px] text-[#8F8F8F]">/</span>
            <span className="font-mono text-[14px] text-[#136CE9]">{flagStr}</span>
          </div>

          <div className="mt-[12px] flex flex-wrap gap-[8px]">
            {ALL_FLAGS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => toggleFlag(f.key)}
                title={f.desc}
                className={`flex items-center gap-[4px] rounded-[6px] border px-[10px] py-[4px] text-[13px] transition-colors ${
                  flags.has(f.key)
                    ? "border-[#136CE9] bg-[#EEF3FE] text-[#136CE9]"
                    : "border-[#E5E7EB] text-[#242424] hover:bg-[#F6F7FA]"
                }`}
              >
                <span className="font-mono font-semibold">{f.label}</span>
                <span className="text-[12px] text-[#8F8F8F]">{f.desc}</span>
              </button>
            ))}
          </div>
        </ToolCard>

        <ToolCard>
          <ToolLabel>测试文本</ToolLabel>
          <ToolTextarea
            value={text}
            onChange={setText}
            placeholder="输入要匹配的文本……"
            rows={8}
          />
        </ToolCard>

        <ToolCard>
          <div className="mb-[12px] flex items-center justify-between">
            <ToolLabel>匹配结果</ToolLabel>
            {result.ok ? (
              <span className="text-[13px] text-[#8F8F8F]">
                共 {result.matches.length} 处匹配
              </span>
            ) : null}
          </div>
          {!result.ok ? (
            <p className="text-[13px] text-[#E5484D]">
              正则表达式错误：{result.error}
            </p>
          ) : (
            <>
              <div className="min-h-[60px] rounded-[8px] border border-[#F6F7FA] bg-[#FAFBFC] p-[12px]">
                {text.length === 0 ? (
                  <p className="text-[13px] text-[#8F8F8F]">输入测试文本后高亮显示匹配项。</p>
                ) : result.matches.length === 0 ? (
                  <p className="text-[13px] text-[#8F8F8F]">无匹配项。</p>
                ) : (
                  <div className="whitespace-pre-wrap break-words font-mono text-[14px] leading-[22px] text-[#242424]">
                    {result.highlights}
                  </div>
                )}
              </div>
              {result.matches.length > 0 ? (
                <div className="mt-[12px]">
                  <div className="mb-[6px] text-[13px] text-[#8F8F8F]">
                    匹配明细
                  </div>
                  <div className="max-h-[260px] overflow-auto rounded-[8px] border border-[#F6F7FA]">
                    <table className="w-full text-[13px]">
                      <thead className="sticky top-0 bg-[#F6F7FA] text-left text-[#8F8F8F]">
                        <tr>
                          <th className="px-[10px] py-[6px] font-medium">#</th>
                          <th className="px-[10px] py-[6px] font-medium">位置</th>
                          <th className="px-[10px] py-[6px] font-medium">匹配</th>
                          <th className="px-[10px] py-[6px] font-medium">分组</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.matches.map((mt, i) => (
                          <tr key={i} className="border-t border-[#F6F7FA]">
                            <td className="px-[10px] py-[6px] text-[#8F8F8F]">{i + 1}</td>
                            <td className="px-[10px] py-[6px] font-mono text-[#8F8F8F]">
                              {mt.index}
                            </td>
                            <td className="px-[10px] py-[6px] font-mono text-[#92400e]">
                              {mt.value === "" ? "<空>" : mt.value}
                            </td>
                            <td className="px-[10px] py-[6px] font-mono text-[#242424]">
                              {mt.groups.length === 0
                                ? "—"
                                : mt.groups.map((g, gi) =>
                                    g === undefined ? "?" : g === "" ? "()" : g,
                                  ).join(" | ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
