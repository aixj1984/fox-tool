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

type CellKind = "equal" | "removed" | "added" | "empty";
type WordPart = { text: string; kind: "equal" | "removed" | "added" };
type Cell = {
  kind: CellKind;
  text: string;
  lineNo: number | null;
  wordParts?: WordPart[];
};
type DiffRow = { left: Cell; right: Cell };

// Build side-by-side rows by first diffing line-by-line, then pairing
// consecutive removed/added runs. In word mode, paired rows also carry
// word-level highlights computed via diffWords on the two line texts.
function buildRows(left: string, right: string, mode: DiffMode): DiffRow[] {
  const lineChanges = diffLines(left, right);
  type FlatLine = {
    kind: "equal" | "removed" | "added";
    text: string;
    lineNo: number;
  };
  const flat: FlatLine[] = [];
  let leftLineNo = 1;
  let rightLineNo = 1;
  for (const part of lineChanges) {
    const segs = part.value.split(/\n/);
    if (segs.length > 0 && segs[segs.length - 1] === "") segs.pop();
    for (const seg of segs) {
      if (part.added) {
        flat.push({ kind: "added", text: seg, lineNo: rightLineNo });
        rightLineNo += 1;
      } else if (part.removed) {
        flat.push({ kind: "removed", text: seg, lineNo: leftLineNo });
        leftLineNo += 1;
      } else {
        flat.push({ kind: "equal", text: seg, lineNo: leftLineNo });
        leftLineNo += 1;
        rightLineNo += 1;
      }
    }
  }

  const rows: DiffRow[] = [];
  let i = 0;
  while (i < flat.length) {
    const line = flat[i];
    if (line.kind === "equal") {
      rows.push({
        left: { kind: "equal", text: line.text, lineNo: line.lineNo },
        right: { kind: "equal", text: line.text, lineNo: line.lineNo },
      });
      i += 1;
      continue;
    }
    const removed: FlatLine[] = [];
    const added: FlatLine[] = [];
    while (i < flat.length && flat[i].kind !== "equal") {
      if (flat[i].kind === "removed") removed.push(flat[i]);
      else added.push(flat[i]);
      i += 1;
    }
    const pairCount = Math.max(removed.length, added.length);
    for (let k = 0; k < pairCount; k += 1) {
      const r = removed[k] ?? null;
      const a = added[k] ?? null;
      const leftCell: Cell = r
        ? { kind: "removed", text: r.text, lineNo: r.lineNo }
        : { kind: "empty", text: "", lineNo: null };
      const rightCell: Cell = a
        ? { kind: "added", text: a.text, lineNo: a.lineNo }
        : { kind: "empty", text: "", lineNo: null };

      if (mode === "words" && r && a) {
        const wd = diffWords(r.text, a.text);
        leftCell.wordParts = wd
          .filter((p) => !p.added)
          .map((p) => ({
            text: p.value,
            kind: p.removed ? ("removed" as const) : ("equal" as const),
          }));
        rightCell.wordParts = wd
          .filter((p) => !p.removed)
          .map((p) => ({
            text: p.value,
            kind: p.added ? ("added" as const) : ("equal" as const),
          }));
      }

      rows.push({ left: leftCell, right: rightCell });
    }
  }
  return rows;
}

function renderCell(cell: Cell, side: "left" | "right") {
  const isRemoved = cell.kind === "removed";
  const isAdded = cell.kind === "added";
  const isEmpty = cell.kind === "empty";
  const marker = side === "left" ? "-" : "+";
  const bg = isRemoved
    ? "bg-[#fee2e2]/60"
    : isAdded
      ? "bg-[#dcfce7]/60"
      : "";
  const baseText = isRemoved
    ? "text-[#991b1b]"
    : isAdded
      ? "text-[#166534]"
      : isEmpty
        ? "text-[#B0B0B0]"
        : "text-[#242424]";
  const markerContent = isEmpty
    ? ""
    : isRemoved || isAdded
      ? marker
      : cell.lineNo;

  const content = cell.wordParts
    ? cell.wordParts.map((p, idx) => {
        if (p.kind === "removed") {
          return (
            <span key={idx} className="rounded-[2px] bg-[#fecaca] px-[2px]">
              {p.text}
            </span>
          );
        }
        if (p.kind === "added") {
          return (
            <span key={idx} className="rounded-[2px] bg-[#bbf7d0] px-[2px]">
              {p.text}
            </span>
          );
        }
        return <span key={idx}>{p.text}</span>;
      })
    : cell.text || (isEmpty ? "" : " ");

  return (
    <div className={`flex gap-[12px] px-[12px] ${bg}`}>
      <span className="w-[40px] shrink-0 select-none text-right text-[12px] text-[#B0B0B0]">
        {markerContent}
      </span>
      <span
        className={`whitespace-pre-wrap break-words ${baseText} ${
          isRemoved && !cell.wordParts ? "line-through" : ""
        }`}
      >
        {content}
      </span>
    </div>
  );
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

  const rows = useMemo(
    () => (left || right ? buildRows(left, right, mode) : []),
    [left, right, mode],
  );

  const rendered = useMemo(() => {
    if (rows.length === 0) return null;
    return (
      <div className="font-mono text-[14px] leading-[22px]">
        <div className="grid grid-cols-2 gap-x-[2px] gap-y-0">
          {rows.map((row, idx) => (
            <div key={idx} className="contents">
              {renderCell(row.left, "left")}
              {renderCell(row.right, "right")}
            </div>
          ))}
        </div>
      </div>
    );
  }, [rows]);

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
            {rows.length === 0 ? (
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
