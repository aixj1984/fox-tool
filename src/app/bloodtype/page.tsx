"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "血型遗传是一款专业的的血型遗传查询工具，可以为用户提供全面的血型遗传信息可以快速计算出后代血型，可以为您带来非常重要的参考和信息帮助";

type BloodType = "A" | "B" | "AB" | "O";

// ABO 等位基因：A、B 为显性共显性，O 为隐性
// 基因型 -> 表现型
// AA、AO -> A
// BB、BO -> B
// AB -> AB
// OO -> O
const GENOTYPES: Record<BloodType, string[]> = {
  A: ["AA", "AO"],
  B: ["BB", "BO"],
  AB: ["AB"],
  O: ["OO"],
};

const PHENOTYPE_OF: Record<string, BloodType> = {
  AA: "A",
  AO: "A",
  OA: "A",
  BB: "B",
  BO: "B",
  OB: "B",
  AB: "AB",
  BA: "AB",
  OO: "O",
};

function possibleGenotypes(bt: BloodType): string[] {
  return GENOTYPES[bt];
}

function crossGenotypes(g1: string, g2: string): string[] {
  // 每个亲本贡献一个等位基因
  const children: string[] = [];
  for (const a of g1) {
    for (const b of g2) {
      children.push(a + b);
    }
  }
  return children;
}

function childProbabilities(p1: BloodType, p2: BloodType): Record<BloodType, number> {
  const g1List = possibleGenotypes(p1);
  const g2List = possibleGenotypes(p2);
  // 考虑亲本基因型不确定，按等概率加权
  const counts: Record<BloodType, number> = { A: 0, B: 0, AB: 0, O: 0 };
  let total = 0;
  for (const g1 of g1List) {
    for (const g2 of g2List) {
      const kids = crossGenotypes(g1, g2);
      for (const k of kids) {
        counts[PHENOTYPE_OF[k]] += 1;
        total += 1;
      }
    }
  }
  const result: Record<BloodType, number> = { A: 0, B: 0, AB: 0, O: 0 };
  if (total === 0) return result;
  (Object.keys(counts) as BloodType[]).forEach((k) => {
    result[k] = counts[k] / total;
  });
  return result;
}

function possibleOtherParents(
  child: BloodType,
  known: BloodType,
): { type: BloodType; prob: number }[] {
  const out: { type: BloodType; prob: number }[] = [];
  const others: BloodType[] = ["A", "B", "AB", "O"];
  for (const other of others) {
    const probs = childProbabilities(known, other);
    const p = probs[child];
    if (p > 0) {
      out.push({ type: other, prob: p });
    }
  }
  // 按概率降序
  out.sort((a, b) => b.prob - a.prob);
  return out;
}

const BLOOD_COLORS: Record<BloodType, string> = {
  A: "#E5484D",
  B: "#306CFE",
  AB: "#9C6ADE",
  O: "#F5A524",
};

export default function Page() {
  const [mode, setMode] = useState<"child" | "parent">("child");
  const [p1, setP1] = useState<BloodType>("A");
  const [p2, setP2] = useState<BloodType>("B");
  const [child, setChild] = useState<BloodType>("O");
  const [known, setKnown] = useState<BloodType>("A");

  const childResult = useMemo(() => childProbabilities(p1, p2), [p1, p2]);
  const parentResult = useMemo(
    () => possibleOtherParents(child, known),
    [child, known],
  );

  const allTypes: BloodType[] = ["A", "B", "AB", "O"];

  return (
    <ToolPageShell title="血型遗传规律" description={DESCRIPTION}>
      <div className="max-w-[860px]">
        <div className="mb-[16px] flex gap-[8px]">
          <ToolButton
            variant={mode === "child" ? "primary" : "ghost"}
            onClick={() => setMode("child")}
          >
            推算子女血型
          </ToolButton>
          <ToolButton
            variant={mode === "parent" ? "primary" : "ghost"}
            onClick={() => setMode("parent")}
          >
            反推父母血型
          </ToolButton>
        </div>

        {mode === "child" ? (
          <ToolCard>
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2">
              <div>
                <ToolLabel>父亲血型</ToolLabel>
                <BloodTypeSelector value={p1} onChange={setP1} />
              </div>
              <div>
                <ToolLabel>母亲血型</ToolLabel>
                <BloodTypeSelector value={p2} onChange={setP2} />
              </div>
            </div>

            <div className="mt-[24px]">
              <ToolLabel>子女可能的血型</ToolLabel>
              <div className="grid grid-cols-2 gap-[12px] md:grid-cols-4">
                {allTypes.map((bt) => {
                  const prob = childResult[bt];
                  const possible = prob > 0;
                  return (
                    <div
                      key={bt}
                      className={`rounded-[10px] border p-[16px] text-center ${
                        possible
                          ? "border-[#E5E7EB] bg-[#F6F7FA]"
                          : "border-dashed border-[#E5E7EB] bg-[#FAFAFA] opacity-50"
                      }`}
                    >
                      <div
                        className="mx-auto mb-[8px] flex h-[44px] w-[44px] items-center justify-center rounded-full text-[18px] font-bold text-white"
                        style={{ background: BLOOD_COLORS[bt] }}
                      >
                        {bt}
                      </div>
                      <div className="text-[13px] text-[#8F8F8F]">
                        {possible ? `${(prob * 100).toFixed(1)}%` : "不可能"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-[20px] rounded-[10px] bg-[#F6F7FA] p-[16px] text-[13px] leading-[22px] text-[#5A5A5A]">
              <strong className="text-[#242424]">遗传学解释：</strong>
              <br />
              ABO 血型由三个等位基因 A、B、O 决定。A 和 B 为显性共显性，O 为隐性。
              父亲 {p1} 型的基因型可能是 {GENOTYPES[p1].join(" 或 ")}，母亲 {p2} 型的基因型可能是{" "}
              {GENOTYPES[p2].join(" 或 ")}。各自随机贡献一个等位基因给后代，组合后形成子女血型。
            </div>
          </ToolCard>
        ) : (
          <ToolCard>
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2">
              <div>
                <ToolLabel>子女血型</ToolLabel>
                <BloodTypeSelector value={child} onChange={setChild} />
              </div>
              <div>
                <ToolLabel>已知父亲血型</ToolLabel>
                <BloodTypeSelector value={known} onChange={setKnown} />
              </div>
            </div>

            <div className="mt-[24px]">
              <ToolLabel>另一方母亲可能的血型</ToolLabel>
              {parentResult.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-[24px] text-center text-[14px] text-[#8F8F8F]">
                  在已知条件下不存在能生出 {child} 型子女的母亲血型（请检查输入）
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[12px] md:grid-cols-4">
                  {allTypes.map((bt) => {
                    const found = parentResult.find((r) => r.type === bt);
                    const possible = !!found;
                    return (
                      <div
                        key={bt}
                        className={`rounded-[10px] border p-[16px] text-center ${
                          possible
                            ? "border-[#E5E7EB] bg-[#F6F7FA]"
                            : "border-dashed border-[#E5E7EB] bg-[#FAFAFA] opacity-50"
                        }`}
                      >
                        <div
                          className="mx-auto mb-[8px] flex h-[44px] w-[44px] items-center justify-center rounded-full text-[18px] font-bold text-white"
                          style={{ background: BLOOD_COLORS[bt] }}
                        >
                          {bt}
                        </div>
                        <div className="text-[13px] text-[#8F8F8F]">
                          {possible
                            ? `可产生 ${(found!.prob * 100).toFixed(1)}%`
                            : "不可能"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-[20px] rounded-[10px] bg-[#F6F7FA] p-[16px] text-[13px] leading-[22px] text-[#5A5A5A]">
              <strong className="text-[#242424]">说明：</strong>
              <br />
              已知父亲为 {known} 型，子女为 {child} 型时，反推母亲可能的血型及其产生该子女血型的概率。
              若某血型未显示则表示在遗传规律下不可能产生该子女血型。实际推断还需结合 Rh 因子等更多遗传信息，本工具仅作 ABO 系统参考。
            </div>
          </ToolCard>
        )}

        <div className="mt-[20px] rounded-[10px] border border-[#F6F7FA] bg-white p-[16px] text-[13px] leading-[22px] text-[#8F8F8F] shadow-[0_0_10px_0_rgba(0,0,0,0.06)]">
          <strong className="text-[#242424]">ABO 血型遗传规律参考表</strong>
          <div className="mt-[12px] overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F6F7FA] text-[#5A5A5A]">
                  <th className="p-[8px] text-left">父母血型</th>
                  <th className="p-[8px] text-left">子女可能血型</th>
                  <th className="p-[8px] text-left">子女不可能血型</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["A × A", "A、O", "B、AB"],
                  ["A × B", "A、B、AB、O", "—"],
                  ["A × AB", "A、B、AB", "O"],
                  ["A × O", "A、O", "B、AB"],
                  ["B × B", "B、O", "A、AB"],
                  ["B × AB", "A、B、AB", "O"],
                  ["B × O", "B、O", "A、AB"],
                  ["AB × AB", "A、B、AB", "O"],
                  ["AB × O", "A、B", "AB、O"],
                  ["O × O", "O", "A、B、AB"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-[#F1F2F5]">
                    <td className="p-[8px] font-medium text-[#242424]">{row[0]}</td>
                    <td className="p-[8px] text-[#242424]">{row[1]}</td>
                    <td className="p-[8px] text-[#8F8F8F]">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}

function BloodTypeSelector({
  value,
  onChange,
}: {
  value: BloodType;
  onChange: (v: BloodType) => void;
}) {
  const types: BloodType[] = ["A", "B", "AB", "O"];
  return (
    <div className="flex gap-[8px]">
      {types.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`flex h-[40px] w-[64px] items-center justify-center rounded-[8px] text-[16px] font-bold transition-colors ${
            value === t
              ? "text-white"
              : "bg-[#F6F7FA] text-[#5A5A5A] hover:bg-[#ebedf2]"
          }`}
          style={value === t ? { background: BLOOD_COLORS[t] } : undefined}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
