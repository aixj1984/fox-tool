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

const DESCRIPTION =
  "图片转PDF专为将多张图片合并转换为PDF文件而设计，无论您是需要将照片、扫描的文档、截图等图片格式（如JPG、PNG等）转换为一个PDF文件，这款工具都能快速高效地完成任务。";

type Item = { id: number; file: File; url: string };

type PageSize = "fit" | "a4";
const A4 = { w: 595.28, h: 841.89 };

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [margin, setMargin] = useState(0);
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
        if (f.type.startsWith("image/")) {
          next.push({ id: seq + i, file: f, url: URL.createObjectURL(f) });
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
    setItems((prev) => {
      const found = prev.find((it) => it.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((it) => it.id !== id);
    });
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
        let img;
        if (it.file.type === "image/png") {
          img = await out.embedPng(buf);
        } else {
          img = await out.embedJpg(buf);
        }
        if (pageSize === "fit") {
          const page = out.addPage([img.width + margin * 2, img.height + margin * 2]);
          page.drawImage(img, { x: margin, y: margin, width: img.width, height: img.height });
        } else {
          const page = out.addPage([A4.w, A4.h]);
          const scale = Math.min(
            (A4.w - margin * 2) / img.width,
            (A4.h - margin * 2) / img.height,
          );
          const dw = img.width * scale;
          const dh = img.height * scale;
          const dx = (A4.w - dw) / 2;
          const dy = (A4.h - dh) / 2;
          page.drawImage(img, { x: dx, y: dy, width: dw, height: dh });
        }
      }
      const bytes = await out.save();
      downloadBytes(bytes, "图片转PDF.pdf");
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "转换失败");
    } finally {
      setBusy(false);
    }
  }, [items, pageSize, margin]);

  return (
    <ToolPageShell title="图片转PDF" description={DESCRIPTION}>
      <ToolCard>
        <ToolLabel>选择图片（可多选，支持 JPG/PNG）</ToolLabel>
        <input
          type="file"
          accept="image/png,image/jpeg"
          multiple
          onChange={(e) => {
            if (e.target.files) onFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
        />
        {items.length > 0 && (
          <div className="mt-[20px] grid gap-[16px] md:grid-cols-2">
            <div>
              <ToolLabel>页面尺寸</ToolLabel>
              <div className="flex gap-[8px]">
                {(["fit", "a4"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPageSize(s)}
                    className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                      pageSize === s
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {s === "fit" ? "适配图片" : "A4"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <ToolLabel>页边距 (pt)：{margin}</ToolLabel>
              <input
                type="range"
                min={0}
                max={72}
                step={2}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </div>
        )}
        {items.length > 0 && (
          <div className="mt-[20px]">
            <div className="mb-[8px] text-[13px] text-[#8F8F8F]">图片顺序</div>
            <ol className="grid gap-[8px] sm:grid-cols-2 md:grid-cols-3">
              {items.map((it, i) => (
                <li
                  key={it.id}
                  className="flex items-center gap-[8px] rounded-[8px] border border-[#E5E7EB] p-[6px]"
                >
                  <img
                    src={it.url}
                    alt={it.file.name}
                    className="h-[50px] w-[50px] shrink-0 rounded-[4px] object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#242424]">
                    {i + 1}. {it.file.name}
                  </span>
                  <span className="flex shrink-0 gap-[4px]">
                    <button
                      type="button"
                      onClick={() => move(it.id, -1)}
                      disabled={i === 0}
                      className="h-[26px] cursor-pointer rounded-[5px] bg-[#F6F7FA] px-[6px] text-[12px] disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(it.id, 1)}
                      disabled={i === items.length - 1}
                      className="h-[26px] cursor-pointer rounded-[5px] bg-[#F6F7FA] px-[6px] text-[12px] disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(it.id)}
                      className="h-[26px] cursor-pointer rounded-[5px] bg-[#FDECEC] px-[6px] text-[12px] text-[#E5484D]"
                    >
                      ✕
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={items.length === 0 || busy}>
            {busy ? "处理中…" : "生成 PDF 并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已生成 PDF 并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
