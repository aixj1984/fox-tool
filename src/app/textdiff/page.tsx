"use client";

import { useMemo, useState } from "react";
import { diffLines, diffWords, type Change } from "diff";
import {
  ToolPageShell,
  ToolCard,
  ToolTextarea,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "文本比较是一款实用的在线工具，专为比较两个文本内容的差异而设计。通过这款工具，您可以轻松输入或上传两个文本，快速找出它们之间的不同之处，包括新增、删除和修改的部分。";

type DiffMode = "lines" | "words";

function renderInline(parts: Change[]): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part.added) {
      nodes.push(
        <span
          key={`a-${i}`}
          className="rounded-[2px] bg-[#dcfce7] px-[2px] text-[#166534]"
        >
          {part.value}
        </span>,
      );
    } else if (part.removed) {
      nodes.push(
        <span
          key={`r-${i}`}
          className="rounded-[2px] bg-[#fee2e2] px-[2px] text-[#991b1b] line-through"
        >
          {part.value}
        </span>,
      );
    } else {
      nodes.push(<span key={`k-${i}`}>{part.value}</span>);
    }
  });
  return nodes;
}

export default function Page() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [mode, setMode] = useState<DiffMode>("lines");

  const changes = useMemo<Change[]>(() => {
    if (!left && !right) return [];
    return mode === "lines" ? diffLines(left, right) : diffWords(left, right);
  }, [left, right, mode]);

  const counts = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const c of changes) {
      if (c.added) added += c.count ?? 0;
      if (c.removed) removed += c.count ?? 0;
    }
    return { added, removed };
  }, [changes]);

  // For inline rendering: split each change into lines for line mode so that
  // added/removed line backgrounds look nice; for word mode, inline is fine.
  const rendered = useMemo(() => {
    if (mode === "words") {
      return (
        <div className="whitespace-pre-wrap break-words font-mono text-[14px] leading-[22px]">
          {renderInline(changes)}
        </div>
      );
    }
    // line mode: render line by line, coloring whole lines.
    const lines: React.ReactNode[] = [];
    let lineNo = 1;
    for (const part of changes) {
      const segments = part.value.split(/\n/);
      // When value contains internal newlines, split returns extra empty string
      // at the end; handle by joining with explicit <br/> rendering.
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const isLast = i === segments.length - 1;
        if (part.added) {
          lines.push(
            <div
              key={lines.length}
              className="flex gap-[12px] bg-[#dcfce7]/60 px-[12px]"
            >
              <span className="w-[40px] shrink-0 select-none text-right text-[12px] text-[#166534]/70">
                +
              </span>
              <span className="whitespace-pre-wrap break-words text-[#166534]">
                {seg}
              </span>
            </div>,
          );
        } else if (part.removed) {
          lines.push(
            <div
              key={lines.length}
              className="flex gap-[12px] bg-[#fee2e2]/60 px-[12px]"
            >
              <span className="w-[40px] shrink-0 select-none text-right text-[12px] text-[#991b1b]/70">
                -
              </span>
              <span className="whitespace-pre-wrap break-words text-[#991b1b] line-through">
                {seg}
              </span>
            </div>,
          );
        } else {
          lines.push(
            <div key={lines.length} className="flex gap-[12px] px-[12px]">
              <span className="w-[40px] shrink-0 select-none text-right text-[12px] text-[#B0B0B0]">
                {lineNo}
              </span>
              <span className="whitespace-pre-wrap break-words text-[#242424]">
                {seg}
              </span>
            </div>,
          );
          lineNo += 1;
        }
        if (!isLast) {
          // newline boundary: nothing to render (lines are block-level)
        }
      }
    }
    return <div className="font-mono text-[14px] leading-[22px]">{lines}</div>;
  }, [changes, mode]);

  return (
    <ToolPageShell title="文本比较" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="mb-[12px] flex items-center gap-[12px]">
            <ToolLabel>对比模式</ToolLabel>
            <div className="flex rounded-[8px] border border-[#E5E7EB] p-[2px]">
              {(["lines", "words"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-[6px] px-[12px] py-[4px] text-[13px] transition-colors ${
                    mode === m
                      ? "bg-[#136CE9] text-white"
                      : "text-[#242424] hover:bg-[#F6F7FA]"
                  }`}
                >
                  {m === "lines" ? "逐行对比" : "逐词对比"}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[13px] text-[#8F8F8F]">
              新增 <span className="font-mono text-[#166534]">{counts.added}</span> ·
              删除 <span className="font-mono text-[#991b1b]">{counts.removed}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-[16px]">
            <div>
              <ToolLabel>原文</ToolLabel>
              <ToolTextarea
                value={left}
                onChange={setLeft}
                placeholder="粘贴原始文本……"
                rows={10}
              />
            </div>
            <div>
              <ToolLabel>对比文本</ToolLabel>
              <ToolTextarea
                value={right}
                onChange={setRight}
                placeholder="粘贴要比较的文本……"
                rows={10}
              />
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <ToolLabel>差异结果</ToolLabel>
          <div className="min-h-[120px] rounded-[8px] border border-[#F6F7FA] bg-[#FAFBFC] p-[12px]">
            {changes.length === 0 ? (
              <p className="text-[13px] text-[#8F8F8F]">
                在上方输入两段文本，差异将在此实时显示。
              </p>
            ) : (
              rendered
            )}
          </div>
          <p className="mt-[8px] text-[12px] text-[#B0B0B0]">
            绿色高亮表示新增内容，红色删除线表示删除内容。
          </p>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
