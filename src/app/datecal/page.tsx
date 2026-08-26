"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "日期计算是一款实用的在线工具，专为进行各种日期相关的计算而设计。通过这款工具，您可以轻松计算两个日期之间的天数、添加或减去特定天数、计算特定日期的星期几等。";

const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

function parseDate(s: string): number | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime();
}

function daysBetween(a: number, b: number): number {
  const MS_DAY = 24 * 60 * 60 * 1000;
  return Math.round((b - a) / MS_DAY);
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Page() {
  // Mode A: difference between two dates
  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");

  // Mode B: add/subtract days
  const [baseDate, setBaseDate] = useState("");
  const [offset, setOffset] = useState("");
  const [offsetSign, setOffsetSign] = useState<"+" | "-">("+");

  // Mode C: day of week
  const [dowDate, setDowDate] = useState("");

  const diff = useMemo(() => {
    const a = parseDate(dateA);
    const b = parseDate(dateB);
    if (a === null || b === null) return null;
    const d = daysBetween(a, b);
    return { days: Math.abs(d), sign: d >= 0 ? "后" : "前", raw: d };
  }, [dateA, dateB]);

  const offsetResult = useMemo(() => {
    const base = parseDate(baseDate);
    const n = parseInt(offset, 10);
    if (base === null || Number.isNaN(n)) return null;
    const ms = (offsetSign === "-" ? -n : n) * 24 * 60 * 60 * 1000;
    const result = new Date(base + ms);
    return fmt(result);
  }, [baseDate, offset, offsetSign]);

  const dow = useMemo(() => {
    const d = parseDate(dowDate);
    if (d === null) return null;
    return WEEKDAYS[new Date(d).getDay()];
  }, [dowDate]);

  return (
    <ToolPageShell title="日期计算" description={DESCRIPTION}>
      <div className="grid gap-[20px] md:grid-cols-3">
        {/* A: days between */}
        <ToolCard>
          <h2 className="mb-[14px] text-[16px] font-semibold text-[#242424]">
            日期相隔天数
          </h2>
          <div className="mb-[12px]">
            <ToolLabel>起始日期</ToolLabel>
            <ToolInput type="date" value={dateA} onChange={setDateA} />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>结束日期</ToolLabel>
            <ToolInput type="date" value={dateB} onChange={setDateB} />
          </div>
          {diff ? (
            <div className="rounded-[8px] bg-[#F6F7FA] p-[14px]">
              <div className="text-[12px] text-[#8F8F8F]">相隔天数</div>
              <div className="mt-[4px] text-[26px] font-bold text-[#136CE9]">
                {diff.days} 天
              </div>
              <div className="mt-[4px] text-[12px] text-[#8F8F8F]">
                （{diff.sign === "后" ? "结束日期晚于起始" : "结束日期早于起始"}）
              </div>
            </div>
          ) : (
            <div className="rounded-[8px] bg-[#F6F7FA] p-[14px] text-[13px] text-[#8F8F8F]">
              请选择两个日期
            </div>
          )}
        </ToolCard>

        {/* B: add/subtract */}
        <ToolCard>
          <h2 className="mb-[14px] text-[16px] font-semibold text-[#242424]">
            日期加减天数
          </h2>
          <div className="mb-[12px]">
            <ToolLabel>基准日期</ToolLabel>
            <ToolInput type="date" value={baseDate} onChange={setBaseDate} />
          </div>
          <div className="mb-[12px]">
            <ToolLabel>天数</ToolLabel>
            <div className="flex gap-[8px]">
              <button
                onClick={() => setOffsetSign("+")}
                className={`h-[40px] w-[48px] rounded-[8px] text-[18px] font-medium transition-colors ${
                  offsetSign === "+"
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                +
              </button>
              <button
                onClick={() => setOffsetSign("-")}
                className={`h-[40px] w-[48px] rounded-[8px] text-[18px] font-medium transition-colors ${
                  offsetSign === "-"
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                −
              </button>
              <ToolInput
                type="number"
                value={offset}
                onChange={setOffset}
                placeholder="例如 90"
                className="flex-1"
              />
            </div>
          </div>
          {offsetResult ? (
            <div className="rounded-[8px] bg-[#F6F7FA] p-[14px]">
              <div className="text-[12px] text-[#8F8F8F]">结果日期</div>
              <div className="mt-[4px] text-[22px] font-bold text-[#136CE9]">
                {offsetResult}
              </div>
              <div className="mt-[6px]">
                <CopyButton text={offsetResult} label="复制" />
              </div>
            </div>
          ) : (
            <div className="rounded-[8px] bg-[#F6F7FA] p-[14px] text-[13px] text-[#8F8F8F]">
              请选择基准日期并输入天数
            </div>
          )}
        </ToolCard>

        {/* C: day of week */}
        <ToolCard>
          <h2 className="mb-[14px] text-[16px] font-semibold text-[#242424]">
            查询星期几
          </h2>
          <div className="mb-[12px]">
            <ToolLabel>日期</ToolLabel>
            <ToolInput type="date" value={dowDate} onChange={setDowDate} />
          </div>
          {dow ? (
            <div className="rounded-[8px] bg-[#F6F7FA] p-[14px]">
              <div className="text-[12px] text-[#8F8F8F]">星期</div>
              <div className="mt-[4px] text-[26px] font-bold text-[#136CE9]">
                {dow}
              </div>
              <div className="mt-[4px] text-[12px] text-[#8F8F8F]">
                {fmt(new Date(parseDate(dowDate) ?? Date.now()))}
              </div>
            </div>
          ) : (
            <div className="rounded-[8px] bg-[#F6F7FA] p-[14px] text-[13px] text-[#8F8F8F]">
              请选择日期
            </div>
          )}
        </ToolCard>
      </div>

      <div className="mt-[16px]">
        <ToolButton
          variant="ghost"
          onClick={() => {
            const today = fmt(new Date());
            setDateA(today);
            setDateB(today);
            setBaseDate(today);
            setDowDate(today);
          }}
        >
          填入今天
        </ToolButton>
      </div>
    </ToolPageShell>
  );
}
