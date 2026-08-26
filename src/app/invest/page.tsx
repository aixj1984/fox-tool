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
  "通过这款工具，您可以轻松输入投资金额、投资期限、年化收益率等参数，快速计算出投资的总收益和年化收益率。";

type Mode = "lump" | "dca" | "compound";

function fmtMoney(n: number): string {
  return n.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Page() {
  const [principal, setPrincipal] = useState("100000");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("8");
  const [mode, setMode] = useState<Mode>("lump");
  const [monthly, setMonthly] = useState("2000");
  const [compoundFreq, setCompoundFreq] = useState("12");

  const result = useMemo(() => {
    const P = parseFloat(principal);
    const Y = parseInt(years, 10);
    const R = parseFloat(rate);
    if (!P || !Y || !R || P <= 0 || Y <= 0 || R <= 0) return null;
    const annualRate = R / 100;
    const n = Y;

    const rows: { year: number; start: number; invested: number; end: number; profit: number }[] = [];

    if (mode === "lump") {
      let balance = P;
      const invested = P;
      rows.push({ year: 0, start: 0, invested, end: balance, profit: 0 });
      for (let y = 1; y <= n; y++) {
        const start = balance;
        balance = balance * (1 + annualRate);
        rows.push({ year: y, start, invested, end: balance, profit: balance - invested });
      }
      return {
        finalAmount: rows[rows.length - 1].end,
        totalInvested: invested,
        totalProfit: rows[rows.length - 1].end - invested,
        rows,
      };
    }

    if (mode === "compound") {
      const freq = Math.max(1, parseInt(compoundFreq, 10) || 12);
      const r = annualRate / freq;
      const periods = n * freq;
      const finalAmount = P * Math.pow(1 + r, periods);
      // Year-by-year tracking
      let balance = P;
      rows.push({ year: 0, start: 0, invested: P, end: balance, profit: 0 });
      for (let y = 1; y <= n; y++) {
        const start = balance;
        balance = balance * Math.pow(1 + r, freq);
        rows.push({ year: y, start, invested: P, end: balance, profit: balance - P });
      }
      return {
        finalAmount,
        totalInvested: P,
        totalProfit: finalAmount - P,
        rows,
      };
    }

    // dca — monthly fixed investment
    const M = parseFloat(monthly);
    if (!M || M <= 0) return null;
    const monthlyRate = annualRate / 12;
    const totalMonths = n * 12;
    let balance = 0;
    let invested = 0;
    rows.push({ year: 0, start: 0, invested: 0, end: 0, profit: 0 });
    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + M;
      invested += M;
      if (m % 12 === 0) {
        rows.push({ year: m / 12, start: 0, invested, end: balance, profit: balance - invested });
      }
    }
    return {
      finalAmount: balance,
      totalInvested: invested,
      totalProfit: balance - invested,
      rows,
    };
  }, [principal, years, rate, mode, monthly, compoundFreq]);

  return (
    <ToolPageShell title="投资收益计算" description={DESCRIPTION}>
      <div className="grid gap-[20px] lg:grid-cols-[360px_1fr]">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>{mode === "dca" ? "每月定投金额（元）" : "本金（元）"}</ToolLabel>
            <ToolInput
              type="number"
              value={mode === "dca" ? monthly : principal}
              onChange={mode === "dca" ? setMonthly : setPrincipal}
              placeholder="例如 100000"
            />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>投资期限（年）</ToolLabel>
            <ToolInput type="number" value={years} onChange={setYears} placeholder="例如 10" />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>年化收益率（%）</ToolLabel>
            <ToolInput type="number" value={rate} onChange={setRate} placeholder="例如 8" />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>投资方式</ToolLabel>
            <div className="grid grid-cols-3 gap-[8px]">
              {(
                [
                  ["lump", "一次性投入"],
                  ["dca", "按月定投"],
                  ["compound", "复利（多频次）"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setMode(v)}
                  className={`h-[40px] rounded-[8px] text-[13px] font-medium transition-colors ${
                    mode === v
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {mode === "compound" ? (
            <div className="mb-[20px]">
              <ToolLabel>每年复利次数</ToolLabel>
              <ToolInput
                type="number"
                value={compoundFreq}
                onChange={setCompoundFreq}
                placeholder="例如 12（月复利）/ 4（季）/ 1（年）"
              />
            </div>
          ) : null}
        </ToolCard>

        <ToolCard>
          {result ? (
            <div>
              <div className="grid grid-cols-3 gap-[12px]">
                <Stat label="最终金额" value={`¥${fmtMoney(result.finalAmount)}`} />
                <Stat label="累计投入" value={`¥${fmtMoney(result.totalInvested)}`} />
                <Stat
                  label="总收益"
                  value={`¥${fmtMoney(result.totalProfit)}`}
                  highlight
                />
              </div>
              <div className="mt-[12px] text-[13px] text-[#8F8F8F]">
                收益率：
                <span className="font-semibold text-[#16A34A]">
                  {result.totalInvested > 0
                    ? ((result.totalProfit / result.totalInvested) * 100).toFixed(2)
                    : "0"}
                  %
                </span>
              </div>

              <div className="mt-[20px] mb-[8px] text-[15px] font-semibold text-[#242424]">
                逐年收益
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-left text-[#8F8F8F]">
                      <th className="py-[8px] pr-[12px] font-medium">年份</th>
                      <th className="py-[8px] pr-[12px] font-medium">期初金额</th>
                      <th className="py-[8px] pr-[12px] font-medium">累计投入</th>
                      <th className="py-[8px] pr-[12px] font-medium">期末金额</th>
                      <th className="py-[8px] font-medium">累计收益</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.year} className="border-b border-[#F2F3F5] text-[#242424]">
                        <td className="py-[8px] pr-[12px]">{row.year === 0 ? "起点" : `第${row.year}年`}</td>
                        <td className="py-[8px] pr-[12px]">¥{fmtMoney(row.start)}</td>
                        <td className="py-[8px] pr-[12px]">¥{fmtMoney(row.invested)}</td>
                        <td className="py-[8px] pr-[12px] font-medium">¥{fmtMoney(row.end)}</td>
                        <td className="py-[8px] text-[#16A34A]">¥{fmtMoney(row.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-[12px]">
                <CopyButton
                  text={`最终金额：¥${fmtMoney(result.finalAmount)}\n累计投入：¥${fmtMoney(result.totalInvested)}\n总收益：¥${fmtMoney(result.totalProfit)}`}
                  label="复制结果"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-[#8F8F8F]">
              请输入有效的投资参数
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[8px] p-[14px] ${
        highlight ? "bg-[#DCFCE7]" : "bg-[#F6F7FA]"
      }`}
    >
      <div className="text-[12px] text-[#8F8F8F]">{label}</div>
      <div
        className={`mt-[4px] text-[18px] font-semibold ${
          highlight ? "text-[#16A34A]" : "text-[#242424]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
