"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { CAPITALS, type CountryCapital } from "./capital-data";

const DESCRIPTION =
  "各国首都查询是一款实用的在线工具，专为帮助用户快速查询世界各国首都而设计。";

const REGIONS = ["全部", "亚洲", "欧洲", "非洲", "北美洲", "南美洲", "大洋洲"] as const;
type Region = (typeof REGIONS)[number];

export default function CapitalPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region>("全部");

  const results = useMemo<CountryCapital[]>(() => {
    const q = query.trim().toLowerCase();
    return CAPITALS.filter((c) => {
      if (region !== "全部" && c.region !== region) return false;
      if (q === "") return true;
      return (
        c.country.toLowerCase().includes(q) ||
        c.countryEn.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.capitalEn.toLowerCase().includes(q)
      );
    });
  }, [query, region]);

  return (
    <ToolPageShell title="各国首都" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>查询首都</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            支持按国家或首都双向查询，可中英文搜索，例如 中国 / China / 北京 / Tokyo。
          </p>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="例如 日本 / Japan / 东京"
            className="w-[360px]"
          />
          <div className="mt-[14px] flex flex-wrap gap-[8px]">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`h-[34px] cursor-pointer rounded-[6px] border px-[14px] text-[13px] transition-colors ${
                  region === r
                    ? "border-[#136CE9] bg-[#EEF3FE] text-[#136CE9]"
                    : "border-[#E5E7EB] bg-white text-[#242424] hover:bg-[#F6F7FA]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="mt-[12px] text-[13px] text-[#8F8F8F]">
            共 {results.length} 个结果
          </div>
        </ToolCard>

        <ToolCard>
          <ToolLabel>国家与首都列表</ToolLabel>
          <div className="mt-[16px] grid grid-cols-1 gap-[10px] md:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <div
                key={`${c.country}-${c.capital}`}
                className="flex items-center gap-[12px] rounded-[10px] border border-[#F6F7FA] bg-[#F6F7FA] px-[14px] py-[12px] transition-colors hover:border-[#136CE9] hover:bg-white"
              >
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[8px] bg-[#136CE9] text-[16px] font-semibold text-white">
                  {c.region[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-[8px]">
                    <span className="truncate text-[15px] font-medium text-[#242424]">
                      {c.country}
                    </span>
                    <span className="truncate text-[12px] text-[#8F8F8F]">
                      {c.countryEn}
                    </span>
                  </div>
                  <div className="mt-[2px] flex items-center gap-[8px]">
                    <span className="truncate text-[14px] text-[#136CE9]">
                      {c.capital}
                    </span>
                    <span className="truncate text-[12px] text-[#8F8F8F]">
                      {c.capitalEn}
                    </span>
                    <CopyButton text={c.capital} label="复制" />
                  </div>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <p className="col-span-full text-[13px] text-[#8F8F8F]">
                未找到匹配的国家或首都。
              </p>
            )}
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
