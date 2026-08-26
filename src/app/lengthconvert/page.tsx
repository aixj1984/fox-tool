"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "长度转换是一款功能强大、实用的换算工具，可以将数据进行长度进行换算，例如厘米、米、千米、公里等。";

// Base unit: meters. Each unit's factor = how many meters per 1 unit.
type Unit = {
  key: string;
  label: string;
  factor: number;
  group: "公制" | "英制" | "市制";
};

const UNITS: Unit[] = [
  { key: "mm", label: "毫米", factor: 0.001, group: "公制" },
  { key: "cm", label: "厘米", factor: 0.01, group: "公制" },
  { key: "m", label: "米", factor: 1, group: "公制" },
  { key: "km", label: "千米/公里", factor: 1000, group: "公制" },
  { key: "in", label: "英寸 (inch)", factor: 0.0254, group: "英制" },
  { key: "ft", label: "英尺 (foot)", factor: 0.3048, group: "英制" },
  { key: "yd", label: "码 (yard)", factor: 0.9144, group: "英制" },
  { key: "mi", label: "英里 (mile)", factor: 1609.344, group: "英制" },
  { key: "li", label: "里", factor: 500, group: "市制" },
  { key: "zhang", label: "丈", factor: 10 / 3, group: "市制" },
  { key: "chi", label: "尺", factor: 1 / 3, group: "市制" },
];

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n !== 0 && (Math.abs(n) >= 1e12 || Math.abs(n) < 1e-6)) {
    return n.toExponential(6);
  }
  const rounded = Math.round(n * 1e8) / 1e8;
  return rounded.toLocaleString("zh-CN", { maximumFractionDigits: 8 });
}

export default function Page() {
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState("m");

  const conversions = useMemo(() => {
    const v = parseFloat(value);
    const src = UNITS.find((u) => u.key === unit);
    if (Number.isNaN(v) || !src) return null;
    const meters = v * src.factor;
    const map: Record<string, number> = {};
    for (const u of UNITS) {
      map[u.key] = meters / u.factor;
    }
    return { src, meters, map };
  }, [value, unit]);

  const allText = useMemo(() => {
    if (!conversions) return "";
    return UNITS.map((u) => `${fmt(conversions.map[u.key])} ${u.label}`).join("\n");
  }, [conversions]);

  return (
    <ToolPageShell title="长度转换" description={DESCRIPTION}>
      <div className="grid gap-[20px] md:grid-cols-[400px_1fr]">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>输入数值</ToolLabel>
            <ToolInput
              type="number"
              value={value}
              onChange={setValue}
              placeholder="例如 1"
            />
          </div>
          <div>
            <ToolLabel>原始单位</ToolLabel>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              {(["公制", "英制", "市制"] as const).map((g) => (
                <optgroup key={g} label={g}>
                  {UNITS.filter((u) => u.group === g).map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="mt-[16px] rounded-[8px] bg-[#F6F7FA] p-[12px] text-[12px] leading-[20px] text-[#8F8F8F]">
            基准单位：米 (m)。换算示例：1 千米 = 1000 米，1 英寸 = 2.54 厘米，
            1 里 = 500 米，1 丈 = 10/3 米，1 尺 = 1/3 米。
          </div>
        </ToolCard>

        <ToolCard>
          {conversions ? (
            <div>
              <div className="mb-[12px] flex items-baseline justify-between">
                <span className="text-[14px] font-medium text-[#242424]">转换结果</span>
                <span className="text-[13px] text-[#8F8F8F]">
                  {value} {conversions.src.label} = {fmt(conversions.meters)} 米
                </span>
              </div>
              <div className="grid gap-[8px] sm:grid-cols-2">
                {UNITS.map((u) => {
                  const active = u.key === unit;
                  return (
                    <div
                      key={u.key}
                      className={`flex items-center justify-between rounded-[8px] p-[12px] ${
                        active ? "border-2 border-[#136CE9] bg-[#E6F0FE]" : "bg-[#F6F7FA]"
                      }`}
                    >
                      <span className="text-[13px] text-[#242424]">
                        {u.label}
                        {active ? "（原始）" : ""}
                      </span>
                      <span className="font-mono text-[15px] font-semibold text-[#242424]">
                        {fmt(conversions.map[u.key])}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-[14px]">
                <CopyButton text={allText} label="复制全部" />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-[#8F8F8F]">
              请输入有效的数值
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
