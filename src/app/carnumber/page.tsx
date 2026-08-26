"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { PLATE_DATA, lookupPlate, type PlateLookup } from "./plate-data";

const DESCRIPTION =
  "车牌在线查询工具，它提供全国各地车牌的序号，用户可以根据车牌查询用具快速了解车牌号属于的省市。";

export default function CarnumberPage() {
  const [query, setQuery] = useState("");

  const result = useMemo<PlateLookup | null>(() => {
    if (query.trim() === "") return null;
    return lookupPlate(query);
  }, [query]);

  const prefix = query.trim().length > 0 ? query.trim()[0] : "";
  const activeProvince = useMemo(
    () => PLATE_DATA.find((p) => p.prefix === prefix) ?? null,
    [prefix],
  );

  return (
    <ToolPageShell title="车牌归属地" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>输入车牌前缀</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            输入车牌前两位，例如 京A、沪B、粤B，自动识别所属省市。
          </p>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="例如 京A"
            className="w-[320px]"
          />

          {query.trim() !== "" && (
            <div className="mt-[16px]">
              {result ? (
                <div className="flex flex-col gap-[10px]">
                  <Row label="车牌前缀">
                    <span className="font-mono text-[20px] font-semibold text-[#242424]">
                      {result.prefix}
                      {result.letter}
                    </span>
                  </Row>
                  <Row label="所属省份">
                    {result.province}
                    <CopyButton text={result.province} label="复制" />
                  </Row>
                  <Row label="所属城市">
                    {result.city}
                    <CopyButton text={result.city} label="复制" />
                  </Row>
                </div>
              ) : (
                <p className="text-[13px] text-[#E5484D]">
                  未找到匹配结果，请确认输入的是合法的中国车牌前缀（如 京A）。
                </p>
              )}
            </div>
          )}
        </ToolCard>

        <ToolCard>
          <ToolLabel>省份字母分布</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            点击下方省份简称查看其字母对应的城市。
          </p>
          <div className="flex flex-wrap gap-[8px]">
            {PLATE_DATA.map((p) => (
              <button
                key={p.prefix}
                type="button"
                onClick={() => setQuery(p.prefix + "A")}
                className={`h-[36px] cursor-pointer rounded-[6px] border px-[12px] text-[14px] transition-colors ${
                  activeProvince?.prefix === p.prefix
                    ? "border-[#136CE9] bg-[#EEF3FE] text-[#136CE9]"
                    : "border-[#E5E7EB] bg-white text-[#242424] hover:bg-[#F6F7FA]"
                }`}
              >
                {p.prefix}
              </button>
            ))}
          </div>

          {activeProvince && (
            <div className="mt-[20px]">
              <div className="mb-[12px] text-[14px] font-medium text-[#242424]">
                {activeProvince.province}（{activeProvince.prefix}）
              </div>
              <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 lg:grid-cols-4">
                {activeProvince.cities.map((c) => (
                  <button
                    key={`${activeProvince.prefix}-${c.letter}`}
                    type="button"
                    onClick={() => setQuery(activeProvince.prefix + c.letter)}
                    className="flex items-center gap-[10px] rounded-[8px] border border-[#F6F7FA] bg-[#F6F7FA] px-[12px] py-[10px] text-left transition-colors hover:border-[#136CE9] hover:bg-white"
                  >
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[5px] bg-[#136CE9] font-mono text-[13px] font-semibold text-white">
                      {activeProvince.prefix}
                      {c.letter}
                    </span>
                    <span className="text-[13px] text-[#242424]">{c.city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <span className="w-[110px] shrink-0 text-[14px] text-[#8F8F8F]">{label}</span>
      <div className="flex flex-wrap items-center gap-[8px]">{children}</div>
    </div>
  );
}
