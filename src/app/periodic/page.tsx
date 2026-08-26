"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  ELEMENTS,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  type Element,
  type ElementCategory,
} from "./element-data";

const DESCRIPTION =
  "元素周期表工具可以帮助您快速查阅和了解化学元素的详细信息，您可以轻松找到每个元素的原子序数、符号、名称、原子量、电子排布等信息。";

const ALL_CATEGORIES: ElementCategory[] = [
  "alkali-metal",
  "alkaline-earth-metal",
  "transition-metal",
  "post-transition-metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble-gas",
  "lanthanide",
  "actinide",
];

export default function PeriodicPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Element | null>(null);

  // Build main 18-col grid (rows 1-7), plus f-block rows (rows 9-10 for lanth/act).
  const grid = useMemo(() => {
    const map = new Map<string, Element>();
    for (const e of ELEMENTS) {
      map.set(`${e.row}-${e.col}`, e);
    }
    return map;
  }, []);

  const isHighlighted = (e: Element): boolean => {
    const q = query.trim().toLowerCase();
    if (q === "") return false;
    return (
      String(e.number) === q ||
      e.symbol.toLowerCase() === q ||
      e.symbol.toLowerCase().startsWith(q) ||
      e.name.toLowerCase().includes(q) ||
      e.nameEn.toLowerCase().includes(q)
    );
  };

  const isDimmed = (e: Element): boolean => {
    const q = query.trim();
    if (q === "") return false;
    return !isHighlighted(e);
  };

  const renderCell = (row: number, col: number) => {
    const e = grid.get(`${row}-${col}`);
    if (!e) {
      return (
        <div
          key={`empty-${row}-${col}`}
          style={{ gridColumn: col, gridRow: row }}
        />
      );
    }
    const dim = isDimmed(e);
    const hl = isHighlighted(e);
    return (
      <button
        key={e.number}
        type="button"
        title={`${e.name} (${e.nameEn})`}
        onClick={() => setActive(e)}
        style={{
          gridColumn: col,
          gridRow: row,
          backgroundColor: CATEGORY_COLOR[e.category],
          borderColor: hl ? "#136CE9" : "rgba(0,0,0,0.08)",
          borderWidth: hl ? 2 : 1,
          opacity: dim ? 0.35 : 1,
        }}
        className="flex h-[56px] w-[56px] cursor-pointer flex-col items-center justify-center rounded-[6px] border p-1 text-center transition-transform hover:scale-110 hover:shadow-md"
      >
        <span className="text-[10px] leading-none text-[#5A5A5A]">
          {e.number}
        </span>
        <span className="text-[16px] font-semibold leading-tight text-[#242424]">
          {e.symbol}
        </span>
        <span className="truncate text-[9px] leading-none text-[#242424]">
          {e.name}
        </span>
      </button>
    );
  };

  return (
    <ToolPageShell title="元素周期表" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="flex flex-wrap items-end justify-between gap-[12px]">
            <div>
              <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
                搜索元素
              </label>
              <ToolInput
                value={query}
                onChange={setQuery}
                placeholder="例如 Fe / 铁 / Iron / 26"
                className="w-[280px]"
              />
            </div>
            <div className="flex flex-wrap gap-[10px]">
              {ALL_CATEGORIES.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-[6px] text-[12px] text-[#5A5A5A]"
                >
                  <span
                    className="inline-block h-[14px] w-[14px] rounded-[3px]"
                    style={{ backgroundColor: CATEGORY_COLOR[c] }}
                  />
                  {CATEGORY_LABEL[c]}
                </div>
              ))}
            </div>
          </div>
        </ToolCard>

        <ToolCard className="overflow-x-auto">
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: "repeat(18, 56px)",
              gridTemplateRows: "repeat(7, 56px)",
            }}
          >
            {Array.from({ length: 7 }).map((_, r) =>
              Array.from({ length: 18 }).map((__, c) =>
                renderCell(r + 1, c + 1),
              ),
            )}
          </div>

          {/* f-block: 镧系 / 锕系 */}
          <div className="mt-[20px] flex gap-[8px]">
            <div className="flex w-[56px] shrink-0 items-center justify-center text-right text-[11px] leading-tight text-[#8F8F8F]">
              镧系<br />57-71
            </div>
            <div
              className="grid gap-[3px]"
              style={{
                gridTemplateColumns: "repeat(15, 56px)",
                gridTemplateRows: "56px",
              }}
            >
              {Array.from({ length: 15 }).map((_, idx) => {
                const col = idx + 3;
                const e = grid.get(`9-${col}`);
                if (!e) return <div key={`empty-9-${col}`} />;
                const dim = isDimmed(e);
                const hl = isHighlighted(e);
                return (
                  <button
                    key={e.number}
                    type="button"
                    onClick={() => setActive(e)}
                    style={{
                      backgroundColor: CATEGORY_COLOR[e.category],
                      borderColor: hl ? "#136CE9" : "rgba(0,0,0,0.08)",
                      borderWidth: hl ? 2 : 1,
                      opacity: dim ? 0.35 : 1,
                    }}
                    className="flex h-[56px] w-[56px] cursor-pointer flex-col items-center justify-center rounded-[6px] border p-1 text-center transition-transform hover:scale-110"
                  >
                    <span className="text-[10px] leading-none text-[#5A5A5A]">{e.number}</span>
                    <span className="text-[16px] font-semibold leading-tight text-[#242424]">{e.symbol}</span>
                    <span className="truncate text-[9px] leading-none text-[#242424]">{e.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-[8px] flex gap-[8px]">
            <div className="flex w-[56px] shrink-0 items-center justify-center text-right text-[11px] leading-tight text-[#8F8F8F]">
              锕系<br />89-103
            </div>
            <div
              className="grid gap-[3px]"
              style={{
                gridTemplateColumns: "repeat(15, 56px)",
                gridTemplateRows: "56px",
              }}
            >
              {Array.from({ length: 15 }).map((_, idx) => {
                const col = idx + 3;
                const e = grid.get(`10-${col}`);
                if (!e) return <div key={`empty-10-${col}`} />;
                const dim = isDimmed(e);
                const hl = isHighlighted(e);
                return (
                  <button
                    key={e.number}
                    type="button"
                    onClick={() => setActive(e)}
                    style={{
                      backgroundColor: CATEGORY_COLOR[e.category],
                      borderColor: hl ? "#136CE9" : "rgba(0,0,0,0.08)",
                      borderWidth: hl ? 2 : 1,
                      opacity: dim ? 0.35 : 1,
                    }}
                    className="flex h-[56px] w-[56px] cursor-pointer flex-col items-center justify-center rounded-[6px] border p-1 text-center transition-transform hover:scale-110"
                  >
                    <span className="text-[10px] leading-none text-[#5A5A5A]">{e.number}</span>
                    <span className="text-[16px] font-semibold leading-tight text-[#242424]">{e.symbol}</span>
                    <span className="truncate text-[9px] leading-none text-[#242424]">{e.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            元素详情
          </label>
          {active ? (
            <div className="mt-[12px] flex flex-col gap-[10px]">
              <div className="flex items-center gap-[16px]">
                <div
                  className="flex h-[80px] w-[80px] flex-col items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: CATEGORY_COLOR[active.category] }}
                >
                  <span className="text-[12px] text-[#5A5A5A]">{active.number}</span>
                  <span className="text-[28px] font-bold text-[#242424]">{active.symbol}</span>
                </div>
                <div>
                  <div className="text-[20px] font-semibold text-[#242424]">
                    {active.name}
                    <span className="ml-[8px] text-[14px] font-normal text-[#8F8F8F]">
                      {active.nameEn}
                    </span>
                  </div>
                  <div className="mt-[4px] text-[13px] text-[#8F8F8F]">
                    {CATEGORY_LABEL[active.category]}
                  </div>
                </div>
              </div>
              <DetailRow label="原子序数">{active.number}</DetailRow>
              <DetailRow label="元素符号">{active.symbol}</DetailRow>
              <DetailRow label="中文名称">{active.name}</DetailRow>
              <DetailRow label="英文名称">{active.nameEn}</DetailRow>
              <DetailRow label="原子量">{active.mass}</DetailRow>
              <DetailRow label="电子排布">
                <span className="font-mono">{active.electronConfig}</span>
              </DetailRow>
              <DetailRow label="类别">{CATEGORY_LABEL[active.category]}</DetailRow>
            </div>
          ) : (
            <p className="mt-[12px] text-[13px] text-[#8F8F8F]">
              点击任意元素格子查看详细信息。
            </p>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-[8px]">
      <span className="w-[90px] shrink-0 text-[14px] text-[#8F8F8F]">{label}</span>
      <div className="flex-1 text-[14px] text-[#242424]">{children}</div>
    </div>
  );
}
