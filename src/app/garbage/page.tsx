"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  GARBAGE_DATA,
  CATEGORY_COLOR,
  CATEGORY_DESC,
  type GarbageCategory,
} from "./garbage-data";

const DESCRIPTION =
  "垃圾分类查询工具是一款免费的工具，可以用来查询生活中的垃圾分类情况。这款工具提供了实时更新的垃圾分类。让用户更加清晰地了解垃圾分类的具体方法和要求。更好地理解和管理垃圾分类工作";

const CATEGORIES = ["全部", "可回收物", "有害垃圾", "厨余垃圾", "其他垃圾"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

export default function GarbagePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("全部");

  const results = useMemo(() => {
    const q = query.trim();
    return GARBAGE_DATA.filter((item) => {
      if (category !== "全部" && item.category !== category) return false;
      if (q === "") return true;
      return item.name.includes(q);
    });
  }, [query, category]);

  const exact = useMemo(() => {
    const q = query.trim();
    if (q === "") return null;
    return GARBAGE_DATA.find((item) => item.name === q) ?? null;
  }, [query]);

  return (
    <ToolPageShell title="垃圾分类查询" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            输入垃圾名称查询
          </label>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="例如 纸箱、电池、果皮、烟头"
            className="w-[360px]"
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
            共收录 {GARBAGE_DATA.length} 个常见物品，数据参考上海/北京垃圾分类标准。
          </div>
        </ToolCard>

        {exact && (
          <ToolCard>
            <div className="flex items-center gap-[16px]">
              <span
                className="inline-flex h-[40px] items-center rounded-[8px] px-[16px] text-[15px] font-semibold text-white"
                style={{ background: CATEGORY_COLOR[exact.category] }}
              >
                {exact.category}
              </span>
              <div className="flex flex-col">
                <span className="text-[18px] font-semibold text-[#242424]">
                  {exact.name}
                </span>
                <span className="mt-[2px] text-[13px] text-[#8F8F8F]">
                  {exact.tip}
                </span>
              </div>
            </div>
          </ToolCard>
        )}

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              查询结果（{results.length}）
            </label>
            <div className="flex flex-col">
              {results.slice(0, 60).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between border-b border-[#F6F7FA] py-[10px] last:border-0"
                >
                  <span className="text-[14px] text-[#242424]">{item.name}</span>
                  <span
                    className="rounded-[6px] px-[10px] py-[3px] text-[12px] font-medium text-white"
                    style={{ background: CATEGORY_COLOR[item.category] }}
                  >
                    {item.category}
                  </span>
                </div>
              ))}
              {results.length === 0 && (
                <p className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                  未找到匹配的物品，可尝试更换关键词。
                </p>
              )}
            </div>
          </ToolCard>

          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              四类垃圾分类说明
            </label>
            <div className="flex flex-col gap-[14px]">
              {(Object.keys(CATEGORY_DESC) as GarbageCategory[]).map((cat) => (
                <div
                  key={cat}
                  className="rounded-[8px] border border-[#F6F7FA] p-[12px]"
                >
                  <div className="flex items-center gap-[8px]">
                    <span
                      className="inline-block h-[10px] w-[10px] rounded-full"
                      style={{ background: CATEGORY_COLOR[cat] }}
                    />
                    <span className="text-[14px] font-semibold text-[#242424]">
                      {cat}
                    </span>
                  </div>
                  <p className="mt-[6px] text-[13px] leading-[20px] text-[#8F8F8F]">
                    {CATEGORY_DESC[cat]}
                  </p>
                </div>
              ))}
            </div>
          </ToolCard>
        </div>
      </div>
    </ToolPageShell>
  );
}
