"use client";

import { useCallback, useState } from "react";
import { diffLines, type Change } from "diff";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { loadPdfjs } from "@/app/_pdf_lib/pdfClient";

const DESCRIPTION =
  "合同审核，智能高效！上传原版及新版合同，让合同对比工具自动扫描差异，精确定位每一个改动点。节省人工审核时间，防止遗漏关键条款变更，确保合同修改清晰透明。合同管理，从此简单。";

type Mode = "pdf" | "text";
type LoadState = { status: "idle" } | { status: "loading"; name: string } | { status: "done"; text: string } | { status: "error"; message: string };

// Extract text from a PDF File using pdfjs-dist. Dynamic import keeps the
// (heavy) worker lib out of the initial bundle and only loads it in browser.
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await loadPdfjs();
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Group text items into lines by their `transform[5]` (y position) so
    // that diffing by line is meaningful instead of one giant string.
    const lines: Map<number, { x: number; str: string }[]> = new Map();
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const str = item.str;
      if (!str) continue;
      const ty = Math.round((item.transform as number[])[5]);
      const tx = (item.transform as number[])[4];
      const arr = lines.get(ty) ?? [];
      arr.push({ x: tx, str });
      lines.set(ty, arr);
    }
    const sortedY = [...lines.keys()].sort((a, b) => b - a); // top to bottom
    for (const y of sortedY) {
      const arr = lines.get(y)!;
      arr.sort((a, b) => a.x - b.x);
      parts.push(arr.map((a) => a.str).join(""));
    }
    parts.push(""); // page break separator
  }
  await doc.destroy();
  return parts.join("\n");
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("pdf");
  const [leftPdf, setLeftPdf] = useState<LoadState>({ status: "idle" });
  const [rightPdf, setRightPdf] = useState<LoadState>({ status: "idle" });
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diff, setDiff] = useState<Change[] | null>(null);
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onFile = useCallback(
    async (side: "left" | "right", file: File | undefined) => {
      if (!file) return;
      setErrorMsg("");
      const setter = side === "left" ? setLeftPdf : setRightPdf;
      setter({ status: "loading", name: file.name });
      try {
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          throw new Error("请选择 PDF 文件");
        }
        const text = await extractPdfText(file);
        setter({ status: "done", text });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setter({ status: "error", message: msg });
      }
    },
    [],
  );

  const runCompare = useCallback(async () => {
    setErrorMsg("");
    setRunning(true);
    try {
      let left = "";
      let right = "";
      if (mode === "pdf") {
        if (leftPdf.status !== "done" || rightPdf.status !== "done") {
          setErrorMsg("请先成功加载两份 PDF 文件");
          setRunning(false);
          return;
        }
        left = leftPdf.text;
        right = rightPdf.text;
      } else {
        left = leftText;
        right = rightText;
        if (!left.trim() && !right.trim()) {
          setErrorMsg("请输入两段文本");
          setRunning(false);
          return;
        }
      }
      setDiff(diffLines(left, right));
    } finally {
      setRunning(false);
    }
  }, [mode, leftPdf, rightPdf, leftText, rightText]);

  const counts = (() => {
    if (!diff) return { added: 0, removed: 0 };
    let added = 0;
    let removed = 0;
    for (const c of diff) {
      if (c.added) added += c.count ?? 0;
      if (c.removed) removed += c.count ?? 0;
    }
    return { added, removed };
  })();

  type RowKind = "equal" | "removed" | "added" | "empty";
  type DiffRow = {
    left: { kind: RowKind; text: string; lineNo: number | null };
    right: { kind: RowKind; text: string; lineNo: number | null };
  };

  const rendered = (() => {
    if (!diff) return null;

    // Flatten changes into individual lines, keeping their kind and the
    // running line number for the unchanged parts.
    type FlatLine = { kind: "equal" | "removed" | "added"; text: string; lineNo: number | null };
    const flat: FlatLine[] = [];
    let leftLineNo = 1;
    let rightLineNo = 1;
    for (const part of diff) {
      const segments = part.value.split(/\n/);
      // diff library always appends a trailing "" after the final newline,
      // which represents the newline boundary rather than a real line — drop it.
      if (segments.length > 0 && segments[segments.length - 1] === "") {
        segments.pop();
      }
      for (const seg of segments) {
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

    // Pair up consecutive removed/added lines into side-by-side rows. When
    // counts differ, the shorter side is padded with empty cells so the
    // adjacent additions/removals stay visually aligned.
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
      // Collect a run of removed/added lines until we hit an equal line.
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
        rows.push({
          left: r
            ? { kind: "removed", text: r.text, lineNo: r.lineNo }
            : { kind: "empty", text: "", lineNo: null },
          right: a
            ? { kind: "added", text: a.text, lineNo: a.lineNo }
            : { kind: "empty", text: "", lineNo: null },
        });
      }
    }

    const renderCell = (cell: { kind: RowKind; text: string; lineNo: number | null }, side: "left" | "right") => {
      const isRemoved = cell.kind === "removed";
      const isAdded = cell.kind === "added";
      const isEmpty = cell.kind === "empty";
      const marker = side === "left" ? "-" : "+";
      const bg = isRemoved
        ? "bg-[#fee2e2]/60"
        : isAdded
          ? "bg-[#dcfce7]/60"
          : "";
      const text = isRemoved
        ? "text-[#991b1b]"
        : isAdded
          ? "text-[#166534]"
          : isEmpty
            ? "text-[#B0B0B0]"
            : "text-[#242424]";
      return (
        <div className={`flex gap-[12px] px-[12px] ${bg}`}>
          <span className="w-[40px] shrink-0 select-none text-right text-[12px] text-[#B0B0B0]">
            {isEmpty ? "" : marker}
          </span>
          <span className={`whitespace-pre-wrap break-words ${text} ${isRemoved ? "line-through" : ""}`}>
            {cell.text || (isEmpty ? "" : " ")}
          </span>
        </div>
      );
    };

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
  })();

  return (
    <ToolPageShell title="合同对比" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="mb-[12px] flex items-center gap-[12px]">
            <ToolLabel>对比方式</ToolLabel>
            <div className="flex rounded-[8px] border border-[#E5E7EB] p-[2px]">
              {(["pdf", "text"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setDiff(null);
                    setErrorMsg("");
                  }}
                  className={`rounded-[6px] px-[12px] py-[4px] text-[13px] transition-colors ${
                    mode === m ? "bg-[#136CE9] text-white" : "text-[#242424] hover:bg-[#F6F7FA]"
                  }`}
                >
                  {m === "pdf" ? "上传 PDF" : "粘贴文本"}
                </button>
              ))}
            </div>
          </div>

          {mode === "pdf" ? (
            <div className="grid grid-cols-2 gap-[16px]">
              <PdfSlot label="原版合同" state={leftPdf} onFile={(f) => onFile("left", f)} onClear={() => setLeftPdf({ status: "idle" })} />
              <PdfSlot label="新版合同" state={rightPdf} onFile={(f) => onFile("right", f)} onClear={() => setRightPdf({ status: "idle" })} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <ToolLabel>原版文本</ToolLabel>
                <ToolTextarea value={leftText} onChange={setLeftText} placeholder="粘贴原版合同文本……" rows={10} />
              </div>
              <div>
                <ToolLabel>新版文本</ToolLabel>
                <ToolTextarea value={rightText} onChange={setRightText} placeholder="粘贴新版合同文本……" rows={10} />
              </div>
            </div>
          )}

          <div className="mt-[16px] flex items-center gap-[12px]">
            <ToolButton onClick={runCompare} disabled={running}>
              {running ? "对比中……" : "开始对比"}
            </ToolButton>
            {diff ? (
              <span className="text-[13px] text-[#8F8F8F]">
                新增 <span className="font-mono text-[#166534]">{counts.added}</span> ·
                删除 <span className="font-mono text-[#991b1b]">{counts.removed}</span>
              </span>
            ) : null}
            {errorMsg ? (
              <span className="text-[13px] text-[#E5484D]">{errorMsg}</span>
            ) : null}
          </div>
          <p className="mt-[8px] text-[12px] text-[#B0B0B0]">
            PDF 文本在浏览器本地提取并对比，文件不会上传到服务器。扫描版 PDF（纯图片）无法提取文本。
          </p>
        </ToolCard>

        <ToolCard>
          <ToolLabel>差异结果</ToolLabel>
          <div className="max-h-[520px] min-h-[120px] overflow-auto rounded-[8px] border border-[#F6F7FA] bg-[#FAFBFC] p-[12px]">
            {!diff ? (
              <p className="text-[13px] text-[#8F8F8F]">
                {mode === "pdf" ? "上传两份 PDF 后点击「开始对比」" : "粘贴两段文本后点击「开始对比」"}
              </p>
            ) : diff.length === 0 ? (
              <p className="text-[13px] text-[#166534]">两份内容完全一致，无差异。</p>
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

function PdfSlot({
  label,
  state,
  onFile,
  onClear,
}: {
  label: string;
  state: LoadState;
  onFile: (f: File | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <ToolLabel>{label}</ToolLabel>
      <div className="rounded-[8px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] p-[16px]">
        {state.status === "idle" ? (
          <label className="flex cursor-pointer flex-col items-center gap-[6px] text-[13px] text-[#8F8F8F] hover:text-[#136CE9]">
            <span className="text-[20px]">+</span>
            <span>点击选择 PDF 文件</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
        ) : state.status === "loading" ? (
          <p className="text-center text-[13px] text-[#8F8F8F]">正在解析 {state.name}……</p>
        ) : state.status === "error" ? (
          <div className="flex flex-col items-center gap-[8px] text-center">
            <p className="text-[13px] text-[#E5484D]">加载失败：{state.message}</p>
            <label className="cursor-pointer text-[13px] text-[#136CE9] hover:underline">
              重新选择
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#166534]">
              已解析（{state.text.length.toLocaleString()} 字符）
            </span>
            <div className="flex gap-[8px]">
              <label className="cursor-pointer text-[#136CE9] hover:underline">
                更换
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
              <button type="button" onClick={onClear} className="text-[#8F8F8F] hover:underline">
                清除
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
