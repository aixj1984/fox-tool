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
  "BMI是一种常用的健康指标，通过体重和身高的比例来评估一个人的体重是否在健康范围内。通过这款工具，您可以快速计算出您的BMI值，并了解您的体重状况。";

type Category = {
  label: string;
  color: string;
  bg: string;
  range: string;
};

function categorize(bmi: number): Category | null {
  if (!Number.isFinite(bmi) || bmi <= 0) return null;
  if (bmi < 18.5)
    return { label: "偏瘦", color: "#136CE9", bg: "#E6F0FE", range: "< 18.5" };
  if (bmi < 24)
    return { label: "正常", color: "#16A34A", bg: "#DCFCE7", range: "18.5 - 23.9" };
  if (bmi < 28)
    return { label: "超重", color: "#EA8A00", bg: "#FEF3C7", range: "24.0 - 27.9" };
  return { label: "肥胖", color: "#DC2626", bg: "#FEE2E2", range: "≥ 28.0" };
}

export default function Page() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const bmi = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    if (unit === "metric") {
      const m = h / 100;
      return w / (m * m);
    }
    // imperial: height in inches, weight in pounds
    return (w / (h * h)) * 703;
  }, [height, weight, unit]);

  const cat = bmi !== null ? categorize(bmi) : null;
  const idealMin = useMemo(() => {
    const h = parseFloat(height);
    if (!h || h <= 0) return null;
    const m = h / 100;
    return 18.5 * m * m;
  }, [height]);
  const idealMax = useMemo(() => {
    const h = parseFloat(height);
    if (!h || h <= 0) return null;
    const m = h / 100;
    return 23.9 * m * m;
  }, [height]);

  return (
    <ToolPageShell title="BMI计算" description={DESCRIPTION}>
      <div className="grid gap-[20px] md:grid-cols-[1fr_1fr]">
        <ToolCard>
          <div className="mb-[16px] flex gap-[8px]">
            <button
              onClick={() => setUnit("metric")}
              className={`h-[36px] flex-1 rounded-[8px] text-[14px] font-medium transition-colors ${
                unit === "metric"
                  ? "bg-[#136CE9] text-white"
                  : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
              }`}
            >
              公制（cm / kg）
            </button>
            <button
              onClick={() => setUnit("imperial")}
              className={`h-[36px] flex-1 rounded-[8px] text-[14px] font-medium transition-colors ${
                unit === "imperial"
                  ? "bg-[#136CE9] text-white"
                  : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
              }`}
            >
              英制（in / lb）
            </button>
          </div>

          <div className="mb-[16px]">
            <ToolLabel>身高（{unit === "metric" ? "厘米" : "英寸"}）</ToolLabel>
            <ToolInput
              type="number"
              value={height}
              onChange={setHeight}
              placeholder={unit === "metric" ? "例如 170" : "例如 67"}
            />
          </div>
          <div className="mb-[20px]">
            <ToolLabel>体重（{unit === "metric" ? "公斤" : "磅"}）</ToolLabel>
            <ToolInput
              type="number"
              value={weight}
              onChange={setWeight}
              placeholder={unit === "metric" ? "例如 65" : "例如 143"}
            />
          </div>

          <div className="flex gap-[8px]">
            <ToolButton
              onClick={() => {
                setHeight("");
                setWeight("");
              }}
              variant="ghost"
            >
              重置
            </ToolButton>
            {bmi !== null ? <CopyButton text={bmi.toFixed(2)} label="复制BMI" /> : null}
          </div>
        </ToolCard>

        <ToolCard>
          {bmi === null ? (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-[#8F8F8F]">
              请输入身高和体重以查看结果
            </div>
          ) : (
            <div>
              <div className="text-[13px] text-[#8F8F8F]">您的BMI值</div>
              <div className="my-[8px] text-[56px] font-bold leading-none text-[#242424]">
                {bmi.toFixed(1)}
              </div>
              {cat ? (
                <div
                  className="inline-flex items-center gap-[6px] rounded-full px-[14px] py-[6px] text-[14px] font-medium"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  <span
                    className="inline-block h-[8px] w-[8px] rounded-full"
                    style={{ background: cat.color }}
                  />
                  {cat.label}（{cat.range}）
                </div>
              ) : null}

              <div className="my-[20px] h-[10px] w-full overflow-hidden rounded-full bg-[#F0F2F5]">
                <div className="flex h-full w-full">
                  <div style={{ flex: 18.5, background: "#136CE9" }} />
                  <div style={{ flex: 5.4, background: "#16A34A" }} />
                  <div style={{ flex: 4, background: "#EA8A00" }} />
                  <div style={{ flex: 10, background: "#DC2626" }} />
                </div>
                {cat ? (
                  <div
                    className="relative -mt-[14px] h-[14px] w-[2px] bg-[#242424]"
                    style={{ marginLeft: `${markerPercent(bmi)}%` }}
                  />
                ) : null}
              </div>
              <div className="flex justify-between text-[11px] text-[#8F8F8F]">
                <span>偏瘦</span>
                <span>正常</span>
                <span>超重</span>
                <span>肥胖</span>
              </div>

              {idealMin !== null && idealMax !== null ? (
                <div className="mt-[20px] rounded-[8px] bg-[#F6F7FA] p-[14px] text-[13px] text-[#242424]">
                  健康体重范围参考：
                  <span className="font-semibold">
                    {idealMin.toFixed(1)} - {idealMax.toFixed(1)}{" "}
                  </span>
                  {unit === "metric" ? "kg" : "lb"}
                </div>
              ) : null}
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function markerPercent(bmi: number): number {
  // Map bmi range 10..35 to 0..100
  const pct = ((bmi - 10) / (35 - 10)) * 100;
  return Math.max(0, Math.min(100, pct));
}
