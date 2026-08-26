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
  "保质期计算工具可以帮助您快速计算食品、药品或其他商品的保质期。通过这款工具，您可以输入生产日期和保质期天数，轻松计算出商品的到期日期。";

type Unit = "days" | "months" | "years";

const UNITS: { value: Unit; label: string }[] = [
  { value: "days", label: "天" },
  { value: "months", label: "月" },
  { value: "years", label: "年" },
];

function parseDate(s: string): number | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime();
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addUnit(base: Date, value: number, unit: Unit): Date {
  const d = new Date(base.getTime());
  if (unit === "days") {
    d.setDate(d.getDate() + value);
  } else if (unit === "months") {
    d.setMonth(d.getMonth() + value);
  } else {
    d.setFullYear(d.getFullYear() + value);
  }
  return d;
}

export default function Page() {
  const [prodDate, setProdDate] = useState("");
  const [shelfValue, setShelfValue] = useState("180");
  const [unit, setUnit] = useState<Unit>("days");

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const result = useMemo(() => {
    const base = parseDate(prodDate);
    const v = parseInt(shelfValue, 10);
    if (base === null || Number.isNaN(v) || v < 0) return null;
    const baseDate = new Date(base);
    const expire = addUnit(baseDate, v, unit);

    const MS_DAY = 24 * 60 * 60 * 1000;
    const daysToExpire = Math.round((expire.getTime() - today.getTime()) / MS_DAY);

    let status: "normal" | "soon" | "expired";
    let statusLabel: string;
    let color: string;
    let bg: string;
    if (daysToExpire < 0) {
      status = "expired";
      statusLabel = "已过期";
      color = "#DC2626";
      bg = "#FEE2E2";
    } else if (daysToExpire <= 7) {
      status = "soon";
      statusLabel = "即将过期";
      color = "#EA8A00";
      bg = "#FEF3C7";
    } else {
      status = "normal";
      statusLabel = "正常";
      color = "#16A34A";
      bg = "#DCFCE7";
    }

    return {
      expireDate: fmt(expire),
      daysToExpire,
      status,
      statusLabel,
      color,
      bg,
      productionDate: fmt(baseDate),
    };
  }, [prodDate, shelfValue, unit, today]);

  return (
    <ToolPageShell title="保质期计算" description={DESCRIPTION}>
      <div className="grid gap-[20px] lg:grid-cols-[400px_1fr]">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>生产日期</ToolLabel>
            <ToolInput type="date" value={prodDate} onChange={setProdDate} />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>保质期</ToolLabel>
            <div className="flex gap-[8px]">
              <ToolInput
                type="number"
                value={shelfValue}
                onChange={setShelfValue}
                placeholder="例如 180"
                className="flex-1"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-[10px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ToolButton
            variant="ghost"
            onClick={() => {
              const t = new Date();
              const s = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
              setProdDate(s);
              setShelfValue("180");
              setUnit("days");
            }}
          >
            重置为今天 + 180天
          </ToolButton>
        </ToolCard>

        <ToolCard>
          {result ? (
            <div>
              <div className="grid grid-cols-2 gap-[12px]">
                <Stat label="生产日期" value={result.productionDate} />
                <Stat label="到期日期" value={result.expireDate} />
              </div>
              <div className="mt-[12px] flex items-center justify-between rounded-[8px] p-[16px]" style={{ background: result.bg }}>
                <div>
                  <div className="text-[12px]" style={{ color: result.color }}>
                    当前状态
                  </div>
                  <div className="mt-[4px] text-[22px] font-bold" style={{ color: result.color }}>
                    {result.statusLabel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] text-[#8F8F8F]">距到期</div>
                  <div className="mt-[4px] text-[22px] font-bold" style={{ color: result.color }}>
                    {result.daysToExpire >= 0 ? `${result.daysToExpire} 天` : `已过 ${Math.abs(result.daysToExpire)} 天`}
                  </div>
                </div>
              </div>
              <div className="mt-[12px] text-[12px] leading-[20px] text-[#8F8F8F]">
                提示：建议在到期日期前使用；临近到期（7 天内）请尽快食用，已过期商品请勿食用。
              </div>
              <div className="mt-[12px]">
                <CopyButton
                  text={`生产日期：${result.productionDate}\n保质期：${shelfValue}${UNITS.find((u) => u.value === unit)?.label}\n到期日期：${result.expireDate}\n状态：${result.statusLabel}（距到期 ${result.daysToExpire} 天）`}
                  label="复制结果"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-[#8F8F8F]">
              请选择生产日期并输入保质期
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-[#F6F7FA] p-[14px]">
      <div className="text-[12px] text-[#8F8F8F]">{label}</div>
      <div className="mt-[4px] text-[18px] font-semibold text-[#242424]">{value}</div>
    </div>
  );
}
