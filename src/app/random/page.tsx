"use client";

import { useCallback, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "随机数生成是一款实用的在线工具，专为生成随机数而设计。通过这款工具，您可以根据指定的范围和数量，快速生成一组随机数，满足各种编程、统计分析、抽奖活动和日常需求。";

// Use crypto.getRandomValues for true randomness. Reject modulo bias by resampling.
function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 0) return min;
  const maxUint32 = 0xffffffff;
  // number of values we can use without bias
  const limit = maxUint32 - (maxUint32 % range);
  const buf = new Uint32Array(1);
  // Resample up to a few times to avoid bias
  for (let i = 0; i < 16; i++) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) {
      return min + (buf[0] % range);
    }
  }
  // Fallback (negligible bias)
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

export default function Page() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("5");
  const [allowDup, setAllowDup] = useState(false);
  const [sort, setSort] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");

  const generate = useCallback(() => {
    const lo = parseInt(min, 10);
    const hi = parseInt(max, 10);
    const n = parseInt(count, 10);
    if (Number.isNaN(lo) || Number.isNaN(hi) || lo > hi) {
      setError("请输入有效的最小值和最大值（最小 ≤ 最大）");
      setResults([]);
      return;
    }
    if (Number.isNaN(n) || n <= 0 || n > 10000) {
      setError("生成数量须为 1 - 10000 之间的整数");
      setResults([]);
      return;
    }
    setError("");

    if (!allowDup) {
      const range = hi - lo + 1;
      if (n > range) {
        setError(`不重复模式下数量（${n}）不能超过范围大小（${range}）`);
        setResults([]);
        return;
      }
      // Fisher-Yates partial shuffle on full range then take first n.
      const pool = Array.from({ length: range }, (_, i) => lo + i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = secureRandomInt(0, i);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const picked = pool.slice(0, n);
      setResults(sort ? picked.slice().sort((a, b) => a - b) : picked);
      return;
    }

    const arr: number[] = [];
    for (let i = 0; i < n; i++) arr.push(secureRandomInt(lo, hi));
    setResults(sort ? arr.slice().sort((a, b) => a - b) : arr);
  }, [min, max, count, allowDup, sort]);

  const resultsText = results.join(", ");

  return (
    <ToolPageShell title="随机数生成" description={DESCRIPTION}>
      <div className="grid gap-[20px] lg:grid-cols-[380px_1fr]">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>最小值</ToolLabel>
            <ToolInput type="number" value={min} onChange={setMin} placeholder="例如 1" />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>最大值</ToolLabel>
            <ToolInput type="number" value={max} onChange={setMax} placeholder="例如 100" />
          </div>
          <div className="mb-[16px]">
            <ToolLabel>生成数量</ToolLabel>
            <ToolInput type="number" value={count} onChange={setCount} placeholder="例如 5" />
          </div>
          <div className="mb-[16px] flex flex-col gap-[10px]">
            <label className="flex cursor-pointer items-center gap-[8px] text-[14px] text-[#242424]">
              <input
                type="checkbox"
                checked={allowDup}
                onChange={(e) => setAllowDup(e.target.checked)}
                className="h-[16px] w-[16px] accent-[#136CE9]"
              />
              允许重复
            </label>
            <label className="flex cursor-pointer items-center gap-[8px] text-[14px] text-[#242424]">
              <input
                type="checkbox"
                checked={sort}
                onChange={(e) => setSort(e.target.checked)}
                className="h-[16px] w-[16px] accent-[#136CE9]"
              />
              升序排序
            </label>
          </div>
          <div className="flex gap-[8px]">
            <ToolButton onClick={generate}>生成随机数</ToolButton>
            <ToolButton
              variant="ghost"
              onClick={() => {
                setResults([]);
                setError("");
              }}
            >
              清空
            </ToolButton>
          </div>
          <div className="mt-[14px] text-[12px] text-[#8F8F8F]">
            使用 Web Crypto（crypto.getRandomValues）生成真随机数，并已规避取模偏差。
          </div>
        </ToolCard>

        <ToolCard>
          {error ? (
            <div className="rounded-[8px] bg-[#FEE2E2] p-[14px] text-[14px] text-[#DC2626]">
              {error}
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="mb-[12px] flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#242424]">
                  生成结果（{results.length} 个）
                </span>
                <CopyButton text={resultsText} label="复制全部" />
              </div>
              <div className="flex max-h-[420px] flex-wrap content-start gap-[8px] overflow-y-auto">
                {results.map((n, i) => (
                  <span
                    key={i}
                    className="inline-flex h-[40px] min-w-[40px] items-center justify-center rounded-[8px] bg-[#F6F7FA] px-[10px] font-mono text-[15px] font-semibold text-[#136CE9]"
                  >
                    {n}
                  </span>
                ))}
              </div>
              <div className="mt-[14px] rounded-[8px] bg-[#F6F7FA] p-[12px]">
                <div className="mb-[4px] text-[12px] text-[#8F8F8F]">纯文本</div>
                <code className="block break-all font-mono text-[13px] text-[#242424]">
                  {resultsText}
                </code>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-[14px] text-[#8F8F8F]">
              设置参数后点击「生成随机数」
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
