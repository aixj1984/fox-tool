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
import {
  AREA_CODES,
  lookupByCode,
  lookupByCity,
  type AreaCodeEntry,
} from "./area-code-data";

const DESCRIPTION =
  "电话区号查询工具，它提供了各地电话的序号，用户根据需要拨打的电话快速了解所拨打的电话数据那个地区。";

type Mode = "code" | "city";

export default function PhonenumberPage() {
  const [mode, setMode] = useState<Mode>("code");
  const [query, setQuery] = useState("");

  const results = useMemo<AreaCodeEntry[]>(() => {
    const q = query.trim();
    if (q === "") return [];
    return mode === "code" ? lookupByCode(q) : lookupByCity(q);
  }, [query, mode]);

  // Group all entries by province for the browse section.
  const grouped = useMemo(() => {
    const map = new Map<string, AreaCodeEntry[]>();
    for (const e of AREA_CODES) {
      const list = map.get(e.province) ?? [];
      list.push(e);
      map.set(e.province, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "zh"));
  }, []);

  return (
    <ToolPageShell title="电话区号查询" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>查询方式</ToolLabel>
          <div className="mb-[16px] flex gap-[8px]">
            <ToolButton
              variant={mode === "code" ? "primary" : "ghost"}
              onClick={() => {
                setMode("code");
                setQuery("");
              }}
              className="h-[36px] px-[16px] text-[13px]"
            >
              按区号查城市
            </ToolButton>
            <ToolButton
              variant={mode === "city" ? "primary" : "ghost"}
              onClick={() => {
                setMode("city");
                setQuery("");
              }}
              className="h-[36px] px-[16px] text-[13px]"
            >
              按城市查区号
            </ToolButton>
          </div>

          {mode === "code" ? (
            <>
              <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
                输入电话区号（如 010、021、0755）查询对应的城市与省份。
              </p>
              <ToolInput
                value={query}
                onChange={setQuery}
                placeholder="例如 010"
                className="w-[320px]"
              />
            </>
          ) : (
            <>
              <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
                输入城市或省份名称（如 北京、广州、广东）查询对应区号。
              </p>
              <ToolInput
                value={query}
                onChange={setQuery}
                placeholder="例如 广州"
                className="w-[320px]"
              />
            </>
          )}

          {query.trim() !== "" && (
            <div className="mt-[16px]">
              {results.length > 0 ? (
                <div className="flex flex-col gap-[10px]">
                  {results.map((r, i) => (
                    <div
                      key={`${r.code}-${r.city}-${i}`}
                      className="flex flex-wrap items-center gap-[8px] rounded-[8px] border border-[#F6F7FA] bg-[#F6F7FA] px-[14px] py-[10px]"
                    >
                      <span className="w-[110px] shrink-0 text-[14px] text-[#8F8F8F]">
                        区号
                      </span>
                      <span className="font-mono text-[18px] font-semibold text-[#136CE9]">
                        {r.code}
                      </span>
                      <CopyButton text={r.code} label="复制" />
                      <span className="mx-[8px] text-[#D8DCE3]">|</span>
                      <span className="text-[14px] text-[#242424]">
                        {r.city}（{r.province}）
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#E5484D]">
                  未找到匹配结果，请检查输入是否正确。
                </p>
              )}
            </div>
          )}
        </ToolCard>

        <ToolCard>
          <ToolLabel>全国区号一览</ToolLabel>
          <p className="mb-[16px] text-[13px] text-[#8F8F8F]">
            按省份分组展示主要城市区号，点击任意条目可快速填入查询。
          </p>
          <div className="flex flex-col gap-[16px]">
            {grouped.map(([province, list]) => (
              <div key={province}>
                <div className="mb-[8px] text-[14px] font-medium text-[#242424]">
                  {province}
                </div>
                <div className="grid grid-cols-2 gap-[8px] md:grid-cols-3 lg:grid-cols-4">
                  {list.map((r, i) => (
                    <button
                      key={`${r.code}-${r.city}-${i}`}
                      type="button"
                      onClick={() => {
                        setMode("code");
                        setQuery(r.code);
                      }}
                      className="flex items-center gap-[8px] rounded-[8px] border border-[#F6F7FA] bg-[#F6F7FA] px-[10px] py-[8px] text-left transition-colors hover:border-[#136CE9] hover:bg-white"
                    >
                      <span className="font-mono text-[14px] font-semibold text-[#136CE9]">
                        {r.code}
                      </span>
                      <span className="truncate text-[13px] text-[#242424]">
                        {r.city}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
