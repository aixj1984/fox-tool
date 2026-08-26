"use client";

import { useCallback, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { downloadBytes, readFileAsArrayBuffer } from "../_pdf_lib/pdfClient";

const DESCRIPTION = "从若干PDF中选择指定页面组成新的PDF";

type Item = { id: number; file: File };

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [seq, setSeq] = useState(0);

  const onFiles = useCallback(
    (files: FileList) => {
      setErr("");
      setDone(false);
      const next: Item[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) {
          next.push({ id: seq + i, file: f });
        }
      }
      if (next.length) {
        setSeq((s) => s + next.length);
        setItems((prev) => [...prev, ...next]);
      }
    },
    [seq],
  );

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const move = useCallback((id: number, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const copy = prev.slice();
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  }, []);

  const run = useCallback(async () => {
    if (items.length === 0) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const out = await PDFDocument.create();
      for (const it of items) {
        const buf = await readFileAsArrayBuffer(it.file);
        const src = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      downloadBytes(bytes, "合并.pdf");
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "合并失败");
    } finally {
      setBusy(false);
    }
  }, [items]);

  return (
    <ToolPageShell title="PDF合并" description={DESCRIPTION}>
      <ToolCard>
        <ToolLabel>选择 PDF 文件（可多选，按顺序合并）</ToolLabel>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => {
            if (e.target.files) onFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
        />
        {items.length > 0 && (
          <div className="mt-[20px]">
            <div className="mb-[8px] text-[13px] text-[#8F8F8F]">
              文件顺序（可上移/下移）
            </div>
            <ol className="space-y-[8px]">
              {items.map((it, i) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] px-[12px] py-[8px]"
                >
                  <span className="truncate text-[14px] text-[#242424]">
                    {i + 1}. {it.file.name}
                  </span>
                  <span className="flex shrink-0 gap-[6px]">
                    <button
                      type="button"
                      onClick={() => move(it.id, -1)}
                      disabled={i === 0}
                      className="h-[28px] cursor-pointer rounded-[6px] bg-[#F6F7FA] px-[8px] text-[12px] text-[#242424] disabled:opacity-40"
                    >
                      上移
                    </button>
                    <button
                      type="button"
                      onClick={() => move(it.id, 1)}
                      disabled={i === items.length - 1}
                      className="h-[28px] cursor-pointer rounded-[6px] bg-[#F6F7FA] px-[8px] text-[12px] text-[#242424] disabled:opacity-40"
                    >
                      下移
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(it.id)}
                      className="h-[28px] cursor-pointer rounded-[6px] bg-[#FDECEC] px-[8px] text-[12px] text-[#E5484D]"
                    >
                      删除
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={items.length === 0 || busy}>
            {busy ? "处理中…" : "合并并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已合并 {items.length} 个文件并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
