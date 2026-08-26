"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { SCHOOLS, type School } from "./school-data";

const DESCRIPTION =
  "高校查询可以快速找到中国境内知名大学的相关信息， 应用汇聚了全国各地的知名大学，包括清华大学、北京大学、南京大学、浙江大学、复旦大学、上海交通大学等等。能够帮助高考学生和家长们更好的选择学校。";

const TYPES = ["全部", "综合", "理工", "师范", "医药", "财经", "政法", "农林", "民族", "艺术", "语言", "军事", "体育"] as const;
type TypeFilter = (typeof TYPES)[number];

export default function SchoolPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("全部");
  const [only985, setOnly985] = useState(false);
  const [only211, setOnly211] = useState(false);
  const [active, setActive] = useState<School | null>(null);

  const provinces = useMemo(() => {
    const set = new Set(SCHOOLS.map((s) => s.province));
    return Array.from(set).sort();
  }, []);

  const [province, setProvince] = useState<string>("全部");

  const results = useMemo(() => {
    const q = query.trim();
    return SCHOOLS.filter((s) => {
      if (q !== "" && !s.name.includes(q) && !s.city.includes(q)) return false;
      if (type !== "全部" && s.type !== type) return false;
      if (province !== "全部" && s.province !== province) return false;
      if (only985 && !s.is985) return false;
      if (only211 && !s.is211) return false;
      return true;
    });
  }, [query, type, province, only985, only211]);

  return (
    <ToolPageShell title="高校查询" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
            搜索高校
          </label>
          <ToolInput
            value={query}
            onChange={setQuery}
            placeholder="输入校名或城市，例如 清华、武汉"
            className="w-[320px]"
          />
          <div className="mt-[14px] flex flex-wrap items-center gap-[8px]">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="h-[34px] cursor-pointer rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] text-[13px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              <option value="全部">全部省份</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TypeFilter)}
              className="h-[34px] cursor-pointer rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] text-[13px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t === "全部" ? "全部类型" : t}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setOnly985((v) => !v)}
              className={`h-[34px] cursor-pointer rounded-[6px] border px-[12px] text-[13px] transition-colors ${
                only985
                  ? "border-[#136CE9] bg-[#EEF3FE] text-[#136CE9]"
                  : "border-[#E5E7EB] bg-white text-[#242424] hover:bg-[#F6F7FA]"
              }`}
            >
              仅看985
            </button>
            <button
              type="button"
              onClick={() => setOnly211((v) => !v)}
              className={`h-[34px] cursor-pointer rounded-[6px] border px-[12px] text-[13px] transition-colors ${
                only211
                  ? "border-[#136CE9] bg-[#EEF3FE] text-[#136CE9]"
                  : "border-[#E5E7EB] bg-white text-[#242424] hover:bg-[#F6F7FA]"
              }`}
            >
              仅看211
            </button>
          </div>
          <div className="mt-[10px] text-[13px] text-[#8F8F8F]">
            共 {SCHOOLS.length} 所高校，匹配 {results.length} 所。
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              高校列表
            </label>
            <div className="flex max-h-[500px] flex-col overflow-y-auto pr-[4px]">
              {results.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setActive(s)}
                  className={`flex items-center justify-between border-b border-[#F6F7FA] py-[10px] text-left transition-colors last:border-0 hover:bg-[#F6F7FA] ${
                    active?.name === s.name ? "bg-[#EEF3FE]" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-[#242424]">{s.name}</span>
                    <span className="text-[12px] text-[#8F8F8F]">
                      {s.province} · {s.city} · {s.type}
                    </span>
                  </div>
                  <div className="flex gap-[4px]">
                    {s.is985 && <Tag color="#E53935">985</Tag>}
                    {s.is211 && <Tag color="#136CE9">211</Tag>}
                  </div>
                </button>
              ))}
              {results.length === 0 && (
                <p className="py-[20px] text-center text-[13px] text-[#8F8F8F]">
                  未找到匹配的高校。
                </p>
              )}
            </div>
          </ToolCard>

          <ToolCard>
            <label className="mb-[12px] block text-[14px] font-medium text-[#242424]">
              高校详情
            </label>
            {active ? (
              <div className="flex flex-col gap-[14px]">
                <div>
                  <div className="text-[24px] font-semibold text-[#242424]">{active.name}</div>
                  <div className="mt-[6px] flex flex-wrap gap-[4px]">
                    {active.tags.map((t) => (
                      <Tag key={t} color={t === "985" ? "#E53935" : "#136CE9"}>
                        {t}
                      </Tag>
                    ))}
                  </div>
                </div>
                <DetailRow label="所在地">{active.province} {active.city}</DetailRow>
                <DetailRow label="学校类型">{active.type}</DetailRow>
                <DetailRow label="985/211">
                  {active.is985 ? "985" : "非985"} · {active.is211 ? "211" : "非211"}
                </DetailRow>
                <DetailRow label="官方网站">
                  <a
                    href={active.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#136CE9] hover:underline"
                  >
                    {active.website}
                  </a>
                </DetailRow>
              </div>
            ) : (
              <p className="py-[30px] text-center text-[13px] text-[#8F8F8F]">
                从左侧列表选择一所高校查看详细信息。
              </p>
            )}
          </ToolCard>
        </div>
      </div>
    </ToolPageShell>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="rounded-[4px] px-[6px] py-[1px] text-[11px] font-medium text-white"
      style={{ background: color }}
    >
      {children}
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[12px] border-b border-[#F6F7FA] pb-[10px] last:border-0">
      <span className="w-[80px] shrink-0 text-[14px] text-[#8F8F8F]">{label}</span>
      <div className="flex-1 text-[14px] text-[#242424]">{children}</div>
    </div>
  );
}
