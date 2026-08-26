"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  KINSHIP_ENTRIES,
  resolveChain,
  STEP_LABEL,
  STEP_OPTIONS,
  type KinshipEntry,
  type Sex,
  type Step,
} from "./kinship";

const DESCRIPTION =
  "亲戚关系计算可以帮助用户快速计算两个或多个对象之间复杂的亲戚关系。亲戚关系计算操作简单易用，只需要打开工具，选择需要计算的亲戚关系，点击\"计算\"按钮即可得到准确的计算结果。";

export default function Page() {
  const [mode, setMode] = useState<"chain" | "lookup">("chain");
  const [egoSex, setEgoSex] = useState<Sex>("M");
  const [steps, setSteps] = useState<Step[]>([]);
  const [query, setQuery] = useState<string>("");

  const result = useMemo(() => {
    if (steps.length === 0) return null;
    return resolveChain(egoSex, steps);
  }, [egoSex, steps]);

  const addStep = (s: Step) => {
    setSteps((prev) => [...prev, s]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSteps = () => setSteps([]);

  const filteredEntries = useMemo(() => {
    const q = query.trim();
    if (!q) return KINSHIP_ENTRIES;
    return KINSHIP_ENTRIES.filter(
      (e) =>
        e.term.includes(q) ||
        (e.altTerms && e.altTerms.some((a) => a.includes(q))) ||
        e.description.includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, KinshipEntry[]>();
    for (const e of filteredEntries) {
      const arr = map.get(e.category) ?? [];
      arr.push(e);
      map.set(e.category, arr);
    }
    return Array.from(map.entries());
  }, [filteredEntries]);

  return (
    <ToolPageShell title="亲戚关系计算" description={DESCRIPTION}>
      <div className="mb-[16px] flex gap-[8px]">
        <ToolButton
          variant={mode === "chain" ? "primary" : "ghost"}
          onClick={() => setMode("chain")}
        >
          关系链计算
        </ToolButton>
        <ToolButton
          variant={mode === "lookup" ? "primary" : "ghost"}
          onClick={() => setMode("lookup")}
        >
          称谓查询
        </ToolButton>
      </div>

      {mode === "chain" ? (
        <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[1fr_360px]">
          <ToolCard>
            <div className="mb-[16px]">
              <ToolLabel>我的性别</ToolLabel>
              <div className="flex gap-[8px]">
                <button
                  type="button"
                  onClick={() => setEgoSex("M")}
                  className={`h-[36px] rounded-[8px] px-[16px] text-[14px] font-medium ${
                    egoSex === "M"
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#5A5A5A]"
                  }`}
                >
                  男
                </button>
                <button
                  type="button"
                  onClick={() => setEgoSex("F")}
                  className={`h-[36px] rounded-[8px] px-[16px] text-[14px] font-medium ${
                    egoSex === "F"
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#5A5A5A]"
                  }`}
                >
                  女
                </button>
              </div>
            </div>

            <ToolLabel>已选关系链</ToolLabel>
            <div className="mb-[16px] min-h-[44px] rounded-[8px] border border-[#E5E7EB] bg-[#FAFAFA] p-[10px]">
              {steps.length === 0 ? (
                <span className="text-[13px] text-[#8F8F8F]">从下方选择亲属关系组成关系链</span>
              ) : (
                <div className="flex flex-wrap items-center gap-[6px]">
                  <span className="text-[13px] font-medium text-[#136CE9]">我</span>
                  {steps.map((s, i) => (
                    <span key={i} className="flex items-center gap-[4px]">
                      <span className="text-[#8F8F8F]">→</span>
                      <span
                        className="inline-flex items-center gap-[4px] rounded-full bg-[#136CE9]/10 px-[10px] py-[2px] text-[13px] text-[#136CE9]"
                      >
                        {STEP_LABEL[s]}
                        <button
                          type="button"
                          onClick={() => removeStep(i)}
                          className="ml-[2px] text-[12px] text-[#136CE9] hover:text-[#E5484D]"
                          aria-label={`移除 ${STEP_LABEL[s]}`}
                        >
                          ✕
                        </button>
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ToolLabel>添加关系</ToolLabel>
            <div className="grid grid-cols-2 gap-[8px] md:grid-cols-5">
              {STEP_OPTIONS.map((opt) => (
                <button
                  key={opt.step}
                  type="button"
                  onClick={() => addStep(opt.step)}
                  className="h-[36px] rounded-[8px] bg-[#F6F7FA] text-[13px] text-[#242424] transition-colors hover:bg-[#ebedf2]"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-[16px] flex gap-[8px]">
              <ToolButton onClick={clearSteps} variant="ghost">
                清空
              </ToolButton>
            </div>

            {result ? (
              <div className="mt-[20px] rounded-[10px] bg-gradient-to-br from-[#EEF3FE] to-[#E1EBFD] p-[20px] text-center">
                <div className="mb-[6px] text-[13px] text-[#8F8F8F]">计算结果</div>
                <div className="text-[32px] font-bold text-[#136CE9]">
                  {result.term}
                </div>
                <div className="mt-[8px] text-[13px] text-[#5A5A5A]">
                  我{result.chain.length > 0 ? ` → ${result.chain.join(" → ")}` : ""} = {result.term}
                </div>
              </div>
            ) : null}

            <div className="mt-[16px] rounded-[8px] bg-[#F6F7FA] p-[12px] text-[12px] leading-[18px] text-[#8F8F8F]">
              <strong className="text-[#5A5A5A]">使用说明：</strong>
              先设置&ldquo;我的性别&rdquo;，然后依次点击关系按钮组成关系链（如：父亲 → 哥哥 → 妻子），
              结果区域会自动计算最终称谓。支持直系、旁系、姻亲的常见组合；
              超出已实现范围的复杂关系会标注&ldquo;未知关系&rdquo;。
            </div>
          </ToolCard>

          <ToolCard>
            <ToolLabel>常见关系示例</ToolLabel>
            <div className="mt-[8px] space-y-[10px] text-[13px] text-[#5A5A5A]">
              {[
                ["父亲的哥哥", "伯父"],
                ["父亲的弟弟", "叔父"],
                ["父亲的姐妹", "姑母"],
                ["母亲的兄弟", "舅父"],
                ["母亲的姐妹", "姨母"],
                ["父亲的父亲的父亲", "曾祖父"],
                ["母亲的父亲", "外祖父"],
                ["儿子的儿子", "孙子"],
                ["女儿的儿子", "外孙"],
                ["哥哥的妻子", "嫂子"],
                ["姐妹的儿子", "外甥"],
                ["兄弟的儿子", "侄子"],
                ["丈夫的父亲", "公公"],
                ["妻子的父亲", "岳父"],
              ].map(([chain, term]) => (
                <div
                  key={chain}
                  className="flex cursor-default items-center justify-between rounded-[6px] bg-[#FAFAFA] px-[10px] py-[6px]"
                >
                  <span className="text-[#5A5A5A]">{chain}</span>
                  <span className="font-medium text-[#136CE9]">{term}</span>
                </div>
              ))}
            </div>
          </ToolCard>
        </div>
      ) : (
        <ToolCard>
          <ToolLabel>搜索称谓</ToolLabel>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入称谓或关键字，如 舅舅/姑父/堂兄/外甥"
            className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
          />

          <div className="mt-[20px] space-y-[20px]">
            {grouped.map(([category, entries]) => (
              <div key={category}>
                <div className="mb-[10px] text-[14px] font-semibold text-[#242424]">
                  {category}
                </div>
                <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2 lg:grid-cols-3">
                  {entries.map((e) => (
                    <div
                      key={e.term}
                      className="rounded-[8px] border border-[#F1F2F5] bg-[#FAFAFA] p-[12px]"
                    >
                      <div className="flex items-baseline gap-[6px]">
                        <span className="text-[15px] font-semibold text-[#136CE9]">
                          {e.term}
                        </span>
                        {e.altTerms && e.altTerms.length > 0 ? (
                          <span className="text-[12px] text-[#8F8F8F]">
                            又称：{e.altTerms.join("、")}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-[4px] text-[12px] leading-[18px] text-[#5A5A5A]">
                        {e.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredEntries.length === 0 ? (
              <div className="rounded-[8px] bg-[#FAFAFA] py-[24px] text-center text-[13px] text-[#8F8F8F]">
                未找到匹配的称谓
              </div>
            ) : null}
          </div>
        </ToolCard>
      )}
    </ToolPageShell>
  );
}
