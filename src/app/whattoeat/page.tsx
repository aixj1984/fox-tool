"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  FOODS,
  MEAL_LABEL,
  type FoodItem,
  type MealType,
} from "./food-data";

const DESCRIPTION =
  "这是一款很不错做决定吃什么的工具，不用再为每天吃什么而烦恼了。让你实现快速、轻松的选餐过程，让你在日常生活中更加方便和快捷地选择健康优质的食物";

// 使用 crypto 真随机选取
function randomIndex(max: number): number {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

const MEALS: MealType[] = ["breakfast", "lunch", "dinner"];

export default function Page() {
  const [meal, setMeal] = useState<MealType>("lunch");
  const [excludeCategories, setExcludeCategories] = useState<Set<string>>(
    new Set(),
  );
  const [excludeNames, setExcludeNames] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<FoodItem | null>(null);
  const [rolling, setRolling] = useState(false);
  const [display, setDisplay] = useState<string>("点击开始抽取");
  const [history, setHistory] = useState<string[]>([]);
  const rollTimer = useRef<number | null>(null);

  const candidateFoods = useMemo(() => {
    return FOODS.filter(
      (f) =>
        f.meals.includes(meal) &&
        !excludeCategories.has(f.category) &&
        !excludeNames.has(f.name),
    );
  }, [meal, excludeCategories, excludeNames]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    FOODS.forEach((f) => set.add(f.category));
    return Array.from(set);
  }, []);

  // 清理动画定时器
  useEffect(() => {
    return () => {
      if (rollTimer.current !== null) {
        window.clearTimeout(rollTimer.current);
      }
    };
  }, []);

  const startRoll = () => {
    if (rolling) return;
    if (candidateFoods.length === 0) {
      setDisplay("没有可选食物，请调整筛选");
      return;
    }
    setRolling(true);
    setResult(null);

    const totalTicks = 24; // 动画总轮数
    let ticks = 0;

    // 用递归 setTimeout 实现逐渐减速的抽取动画
    const tick = () => {
      const idx = randomIndex(candidateFoods.length);
      setDisplay(candidateFoods[idx].name);
      ticks += 1;

      if (ticks >= totalTicks) {
        // 最终落定
        const finalIdx = randomIndex(candidateFoods.length);
        const final = candidateFoods[finalIdx];
        setResult(final);
        setDisplay(final.name);
        setHistory((h) => [final.name, ...h].slice(0, 10));
        setRolling(false);
        rollTimer.current = null;
        return;
      }

      // 间隔随进度递增 → 减速效果
      const progress = ticks / totalTicks;
      const delay = 50 + Math.pow(progress, 2) * 280; // 50ms → ~330ms
      rollTimer.current = window.setTimeout(tick, delay);
    };

    rollTimer.current = window.setTimeout(tick, 50);
  };

  const toggleCategory = (c: string) => {
    setExcludeCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const toggleExcludeName = (name: string) => {
    setExcludeNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const resetExcludes = () => {
    setExcludeCategories(new Set());
    setExcludeNames(new Set());
  };

  return (
    <ToolPageShell title="今天吃什么" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[1fr_320px]">
        <div className="space-y-[16px]">
          {/* 抽取面板 */}
          <ToolCard>
            <div className="mb-[16px] flex items-center gap-[8px]">
              {MEALS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMeal(m);
                    setResult(null);
                    setDisplay("点击开始抽取");
                  }}
                  className={`h-[36px] rounded-[8px] px-[16px] text-[14px] font-medium transition-colors ${
                    meal === m
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#5A5A5A] hover:bg-[#ebedf2]"
                  }`}
                >
                  {MEAL_LABEL[m]}
                </button>
              ))}
            </div>

            <div className="rounded-[12px] bg-gradient-to-br from-[#FFF7E6] to-[#FFEED1] p-[32px] text-center">
              <div className="mb-[8px] text-[13px] text-[#8F8F8F]">
                {rolling ? "抽取中..." : result ? `今天${MEAL_LABEL[meal]}就吃这个` : "准备好了吗"}
              </div>
              <div
                className={`text-[40px] font-bold tracking-wide text-[#242424] transition-all ${
                  rolling ? "scale-105" : "scale-100"
                }`}
                style={{ color: rolling ? "#E67C00" : "#242424" }}
              >
                {display}
              </div>
              {result && !rolling ? (
                <div className="mt-[8px] text-[13px] text-[#8F8F8F]">
                  类别：{result.category}
                </div>
              ) : null}
            </div>

            <div className="mt-[20px] flex items-center justify-center gap-[12px]">
              <ToolButton
                onClick={startRoll}
                disabled={rolling || candidateFoods.length === 0}
              >
                {rolling ? "抽取中..." : result ? "再来一次" : "开始"}
              </ToolButton>
              {result ? (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    if (result) toggleExcludeName(result.name);
                  }}
                >
                  不要这个
                </ToolButton>
              ) : null}
            </div>

            {candidateFoods.length === 0 ? (
              <div className="mt-[12px] text-center text-[13px] text-[#E5484D]">
                当前筛选下没有可选食物，请重置筛选
              </div>
            ) : (
              <div className="mt-[12px] text-center text-[13px] text-[#8F8F8F]">
                候选 {candidateFoods.length} 种食物
              </div>
            )}
          </ToolCard>

          {/* 历史 */}
          {history.length > 0 ? (
            <ToolCard>
              <ToolLabel>最近抽取</ToolLabel>
              <div className="mt-[8px] flex flex-wrap gap-[8px]">
                {history.map((h, i) => (
                  <span
                    key={`${h}-${i}`}
                    className={`rounded-full px-[12px] py-[4px] text-[13px] ${
                      i === 0
                        ? "bg-[#136CE9]/10 text-[#136CE9]"
                        : "bg-[#F6F7FA] text-[#5A5A5A]"
                    }`}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </ToolCard>
          ) : null}
        </div>

        {/* 筛选面板 */}
        <ToolCard>
          <div className="mb-[12px] flex items-center justify-between">
            <ToolLabel>排除类别</ToolLabel>
            <button
              type="button"
              onClick={resetExcludes}
              className="text-[12px] text-[#136CE9] hover:underline"
            >
              重置筛选
            </button>
          </div>
          <div className="flex flex-wrap gap-[8px]">
            {allCategories.map((c) => {
              const excluded = excludeCategories.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`h-[30px] rounded-full px-[12px] text-[13px] transition-colors ${
                    excluded
                      ? "bg-[#FAFAFA] text-[#8F8F8F] line-through"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {excludeNames.size > 0 ? (
            <>
              <div className="mt-[20px] mb-[8px] text-[14px] font-medium text-[#242424]">
                已排除菜品
              </div>
              <div className="flex flex-wrap gap-[8px]">
                {Array.from(excludeNames).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleExcludeName(n)}
                    className="h-[30px] rounded-full bg-[#FAFAFA] px-[12px] text-[13px] text-[#8F8F8F] hover:text-[#5A5A5A]"
                  >
                    {n} ✕
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="mt-[20px] rounded-[8px] bg-[#F6F7FA] p-[12px] text-[12px] leading-[18px] text-[#8F8F8F]">
            提示：选择三餐模式可得到对应餐别推荐；点击&ldquo;不要这个&rdquo;可排除当前结果再次抽取。
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
