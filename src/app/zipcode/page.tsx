"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { POSTAL_DATA, lookupByZip, type ZipLookup } from "./zipcode-data";

const DESCRIPTION =
  "邮编查询工具是一款免费的邮政编码查询工具，可以帮助用户查询全国各地的邮政编码信息。";

export default function ZipcodePage() {
  const [province, setProvince] = useState("");
  const [zipQuery, setZipQuery] = useState("");

  const provinceObj = useMemo(
    () => POSTAL_DATA.find((p) => p.province === province) ?? null,
    [province],
  );

  const zipResults = useMemo<ZipLookup[]>(() => {
    if (zipQuery.trim() === "") return [];
    return lookupByZip(zipQuery);
  }, [zipQuery]);

  return (
    <ToolPageShell title="邮编查询" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        {/* 方式一：省 -> 市 -> 邮编 */}
        <ToolCard>
          <ToolLabel>按省市查询邮编</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            选择省份和城市，查看对应的邮政编码。
          </p>
          <div className="flex flex-wrap items-center gap-[12px]">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              <option value="">请选择省份</option>
              {POSTAL_DATA.map((p) => (
                <option key={p.province} value={p.province}>
                  {p.province}
                </option>
              ))}
            </select>

            {provinceObj && (
              <div className="text-[14px] text-[#8F8F8F]">
                共 {provinceObj.cities.length} 个地区
              </div>
            )}
          </div>

          {provinceObj && (
            <div className="mt-[16px] grid grid-cols-2 gap-[8px] md:grid-cols-3 lg:grid-cols-4">
              {provinceObj.cities.map((c) => (
                <div
                  key={c.city + c.zip}
                  className="flex items-center justify-between rounded-[8px] border border-[#F6F7FA] bg-[#F6F7FA] px-[12px] py-[10px]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium text-[#242424]">
                      {c.city}
                    </div>
                    <div className="mt-[2px] font-mono text-[13px] text-[#136CE9]">
                      {c.zip}
                    </div>
                  </div>
                  <CopyButton text={c.zip} label="复制" />
                </div>
              ))}
            </div>
          )}
        </ToolCard>

        {/* 方式二：邮编 -> 地区 */}
        <ToolCard>
          <ToolLabel>按邮编查询地区</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            输入 6 位邮政编码（可只输入前几位进行模糊匹配）查询对应省市。
          </p>
          <ToolInput
            value={zipQuery}
            onChange={setZipQuery}
            placeholder="例如 100000 或 518"
            className="w-[260px]"
          />

          {zipQuery.trim() !== "" && (
            <div className="mt-[16px]">
              {zipResults.length > 0 ? (
                <div className="flex flex-col gap-[10px]">
                  {zipResults.map((r, i) => (
                    <div
                      key={`${r.province}-${r.city}-${i}`}
                      className="flex flex-wrap items-center gap-[8px] rounded-[8px] border border-[#F6F7FA] bg-[#F6F7FA] px-[14px] py-[10px]"
                    >
                      <span className="font-mono text-[18px] font-semibold text-[#136CE9]">
                        {r.zip}
                      </span>
                      <CopyButton text={r.zip} label="复制" />
                      <span className="mx-[8px] text-[#D8DCE3]">|</span>
                      <span className="text-[14px] text-[#242424]">
                        {r.province} · {r.city}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#E5484D]">
                  未找到匹配地区，请确认邮编是否正确。
                </p>
              )}
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
