"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { HOSPITALS, type Hospital } from "./hospital-data";

const DESCRIPTION =
  "医院推荐工具可以帮助您根据特定医疗需求，推荐合适的医院。通过这款工具，您可以快速找到相对应科室的优质医院，查看医院的详细信息和用户评价，便于您做出明智的医疗选择。";

export default function HospitalRecommendPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Hospital | null>(null);

  const provinces = useMemo(() => {
    const set = new Set(HOSPITALS.map((h) => h.province));
    return Array.from(set).sort();
  }, []);

  const [province, setProvince] = useState<string>("全部");

  const allDepts = useMemo(() => {
    const set = new Set<string>();
    HOSPITALS.forEach((h) => h.keyDepts.forEach((d) => set.add(d)));
    return Array.from(set).sort();
  }, []);

  const [dept, setDept] = useState<string>("全部");

  const results = useMemo(() => {
    const q = query.trim();
    return HOSPITALS.filter((h) => {
      if (q !== "" && !h.name.includes(q)) return false;
      if (province !== "全部" && h.province !== province) return false;
      if (dept !== "全部" && !h.keyDepts.includes(dept)) return false;
      return true;
    });
  }, [query, province, dept]);

  return (
    <ToolPageShell title="医院推荐" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            搜索医院
          </label>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="输入医院名称"
            className="w-[320px]"
          />
          <div className="mt-[14px] flex flex-wrap items-center gap-[8px]">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="h-[34px] cursor-pointer rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] text-[13px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              <option value="全部">全部地区</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="h-[34px] cursor-pointer rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] text-[13px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              <option value="全部">全部科室</option>
              {allDepts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="mt-[10px] text-[13px] text-[#8F8F8F]">
            共 {HOSPITALS.length} 家知名医院，推荐 {results.length} 家。
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              推荐医院
            </label>
            <div className="flex max-h-[500px] flex-col overflow-y-auto pr-[4px]">
              {results.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => setActive(h)}
                  className={`flex items-center justify-between border-b border-[#F6F7FA] py-[10px] text-left transition-colors last:border-0 hover:bg-[#F6F7FA] ${
                    active?.name === h.name ? "bg-[#EEF3FE]" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-[#242424]">{h.name}</span>
                    <span className="text-[12px] text-[#8F8F8F]">
                      {h.province} · {h.city}
                    </span>
                  </div>
                  <span className="rounded-[4px] bg-[#43A047] px-[6px] py-[1px] text-[11px] font-medium text-white">
                    {h.level}
                  </span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                  未找到匹配的医院。
                </p>
              )}
            </div>
          </ToolCard>

          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              医院详情
            </label>
            {active ? (
              <div className="flex flex-col gap-[14px]">
                <div>
                  <div className="text-[22px] font-semibold text-[#242424]">{active.name}</div>
                  <div className="mt-[6px] flex items-center gap-[8px]">
                    <span className="rounded-[4px] bg-[#43A047] px-[6px] py-[1px] text-[12px] font-medium text-white">
                      {active.level}
                    </span>
                    <span className="text-[13px] text-[#8F8F8F]">
                      {active.province} · {active.city}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="mb-[6px] text-[13px] font-medium text-[#136CE9]">重点科室</div>
                  <div className="flex flex-wrap gap-[6px]">
                    {active.keyDepts.map((d) => (
                      <span
                        key={d}
                        className="rounded-[6px] border border-[#E5E7EB] bg-[#F6F7FA] px-[10px] py-[2px] text-[13px] text-[#242424]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-[6px] text-[13px] font-medium text-[#136CE9]">医院简介</div>
                  <div className="rounded-[8px] bg-[#F6F7FA] px-[14px] py-[12px] text-[14px] leading-[24px] text-[#242424]">
                    {active.intro}
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-[30px] text-center text-[13px] text-[#8F8F8F]">
                从左侧列表选择一家医院查看详细信息。
              </p>
            )}
          </ToolCard>
        </div>
      </div>
    </ToolPageShell>
  );
}
