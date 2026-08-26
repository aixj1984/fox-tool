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

const DESCRIPTION =
  "五险一金计算是一款实用的在线工具，专为帮助用户计算五险一金缴费金额而设计。通过这款工具，您可以根据税前月薪、社保基数、公积金基数、是否汇缴公积金、单位与个人汇缴比例等参数，快速计算出个人和单位需要缴纳的五险一金金额。";

// Standard Chinese rates (percentages of base). 工伤 & 生育 are employer-only.
const RATES = {
  pension: { personal: 8, employer: 16 },
  medical: { personal: 2, employer: 8 }, // employer 医疗 varies by city; 8% is a common figure
  unemployment: { personal: 0.5, employer: 0.5 },
  workInjury: { personal: 0, employer: 0.5 }, // 工伤 employer-only, ~0.2-1.9% — using 0.5%
  maternity: { personal: 0, employer: 0.8 }, // 生育 employer-only
} as const;

function fmtMoney(n: number): string {
  return n.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type Item = {
  name: string;
  personal: number;
  employer: number;
  personalRate: number;
  employerRate: number;
  base: number;
};

export default function Page() {
  const [salary, setSalary] = useState("10000");
  const [socialBase, setSocialBase] = useState("10000");
  const [housingBase, setHousingBase] = useState("10000");
  const [housingRate, setHousingRate] = useState("12");
  const [withHousing, setWithHousing] = useState(true);

  const result = useMemo(() => {
    const sal = parseFloat(salary);
    const sb = parseFloat(socialBase);
    const hb = parseFloat(housingBase);
    const hr = parseFloat(housingRate);
    if (!sal || sal <= 0) return null;
    const social = sb > 0 ? sb : sal;
    const housing = hb > 0 ? hb : sal;
    const rate = (hr || 0) / 100;

    const items: Item[] = [
      {
        name: "养老保险",
        personalRate: RATES.pension.personal,
        employerRate: RATES.pension.employer,
        base: social,
        personal: (social * RATES.pension.personal) / 100,
        employer: (social * RATES.pension.employer) / 100,
      },
      {
        name: "医疗保险",
        personalRate: RATES.medical.personal,
        employerRate: RATES.medical.employer,
        base: social,
        personal: (social * RATES.medical.personal) / 100,
        employer: (social * RATES.medical.employer) / 100,
      },
      {
        name: "失业保险",
        personalRate: RATES.unemployment.personal,
        employerRate: RATES.unemployment.employer,
        base: social,
        personal: (social * RATES.unemployment.personal) / 100,
        employer: (social * RATES.unemployment.employer) / 100,
      },
      {
        name: "工伤保险",
        personalRate: RATES.workInjury.personal,
        employerRate: RATES.workInjury.employer,
        base: social,
        personal: 0,
        employer: (social * RATES.workInjury.employer) / 100,
      },
      {
        name: "生育保险",
        personalRate: RATES.maternity.personal,
        employerRate: RATES.maternity.employer,
        base: social,
        personal: 0,
        employer: (social * RATES.maternity.employer) / 100,
      },
    ];
    if (withHousing && rate > 0) {
      items.push({
        name: "住房公积金",
        personalRate: hr,
        employerRate: hr,
        base: housing,
        personal: housing * rate,
        employer: housing * rate,
      });
    }

    const personalTotal = items.reduce((s, i) => s + i.personal, 0);
    const employerTotal = items.reduce((s, i) => s + i.employer, 0);
    const afterTax = sal - personalTotal;
    return { items, personalTotal, employerTotal, afterTax, total: personalTotal + employerTotal };
  }, [salary, socialBase, housingBase, housingRate, withHousing]);

  return (
    <ToolPageShell title="五险一金计算" description={DESCRIPTION}>
      <div className="grid gap-[20px] lg:grid-cols-[380px_1fr]">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>税前月薪（元）</ToolLabel>
            <ToolInput type="number" value={salary} onChange={setSalary} placeholder="例如 10000" />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>社保基数（元，留空默认为月薪）</ToolLabel>
            <ToolInput type="number" value={socialBase} onChange={setSocialBase} placeholder="例如 10000" />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>公积金基数（元，留空默认为月薪）</ToolLabel>
            <ToolInput type="number" value={housingBase} onChange={setHousingBase} placeholder="例如 10000" />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>公积金缴存比例（%）</ToolLabel>
            <ToolInput type="number" value={housingRate} onChange={setHousingRate} placeholder="5 - 12，例如 12" />
          </div>
          <div className="mb-[20px] flex items-center gap-[8px]">
            <input
              id="housing"
              type="checkbox"
              checked={withHousing}
              onChange={(e) => setWithHousing(e.target.checked)}
              className="h-[16px] w-[16px] cursor-pointer accent-[#136CE9]"
            />
            <label htmlFor="housing" className="text-[14px] text-[#242424]">
              计算住房公积金
            </label>
          </div>
          <div className="rounded-[8px] bg-[#F6F7FA] p-[12px] text-[12px] leading-[20px] text-[#8F8F8F]">
            参考费率：养老 个人8%/单位16%，医疗 个人2%/单位8%，失业 各0.5%，
            工伤 单位0.5%，生育 单位0.8%。各地略有差异，请以当地政策为准。
          </div>
        </ToolCard>

        <ToolCard>
          {result ? (
            <div>
              <div className="grid grid-cols-3 gap-[12px]">
                <Stat label="个人缴纳" value={`¥${fmtMoney(result.personalTotal)}`} />
                <Stat label="单位缴纳" value={`¥${fmtMoney(result.employerTotal)}`} />
                <Stat label="合计缴纳" value={`¥${fmtMoney(result.total)}`} highlight />
              </div>
              <div className="mt-[10px] text-[13px] text-[#242424]">
                税后到手（五险一金部分）：
                <span className="font-semibold text-[#16A34A]">
                  ¥{fmtMoney(result.afterTax)}
                </span>
              </div>

              <div className="mt-[20px] mb-[8px] text-[15px] font-semibold text-[#242424]">
                缴费明细
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-left text-[#8F8F8F]">
                      <th className="py-[8px] pr-[12px] font-medium">险种</th>
                      <th className="py-[8px] pr-[12px] font-medium">基数</th>
                      <th className="py-[8px] pr-[12px] font-medium">个人比例</th>
                      <th className="py-[8px] pr-[12px] font-medium">个人金额</th>
                      <th className="py-[8px] pr-[12px] font-medium">单位比例</th>
                      <th className="py-[8px] font-medium">单位金额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item) => (
                      <tr key={item.name} className="border-b border-[#F2F3F5] text-[#242424]">
                        <td className="py-[8px] pr-[12px] font-medium">{item.name}</td>
                        <td className="py-[8px] pr-[12px]">{fmtMoney(item.base)}</td>
                        <td className="py-[8px] pr-[12px]">{item.personalRate}%</td>
                        <td className="py-[8px] pr-[12px] text-[#136CE9]">¥{fmtMoney(item.personal)}</td>
                        <td className="py-[8px] pr-[12px]">{item.employerRate}%</td>
                        <td className="py-[8px] text-[#EA8A00]">¥{fmtMoney(item.employer)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-[#E5E7EB] text-[#242424]">
                      <td className="py-[10px] pr-[12px] font-semibold" colSpan={3}>合计</td>
                      <td className="py-[10px] pr-[12px] font-semibold text-[#136CE9]">
                        ¥{fmtMoney(result.personalTotal)}
                      </td>
                      <td />
                      <td className="py-[10px] font-semibold text-[#EA8A00]">
                        ¥{fmtMoney(result.employerTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-[12px]">
                <CopyButton
                  text={
                    `税前月薪：¥${fmtMoney(parseFloat(salary))}\n` +
                    `个人缴纳：¥${fmtMoney(result.personalTotal)}\n` +
                    `单位缴纳：¥${fmtMoney(result.employerTotal)}\n` +
                    `合计缴纳：¥${fmtMoney(result.total)}\n` +
                    `税后到手：¥${fmtMoney(result.afterTax)}`
                  }
                  label="复制结果"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-[#8F8F8F]">
              请输入有效的月薪数据
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[8px] p-[14px] ${
        highlight ? "bg-[#FEF3C7]" : "bg-[#F6F7FA]"
      }`}
    >
      <div className="text-[12px] text-[#8F8F8F]">{label}</div>
      <div
        className={`mt-[4px] text-[18px] font-semibold ${
          highlight ? "text-[#EA8A00]" : "text-[#242424]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
