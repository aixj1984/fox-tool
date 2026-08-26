"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { FOODS, type Food, type FoodCategory } from "./food-data";

const DESCRIPTION =
  "食物热量表工具可以帮助您快速查阅各种食物的热量和营养成分信息。通过这款工具，您可以轻松找到每种食物的热量、蛋白质、脂肪、碳水化合物等数据。";

const CATEGORIES = ["全部", "主食", "蔬菜", "水果", "肉类", "蛋奶", "零食"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

type SortKey = "heat" | "protein" | "fat" | "carb";

const SORT_LABEL: Record<SortKey, string> = {
  heat: "热量",
  protein: "蛋白质",
  fat: "脂肪",
  carb: "碳水",
};

export default function CaloriesListPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("全部");
  const [sortKey, setSortKey] = useState<SortKey>("heat");
  const [sortDesc, setSortDesc] = useState(true);

  const results = useMemo<Food[]>(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => {
      if (category !== "全部" && f.category !== category) return false;
      if (q === "") return true;
      return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    }).sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDesc ? -diff : diff;
    });
  }, [query, category, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <ToolPageShell title="食物热量表" description={DESCRIPTION}>
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
          <div className="mt-[12px] text-[13px] text-[#8F8F8F]">
            共 {results.length} 个食物，单位为 每 100g
          </div>
        </ToolCard>

        <ToolCard className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left text-[#8F8F8F]">
                <th className="py-[10px] pr-[16px] font-medium">食物</th>
                <th className="py-[10px] pr-[16px] font-medium">分类</th>
                <th className="py-[10px] pr-[16px] font-medium">
                  <SortButton label={SORT_LABEL.heat} active={sortKey === "heat"} desc={sortDesc} onClick={() => toggleSort("heat")} />
                </th>
                <th className="py-[10px] pr-[16px] font-medium">
                  <SortButton label={SORT_LABEL.protein} active={sortKey === "protein"} desc={sortDesc} onClick={() => toggleSort("protein")} />
                </th>
                <th className="py-[10px] pr-[16px] font-medium">
                  <SortButton label={SORT_LABEL.fat} active={sortKey === "fat"} desc={sortDesc} onClick={() => toggleSort("fat")} />
                </th>
                <th className="py-[10px] pr-[16px] font-medium">
                  <SortButton label={SORT_LABEL.carb} active={sortKey === "carb"} desc={sortDesc} onClick={() => toggleSort("carb")} />
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((f) => (
                <tr key={f.name} className="border-b border-[#F6F7FA] hover:bg-[#F6F7FA]">
                  <td className="py-[10px] pr-[16px] font-medium text-[#242424]">{f.name}</td>
                  <td className="py-[10px] pr-[16px] text-[#8F8F8F]">{f.category}</td>
                  <td className="py-[10px] pr-[16px] text-[#136CE9]">{f.heat} kcal</td>
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
      </div>
    </ToolPageShell>
  );
}

function SortButton({ label, active, desc, onClick }: { label: string; active: boolean; desc: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer font-medium transition-colors ${
        active ? "text-[#136CE9]" : "text-[#8F8F8F] hover:text-[#242424]"
      }`}
    >
      {label} {active ? (desc ? "↓" : "↑") : ""}
    </button>
  );
}
