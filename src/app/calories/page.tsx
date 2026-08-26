"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { FOODS, type FoodCategory } from "../calories_list/food-data";

const DESCRIPTION =
  "卡路里查询工具可以帮助您快速查阅各种食物的卡路里含量。通过这款工具，您可以轻松找到每种食物的热量信息，帮助您更好地进行饮食管理和健康规划，确保摄入适量的卡路里以维持健康的生活方式。";

const CATEGORIES = ["全部", "主食", "蔬菜", "水果", "肉类", "蛋奶", "零食"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

export default function CaloriesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("全部");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => {
      if (category !== "全部" && f.category !== category) return false;
      if (q === "") return true;
      return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    }).sort((a, b) => a.heat - b.heat);
  }, [query, category]);

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const max = Math.max(...results.map((f) => f.heat));
    const min = Math.min(...results.map((f) => f.heat));
    const avg = Math.round(results.reduce((s, f) => s + f.heat, 0) / results.length);
    return { max, min, avg };
  }, [results]);

  const copyText = useMemo(
    () =>
      results
        .map((f) => `${f.name}\t${f.category}\t${f.heat}kcal/100g`)
        .join("\n"),
    [results],
  );

  return (
    <ToolPageShell title="卡路里查询" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            搜索食物
          </label>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="例如 鸡蛋 / 苹果 / 牛肉"
            className="w-[320px]"
          />
          <div className="mt-[14px] flex flex-wrap gap-[8px]">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`h-[34px] cursor-pointer rounded-[6px] border px-[14px] text-[13px] transition-colors ${
                  category === c
                    ? "border-[#136CE9] bg-[#EEF3FE] text-[#136CE9]"
                    : "border-[#E5E7EB] bg-white text-[#242424] hover:bg-[#F6F7FA]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-[12px] flex items-center justify-between">
            <span className="text-[13px] text-[#8F8F8F]">
              共 {results.length} 种食物，热量单位 kcal/100g
            </span>
            {results.length > 0 && (
              <CopyButton text={copyText} label="复制结果" />
            )}
          </div>
        </ToolCard>

        {summary && (
          <div className="grid grid-cols-3 gap-[16px]">
            <StatCard label="最低热量" value={`${summary.min} kcal`} color="#43A047" />
            <StatCard label="平均热量" value={`${summary.avg} kcal`} color="#136CE9" />
            <StatCard label="最高热量" value={`${summary.max} kcal`} color="#E53935" />
          </div>
        )}

        <ToolCard className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left text-[#8F8F8F]">
                <th className="py-[10px] pr-[16px] font-medium">食物</th>
                <th className="py-[10px] pr-[16px] font-medium">分类</th>
                <th className="py-[10px] pr-[16px] font-medium">热量</th>
                <th className="py-[10px] pr-[16px] font-medium">蛋白质</th>
                <th className="py-[10px] pr-[16px] font-medium">脂肪</th>
                <th className="py-[10px] pr-[16px] font-medium">碳水</th>
              </tr>
            </thead>
            <tbody>
              {results.map((f) => (
                <tr key={f.name} className="border-b border-[#F6F7FA] hover:bg-[#F6F7FA]">
                  <td className="py-[10px] pr-[16px] font-medium text-[#242424]">{f.name}</td>
                  <td className="py-[10px] pr-[16px] text-[#8F8F8F]">{f.category}</td>
                  <td className="py-[10px] pr-[16px] font-medium text-[#136CE9]">
                    {f.heat} kcal
                  </td>
                  <td className="py-[10px] pr-[16px] text-[#242424]">{f.protein} g</td>
                  <td className="py-[10px] pr-[16px] text-[#242424]">{f.fat} g</td>
                  <td className="py-[10px] pr-[16px] text-[#242424]">{f.carb} g</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                    未找到匹配的食物。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ToolCard>

        <ToolCard>
          <label className="mb-[8px] block text-[14px] font-medium text-[#242424]">
            热量分级参考（每 100g）
          </label>
          <div className="flex flex-col gap-[8px] text-[13px]">
            <LevelRow color="#43A047" label="低热量" range="＜ 100 kcal" desc="适合减脂期食用" />
            <LevelRow color="#FBC02D" label="中等热量" range="100 - 300 kcal" desc="适量食用" />
            <LevelRow color="#E53935" label="高热量" range="＞ 300 kcal" desc="控制摄入量" />
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-[10px] border border-[#F6F7FA] bg-white p-[16px] shadow-[0_0_10px_0_rgba(0,0,0,0.06)]">
      <div className="text-[13px] text-[#8F8F8F]">{label}</div>
      <div className="mt-[6px] text-[20px] font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function LevelRow({ color, label, range, desc }: { color: string; label: string; range: string; desc: string }) {
  return (
    <div className="flex items-center gap-[12px]">
      <span className="inline-block h-[10px] w-[10px] rounded-full" style={{ background: color }} />
      <span className="w-[70px] font-medium text-[#242424]">{label}</span>
      <span className="w-[120px] text-[#8F8F8F]">{range}</span>
      <span className="text-[#8F8F8F]">{desc}</span>
    </div>
  );
}
