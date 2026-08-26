"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { DYNASTIES, type Dynasty } from "./dynasty-data";

const DESCRIPTION =
  "历史朝代查询是一款教育性和实用性兼备的在线工具，专为帮助用户快速查询和了解各个历史朝代的相关信息而设计。";

export default function DynastiesPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Dynasty | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (q === "") return DYNASTIES;
    return DYNASTIES.filter(
      (d) =>
        d.name.includes(q) ||
        d.founder.includes(q) ||
        d.capital.includes(q) ||
        d.intro.includes(q),
    );
  }, [query]);

  return (
    <ToolPageShell title="历史朝代查询" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>搜索朝代</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            可按朝代名、开国君主、都城或简介关键字搜索。
          </p>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="例如 唐、朱元璋、长安"
            className="w-[360px]"
          />
        </ToolCard>

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
          <ToolCard>
            <ToolLabel>朝代时间线</ToolLabel>
            <ol className="relative mt-[16px] border-l border-[#E5E7EB] pl-[20px]">
              {filtered.map((d) => (
                <li
                  key={d.name + d.start}
                  className="mb-[18px] cursor-pointer last:mb-0"
                  onClick={() => setActive(d)}
                >
                  <div
                    className={`flex items-start gap-[10px] rounded-[8px] px-[10px] py-[10px] transition-colors hover:bg-[#F6F7FA] ${
                      active?.name === d.name && active?.start === d.start
                        ? "bg-[#EEF3FE]"
                        : ""
                    }`}
                  >
                    <span className="mt-[6px] inline-block h-[8px] w-[8px] shrink-0 rounded-full bg-[#136CE9]" />
                    <div>
                      <div className="text-[15px] font-medium text-[#242424]">
                        {d.name}
                      </div>
                      <div className="mt-[2px] text-[13px] text-[#8F8F8F]">
                        {d.start} — {d.end}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="text-[13px] text-[#8F8F8F]">未找到匹配的朝代。</li>
              )}
            </ol>
          </ToolCard>

          <ToolCard>
            <ToolLabel>朝代详情</ToolLabel>
            {active ? (
              <div className="mt-[16px] flex flex-col gap-[12px]">
                <DetailRow label="朝代">
                  <span className="text-[18px] font-semibold text-[#242424]">
                    {active.name}
                  </span>
                </DetailRow>
                <DetailRow label="起止年份">
                  {active.start} — {active.end}
                </DetailRow>
                <DetailRow label="开国君主">{active.founder}</DetailRow>
                <DetailRow label="都城">{active.capital}</DetailRow>
                <div className="mt-[8px] rounded-[8px] bg-[#F6F7FA] px-[14px] py-[14px] text-[14px] leading-[24px] text-[#242424]">
                  {active.intro}
                </div>
              </div>
            ) : (
              <p className="mt-[16px] text-[13px] text-[#8F8F8F]">
                点击左侧时间线中的任一朝代查看详细信息。
              </p>
            )}
          </ToolCard>
        </div>
      </div>
    </ToolPageShell>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-[8px]">
      <span className="w-[90px] shrink-0 text-[14px] text-[#8F8F8F]">{label}</span>
      <div className="flex-1 text-[14px] text-[#242424]">{children}</div>
    </div>
  );
}
