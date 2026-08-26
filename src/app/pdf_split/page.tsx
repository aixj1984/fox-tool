"use client";

import { useCallback, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  downloadBytes,
  parsePageRanges,
  readFileAsArrayBuffer,
} from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "PDF拆分是一款便捷的在线工具，专为从PDF文件中提取指定页面并生成新的PDF文件而设计。无论您是需要分离特定章节、提取重要页面，这款工具都能快速高效地完成任务，帮助您更好地管理和使用PDF文件。";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [ranges, setRanges] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("split");

  const onFile = useCallback(async (f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "split");
    try {
      const buf = await readFileAsArrayBuffer(f);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "PDF 解析失败");
    }
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const indices = parsePageRanges(ranges, src.getPageCount());
      if (!indices) {
        setErr("请输入有效的页码范围，例如 1-3, 5, 8-10");
        return;
      }
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, indices);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      downloadBytes(bytes, `${originName}_拆分.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "拆分失败");
    } finally {
      setBusy(false);
    }
  }, [file, ranges, originName]);

  return (
    <ToolPageShell title="PDF拆分" description={DESCRIPTION}>
      <ToolCard>
        <ToolLabel>选择 PDF 文件</ToolLabel>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
          className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
        />
        {pageCount > 0 && (
          <div className="mt-[12px] text-[13px] text-[#8F8F8F]">
            共 {pageCount} 页
          </div>
        )}
        {pageCount > 0 && (
          <div className="mt-[20px] max-w-[420px]">
            <ToolLabel>页码范围</ToolLabel>
            <ToolInput
              value={ranges}
              onChange={setRanges}
              placeholder="例如 1-3, 5, 8-10"
            />
            <p className="mt-[6px] text-[12px] text-[#8F8F8F]">
              支持单页、连续区间（1-3）以及逗号分隔的多段，页码从 1 开始。
            </p>
          </div>
        )}
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy || !ranges}>
            {busy ? "处理中…" : "拆分并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已生成拆分后的 PDF 并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
