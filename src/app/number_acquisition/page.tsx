"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "快递信息提取是一款免费的快递信息提供工具，主要针对快递信息提取 例如：江西省成都市武侯区青江路15栋电话:15739223961 结果 省:江西省 市:成都市 县:武侯区 镇:武侯区 电话:15739223961";

const SAMPLE = "江西省成都市武侯区青江路15栋电话:15739223961";

type Fields = {
  province: string;
  city: string;
  district: string;
  town: string;
  phone: string;
  postcode: string;
  name: string;
  detail: string;
};

function extract(text: string): Fields {
  const result: Fields = {
    province: "",
    city: "",
    district: "",
    town: "",
    phone: "",
    postcode: "",
    name: "",
    detail: "",
  };
  if (!text.trim()) return result;

  // Phone: Chinese mobile 1[3-9]xxxxxxxxx
  const phoneMatch = text.match(/1[3-9]\d{9}/);
  if (phoneMatch) result.phone = phoneMatch[0];

  // Postcode: 6 digits — but avoid matching the 11-digit phone; require word
  // boundaries or non-digit surroundings.
  const postcodeMatch = text.match(/(?<!\d)(\d{6})(?!\d)/);
  if (postcodeMatch && postcodeMatch[1] !== result.phone.slice(0, 6)) {
    result.postcode = postcodeMatch[1];
  }

  // Province: XX省 / XX自治区 / XX市 (for municipalities like 北京市)
  const provinceMatch = text.match(/([一-龥]{2,8}(?:省|自治区|特别行政区))/);
  if (provinceMatch) {
    result.province = provinceMatch[1];
  } else {
    // Municipality: 北京市 / 上海市 / 天津市 / 重庆市 — province is the city.
    const muni = text.match(/([一-龥]{2,4}市)/);
    if (muni) result.province = muni[1];
  }

  // City: XX市
  const cityMatch = text.match(/([一-龥]{2,8}市)/);
  if (cityMatch) result.city = cityMatch[1];

  // District / County: XX区 / XX县 / XX旗 / XX市 (county-level city)
  const districtMatch = text.match(/([一-龥]{2,8}(?:区|县|旗|新区|高新区|经开区))/);
  if (districtMatch) {
    result.district = districtMatch[1];
  } else {
    // Fall back to XX县
    const countyMatch = text.match(/([一-龥]{2,6}县)/);
    if (countyMatch) result.district = countyMatch[1];
  }

  // Town / Street: XX镇 / XX乡 / XX街道 / XX村
  const townMatch = text.match(/([一-龥]{2,10}(?:镇|乡|街道|村|社区))/);
  if (townMatch) result.town = townMatch[1];

  // Name: optional patterns like 姓名:xxx / 收件人:xxx / xxx收
  const nameMatch =
    text.match(/(?:姓名|收件人|联系人|收货人)\s*[:：]?\s*([一-龥]{2,4})/) ??
    text.match(/([一-龥]{2,4})\s*(?:收|\(收\)|（收）)/);
  if (nameMatch) result.name = nameMatch[1];

  // Detail: everything after the last matched administrative unit, minus phone.
  const lastUnitEnd = Math.max(
    result.province ? text.lastIndexOf(result.province) + result.province.length : 0,
    result.city ? text.lastIndexOf(result.city) + result.city.length : 0,
    result.district ? text.lastIndexOf(result.district) + result.district.length : 0,
    result.town ? text.lastIndexOf(result.town) + result.town.length : 0,
  );
  let detail = text.slice(lastUnitEnd).trim();
  // Strip phone and postcode markers from detail for cleanliness.
  detail = detail
    .replace(/1[3-9]\d{9}/g, "")
    .replace(/(?<!\d)\d{6}(?!\d)/g, "")
    .replace(/(?:电话|手机|联系方式|邮编|邮政编码)\s*[:：]?\s*/g, "")
    .replace(/[,，。;\s]+$/g, "")
    .trim();
  result.detail = detail;

  return result;
}

export default function Page() {
  const [text, setText] = useState(SAMPLE);

  const fields = useMemo(() => extract(text), [text]);

  const rows: { key: string; label: string; value: string }[] = [
    { key: "province", label: "省 / 自治区 / 直辖市", value: fields.province },
    { key: "city", label: "市", value: fields.city },
    { key: "district", label: "区 / 县", value: fields.district },
    { key: "town", label: "镇 / 街道 / 乡", value: fields.town },
    { key: "phone", label: "电话", value: fields.phone },
    { key: "postcode", label: "邮政编码", value: fields.postcode },
    { key: "name", label: "姓名", value: fields.name },
    { key: "detail", label: "详细地址", value: fields.detail },
  ];

  const summary = useMemo(() => {
    return rows
      .filter((r) => r.value)
      .map((r) => `${r.label}: ${r.value}`)
      .join("  ");
  }, [rows]);

  const hasAny = rows.some((r) => r.value);

  return (
    <ToolPageShell title="快递信息提取" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>地址文本</ToolLabel>
          <ToolTextarea
            value={text}
            onChange={setText}
            placeholder="粘贴包含省市区、电话、邮编的地址文本……"
            rows={6}
          />
          <div className="mt-[12px] flex items-center gap-[8px]">
            <ToolButton variant="ghost" onClick={() => setText(SAMPLE)}>
              载入示例
            </ToolButton>
            <ToolButton variant="ghost" onClick={() => setText("")}>
              清空
            </ToolButton>
            {hasAny ? <CopyButton text={summary} label="复制结果" /> : null}
          </div>
        </ToolCard>

        <ToolCard>
          <ToolLabel>提取结果</ToolLabel>
          {!hasAny ? (
            <p className="text-[13px] text-[#8F8F8F]">
              请在上方输入地址文本，提取结果将在此显示。
            </p>
          ) : (
            <div className="overflow-hidden rounded-[8px] border border-[#F6F7FA]">
              <table className="w-full text-[14px]">
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key} className="border-b border-[#F6F7FA] last:border-b-0">
                      <td className="w-[180px] bg-[#FAFBFC] px-[14px] py-[10px] text-[#8F8F8F]">
                        {r.label}
                      </td>
                      <td className="px-[14px] py-[10px] font-mono text-[#242424]">
                        {r.value || <span className="text-[#B0B0B0]">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-[10px] text-[12px] text-[#B0B0B0]">
            基于正则表达式在浏览器本地提取，支持省/市/区县/镇街道/手机号/邮编/姓名。
          </p>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
