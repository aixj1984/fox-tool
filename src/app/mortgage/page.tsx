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
  "房贷计算是一款实用的在线工具，专为帮助用户计算房屋贷款的月供、总利息和还款总额而设计。通过这款工具，您可以根据贷款金额、贷款期限、利率等参数，快速计算出每月需要偿还的金额。";

type Method = "equal-payment" | "equal-principal";

type Row = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

function fmtMoney(n: number): string {
  return n.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Page() {
  const [amount, setAmount] = useState("500000");
  const [years, setYears] = useState("30");
  const [rate, setRate] = useState("4.2");
  const [method, setMethod] = useState<Method>("equal-payment");
  const [showAll, setShowAll] = useState(false);

  const result = useMemo(() => {
    const P = parseFloat(amount);
    const Y = parseInt(years, 10);
    const R = parseFloat(rate);
    if (!P || !Y || !R || P <= 0 || Y <= 0 || R <= 0) return null;
    const n = Y * 12;
    const r = R / 100 / 12;

    const rows: Row[] = [];
    let balance = P;
    let totalInterest = 0;

    if (method === "equal-payment") {
      const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        const principal = monthly - interest;
        balance -= principal;
        totalInterest += interest;
        rows.push({
          month: i,
          payment: monthly,
          principal,
          interest,
          balance: Math.max(0, balance),
        });
      }
      const monthlyPayment = rows[0]?.payment ?? 0;
      return {
        monthlyFirst: monthlyPayment,
        monthlyLast: monthlyPayment,
        totalInterest,
        totalRepayment: monthlyPayment * n,
        rows,
      };
    }
    // equal-principal
    const monthlyPrincipal = P / n;
    let firstPayment = 0;
    let lastPayment = 0;
    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const payment = monthlyPrincipal + interest;
      if (i === 1) firstPayment = payment;
      if (i === n) lastPayment = payment;
      balance -= monthlyPrincipal;
      totalInterest += interest;
      rows.push({
        month: i,
        payment,
        principal: monthlyPrincipal,
        interest,
        balance: Math.max(0, balance),
      });
    }
    return {
      monthlyFirst: firstPayment,
      monthlyLast: lastPayment,
      totalInterest,
      totalRepayment: P + totalInterest,
      rows,
    };
  }, [amount, years, rate, method]);

  const displayRows = useMemo(() => {
    if (!result) return [];
    return showAll ? result.rows : result.rows.filter((_, i) => i < 12 || i >= result.rows.length - 3);
  }, [result, showAll]);

  return (
    <ToolPageShell title="房贷计算" description={DESCRIPTION}>
      <div className="grid gap-[20px] lg:grid-cols-[360px_1fr]">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>贷款金额（元）</ToolLabel>
            <ToolInput
              type="number"
              value={amount}
              onChange={setAmount}
              placeholder="例如 500000"
            />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>贷款期限（年）</ToolLabel>
            <ToolInput
              type="number"
              value={years}
              onChange={setYears}
              placeholder="例如 30"
            />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>年利率（%）</ToolLabel>
            <ToolInput
              type="number"
              value={rate}
              onChange={setRate}
              placeholder="例如 4.2"
            />
          </div>
          <div className="mb-[20px]">
            <ToolLabel>还款方式</ToolLabel>
            <div className="flex gap-[8px]">
              <button
                onClick={() => setMethod("equal-payment")}
                className={`h-[40px] flex-1 rounded-[8px] text-[14px] font-medium transition-colors ${
                  method === "equal-payment"
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                等额本息
              </button>
              <button
                onClick={() => setMethod("equal-principal")}
                className={`h-[40px] flex-1 rounded-[8px] text-[14px] font-medium transition-colors ${
                  method === "equal-principal"
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                等额本金
              </button>
            </div>
          </div>
          <ToolButton
            onClick={() => {
              setAmount("500000");
              setYears("30");
              setRate("4.2");
              setMethod("equal-payment");
              setShowAll(false);
            }}
            variant="ghost"
          >
            重置默认
          </ToolButton>
        </ToolCard>

        <ToolCard>
          {result ? (
            <div>
              <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-4">
                <Stat
                  label={method === "equal-payment" ? "每月月供" : "首月月供"}
                  value={`¥${fmtMoney(result.monthlyFirst)}`}
                />
                <Stat
                  label={method === "equal-payment" ? "每月月供" : "末月月供"}
                  value={`¥${fmtMoney(result.monthlyLast)}`}
                />
                <Stat label="还款总额" value={`¥${fmtMoney(result.totalRepayment)}`} />
                <Stat label="总利息" value={`¥${fmtMoney(result.totalInterest)}`} highlight />
              </div>

              <div className="mt-[16px] mb-[12px] flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-[#242424]">还款明细</h3>
                <ToolButton
                  variant="ghost"
                  onClick={() => setShowAll((s) => !s)}
                  className="h-[32px] px-[12px] text-[13px]"
                >
                  {showAll ? "收起" : "展开全部"}
                </ToolButton>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-left text-[#8F8F8F]">
                      <th className="py-[8px] pr-[12px] font-medium">期数</th>
                      <th className="py-[8px] pr-[12px] font-medium">月供（元）</th>
                      <th className="py-[8px] pr-[12px] font-medium">本金（元）</th>
                      <th className="py-[8px] pr-[12px] font-medium">利息（元）</th>
                      <th className="py-[8px] font-medium">剩余本金（元）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row, idx) => {
                      const prev = displayRows[idx - 1];
                      const gap = prev && row.month - prev.month > 1;
                      return (
                        <tr
                          key={row.month}
                          className="border-b border-[#F2F3F5] text-[#242424]"
                        >
                          {gap ? (
                            <td colSpan={5} className="py-[6px] text-center text-[#8F8F8F]">
                              … 中间 {row.month - prev.month - 1} 期已隐藏 …
                            </td>
                          ) : (
                            <>
                              <td className="py-[8px] pr-[12px]">{row.month}</td>
                              <td className="py-[8px] pr-[12px]">{fmtMoney(row.payment)}</td>
                              <td className="py-[8px] pr-[12px]">{fmtMoney(row.principal)}</td>
                              <td className="py-[8px] pr-[12px] text-[#EA8A00]">
                                {fmtMoney(row.interest)}
                              </td>
                              <td className="py-[8px]">{fmtMoney(row.balance)}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-[12px]">
                <CopyButton
                  text={
                    `贷款金额：${amount}元\n` +
                    `期限：${years}年\n` +
                    `年利率：${rate}%\n` +
                    `还款方式：${method === "equal-payment" ? "等额本息" : "等额本金"}\n` +
                    `${method === "equal-payment" ? "每月月供" : "首月月供"}：¥${fmtMoney(result.monthlyFirst)}\n` +
                    `总利息：¥${fmtMoney(result.totalInterest)}\n` +
                    `还款总额：¥${fmtMoney(result.totalRepayment)}`
                  }
                  label="复制结果"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-[#8F8F8F]">
              请输入有效的贷款参数
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
        highlight ? "bg-[#FEF3C7]" : "bg-[#F6F7FA]"
      }`}
    >
      <div className="text-[12px] text-[#8F8F8F]">{label}</div>
      <div
        className={`mt-[4px] text-[18px] font-semibold ${
          highlight ? "text-[#EA8A00]" : "text-[#242424]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
