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
  "温度转换专为将不同温度单位之间进行转换而设计。通过这款工具，您可以轻松将温度从摄氏度（Celsius）、华氏度（Fahrenheit）和开尔文（Kelvin）等单位之间进行转换。";

type Unit = "C" | "F" | "K";

const UNITS: { value: Unit; label: string; symbol: string }[] = [
  { value: "C", label: "摄氏度", symbol: "°C" },
  { value: "F", label: "华氏度", symbol: "°F" },
  { value: "K", label: "开尔文", symbol: "K" },
];

function toCelsius(value: number, unit: Unit): number {
  if (unit === "C") return value;
  if (unit === "F") return ((value - 32) * 5) / 9;
  return value - 273.15;
}

function fromCelsius(c: number, unit: Unit): number {
  if (unit === "C") return c;
  if (unit === "F") return (c * 9) / 5 + 32;
  return c + 273.15;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return (Math.round(n * 100) / 100).toString();
}

export default function Page() {
  const [value, setValue] = useState("25");
  const [unit, setUnit] = useState<Unit>("C");

  const conversions = useMemo(() => {
    const v = parseFloat(value);
    if (Number.isNaN(v)) return null;
    const c = toCelsius(v, unit);
    return {
      C: fromCelsius(c, "C"),
      F: fromCelsius(c, "F"),
      K: fromCelsius(c, "K"),
    };
  }, [value, unit]);

  const allText = conversions
    ? `${fmt(conversions.C)} °C = ${fmt(conversions.F)} °F = ${fmt(conversions.K)} K`
    : "";

  return (
    <ToolPageShell title="温度转换" description={DESCRIPTION}>
      <div className="grid gap-[20px] md:grid-cols-2">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>输入温度值</ToolLabel>
            <ToolInput
              type="number"
              value={value}
              onChange={setValue}
              placeholder="例如 25"
            />
          </div>
          <div>
            <ToolLabel>原始单位</ToolLabel>
            <div className="grid grid-cols-3 gap-[8px]">
              {UNITS.map((u) => (
                <button
                  key={u.value}
                  onClick={() => setUnit(u.value)}
                  className={`h-[44px] rounded-[8px] text-[14px] font-medium transition-colors ${
                    unit === u.value
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {u.symbol}
                  <span className="block text-[11px] font-normal opacity-80">{u.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-[16px] rounded-[8px] bg-[#F6F7FA] p-[12px] text-[12px] leading-[20px] text-[#8F8F8F]">
            换算公式：<br />
            C = (F − 32) × 5/9<br />
            F = C × 9/5 + 32<br />
            K = C + 273.15
          </div>
        </ToolCard>

        <ToolCard>
          {conversions ? (
            <div>
              <div className="mb-[12px] text-[14px] font-medium text-[#242424]">
                转换结果
              </div>
              <div className="space-y-[10px]">
                {UNITS.map((u) => {
                  const v = conversions[u.value];
                  const active = u.value === unit;
                  return (
                    <div
                      key={u.value}
                      className={`flex items-center justify-between rounded-[10px] p-[16px] transition-colors ${
                        active
                          ? "border-2 border-[#136CE9] bg-[#E6F0FE]"
                          : "bg-[#F6F7FA]"
                      }`}
                    >
                      <div>
                        <div className="text-[12px] text-[#8F8F8F]">{u.label}</div>
                        <div className="mt-[2px] text-[11px] text-[#8F8F8F]">
                          {u.symbol}
                          {active ? " （原始）" : ""}
                        </div>
                      </div>
                      <div className="text-[28px] font-bold text-[#242424]">
                        {fmt(v)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-[16px]">
                <CopyButton text={allText} label="复制全部" />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-[#8F8F8F]">
              请输入有效的温度值
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
