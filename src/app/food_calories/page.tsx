"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { FOODS, type Food, type FoodCategory } from "../calories_list/food-data";

const DESCRIPTION =
  "卡路里查询工具可以帮助您快速查阅各种食物的卡路里含量。通过这款工具，您可以轻松找到每种食物的热量信息，帮助您更好地进行饮食管理和健康规划，确保摄入适量的卡路里以维持健康的生活方式。";

const CATEGORIES = ["主食", "蔬菜", "水果", "肉类", "蛋奶", "零食"] as const;

interface DiaryEntry {
  food: Food;
  grams: number;
}

export default function FoodCaloriesPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<FoodCategory>("主食");
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [grams, setGrams] = useState<Record<string, string>>({});

  const browseList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q !== "") {
      return FOODS.filter(
        (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q),
      );
    }
    return FOODS.filter((f) => f.category === activeCat);
  }, [query, activeCat]);

  const totalKcal = useMemo(
    () =>
      diary.reduce((sum, e) => sum + Math.round((e.food.heat * e.grams) / 100), 0),
    [diary],
  );

  const totalProtein = useMemo(
    () =>
      Math.round(diary.reduce((s, e) => s + (e.food.protein * e.grams) / 100, 0) * 10) / 10,
    [diary],
  );
  const totalFat = useMemo(
    () =>
      Math.round(diary.reduce((s, e) => s + (e.food.fat * e.grams) / 100, 0) * 10) / 10,
    [diary],
  );
  const totalCarb = useMemo(
    () =>
      Math.round(diary.reduce((s, e) => s + (e.food.carb * e.grams) / 100, 0) * 10) / 10,
    [diary],
  );

  const addToDiary = (food: Food) => {
    const g = Number(grams[food.name] ?? "100");
    const gramsNum = g > 0 ? g : 100;
    setDiary((prev) => {
      const existing = prev.find((e) => e.food.name === food.name);
      if (existing) {
        return prev.map((e) =>
          e.food.name === food.name
            ? { ...e, grams: e.grams + gramsNum }
            : e,
        );
      }
      return [...prev, { food, grams: gramsNum }];
    });
    setGrams((prev) => ({ ...prev, [food.name]: "" }));
  };

  const removeFromDiary = (name: string) => {
    setDiary((prev) => prev.filter((e) => e.food.name !== name));
  };

  return (
    <ToolPageShell title="卡路里查询" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        {/* Left: browse + search */}
        <div className="flex flex-col gap-[24px]">
          <ToolCard>
            <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
              搜索食物
            </label>
            <ToolInput
              value={query}
              onChange={setQuery}
              placeholder="输入食物名称搜索"
              className="w-full"
            />
            {query.trim() === "" && (
              <div className="mt-[12px] flex flex-wrap gap-[8px]">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCat(c)}
                    className={`h-[32px] cursor-pointer rounded-[6px] border px-[12px] text-[13px] transition-colors ${
                      activeCat === c
                        ? "border-[#136CE9] bg-[#EEF3FE] text-[#136CE9]"
                        : "border-[#E5E7EB] bg-white text-[#242424] hover:bg-[#F6F7FA]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </ToolCard>

          <ToolCard>
            <div className="mb-[12px] text-[13px] text-[#8F8F8F]">
              {query.trim() !== "" ? `搜索结果（${browseList.length}）` : `${activeCat}类食物（${browseList.length}）`}
            </div>
            <div className="flex max-h-[420px] flex-col gap-[8px] overflow-y-auto pr-[4px]">
              {browseList.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center gap-[10px] rounded-[8px] border border-[#F6F7FA] px-[12px] py-[8px]"
                >
                  <div className="flex flex-1 flex-col">
                    <span className="text-[14px] font-medium text-[#242424]">{f.name}</span>
                    <span className="text-[12px] text-[#8F8F8F]">
                      {f.heat} kcal/100g · {f.category}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={grams[f.name] ?? ""}
                    onChange={(e) =>
                      setGrams((prev) => ({ ...prev, [f.name]: e.target.value }))
                    }
                    placeholder="克数"
                    className="h-[32px] w-[70px] rounded-[6px] border border-[#E5E7EB] px-[8px] text-[13px] outline-none focus:border-[#136CE9]"
                  />
                  <ToolButton onClick={() => addToDiary(f)} className="h-[32px] px-[12px] text-[12px]">
                    加入
                  </ToolButton>
                </div>
              ))}
              {browseList.length === 0 && (
                <p className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                  未找到匹配的食物。
                </p>
              )}
            </div>
          </ToolCard>
        </div>

        {/* Right: daily total calculator */}
        <div className="flex flex-col gap-[24px]">
          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              今日饮食清单
            </label>
            {diary.length === 0 ? (
              <p className="py-[30px] text-center text-[13px] text-[#8F8F8F]">
                从左侧选择食物并加入清单，自动计算每日摄入总热量。
              </p>
            ) : (
              <div className="flex flex-col gap-[8px]">
                {diary.map((e) => (
                  <div
                    key={e.food.name}
                    className="flex items-center gap-[10px] rounded-[8px] bg-[#F6F7FA] px-[12px] py-[8px]"
                  >
                    <div className="flex flex-1 flex-col">
                      <span className="text-[14px] font-medium text-[#242424]">
                        {e.food.name}
                      </span>
                      <span className="text-[12px] text-[#8F8F8F]">
                        {e.grams}g × {e.food.heat} kcal/100g
                      </span>
                    </div>
                    <span className="text-[15px] font-semibold text-[#136CE9]">
                      {Math.round((e.food.heat * e.grams) / 100)} kcal
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromDiary(e.food.name)}
                      className="cursor-pointer text-[18px] leading-none text-[#8F8F8F] hover:text-[#E53935]"
                      aria-label={`移除 ${e.food.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDiary([])}
                  className="mt-[4px] cursor-pointer self-end text-[12px] text-[#8F8F8F] hover:text-[#E53935]"
                >
                  清空清单
                </button>
              </div>
            )}
          </ToolCard>

          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              每日摄入总览
            </label>
            <div className="rounded-[10px] bg-[#EEF3FE] px-[20px] py-[20px] text-center">
              <div className="text-[13px] text-[#8F8F8F]">总热量</div>
              <div className="mt-[4px] text-[36px] font-bold text-[#136CE9]">
                {totalKcal}
                <span className="ml-[4px] text-[16px] font-normal">kcal</span>
              </div>
            </div>
            <div className="mt-[14px] grid grid-cols-3 gap-[12px]">
              <NutrientCard label="蛋白质" value={totalProtein} unit="g" color="#43A047" />
              <NutrientCard label="脂肪" value={totalFat} unit="g" color="#FBC02D" />
              <NutrientCard label="碳水" value={totalCarb} unit="g" color="#E53935" />
            </div>
            <div className="mt-[14px] rounded-[8px] bg-[#F6F7FA] px-[14px] py-[12px] text-[12px] leading-[20px] text-[#8F8F8F]">
              成人每日推荐摄入约 2000 kcal（女性）/ 2400 kcal（男性）。实际需求因身高、体重、活动量而异，仅供参考。
            </div>
          </ToolCard>
        </div>
      </div>
    </ToolPageShell>
  );
}

function NutrientCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="rounded-[8px] border border-[#F6F7FA] px-[12px] py-[12px] text-center">
      <div className="text-[12px] text-[#8F8F8F]">{label}</div>
      <div className="mt-[4px] text-[18px] font-semibold" style={{ color }}>
        {value}
        <span className="ml-[2px] text-[12px] font-normal">{unit}</span>
      </div>
    </div>
  );
}
