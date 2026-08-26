"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { HELLO_WORLD } from "./hello-world-bank";

const DESCRIPTION =
  '开发语言输出Hello World工具可以帮助您快速生成多种编程语言的"Hello, World!"示例代码。';

export default function Page() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELLO_WORLD;
    return HELLO_WORLD.filter((e) => e.lang.toLowerCase().includes(q));
  }, [query]);

  const current = filtered[selected] ?? filtered[0] ?? HELLO_WORLD[0];
  const currentIndex = filtered.findIndex((e) => e.lang === current.lang);

  return (
    <ToolPageShell title="开发语言输出Hello World" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[260px_1fr]">
        <ToolCard>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="搜索语言…"
            className="mb-[12px] h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
          />
          <div className="max-h-[520px] overflow-auto rounded-[8px] border border-[#F6F7FA]">
            {filtered.length === 0 ? (
              <div className="p-[12px] text-[13px] text-[#8F8F8F]">
                未找到匹配的语言
              </div>
            ) : (
              filtered.map((e, i) => (
                <button
                  key={e.lang}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`block w-full truncate px-[14px] py-[10px] text-left text-[14px] transition-colors ${
                    i === currentIndex
                      ? "bg-[#EEF3FE] text-[#136CE9]"
                      : "text-[#242424] hover:bg-[#F6F7FA]"
                  }`}
                >
                  {e.lang}
                </button>
              ))
            )}
          </div>
          <div className="mt-[8px] text-[12px] text-[#8F8F8F]">
            共 {HELLO_WORLD.length} 种语言
          </div>
        </ToolCard>

        <ToolCard>
          <div className="mb-[12px] flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-[#242424]">
              {current.lang}
            </h2>
            <CopyButton text={current.code} label="复制代码" />
          </div>
          <pre className="max-h-[560px] overflow-auto rounded-[8px] bg-[#1e1e1e] p-[16px] font-mono text-[14px] leading-[22px] text-[#e6e6e6]">
            <code>{current.code}</code>
          </pre>
          <div className="mt-[12px] flex items-center justify-between">
            <span className="text-[12px] text-[#8F8F8F]">
              示例可直接复制到对应语言的运行环境中执行。
            </span>
            <ToolButton
              variant="ghost"
              onClick={() =>
                setSelected((i) => (i + 1) % Math.max(filtered.length, 1))
              }
              disabled={filtered.length === 0}
            >
              下一个
            </ToolButton>
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
