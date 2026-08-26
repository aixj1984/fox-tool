"use client";

import { useCallback, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  downloadBytes,
  loadPdfDoc,
  readFileAsArrayBuffer,
} from "../_pdf_lib/pdfClient";

const DESCRIPTION = "把PDF转为纯图版，防止复制篡改";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("imagefy");

  const onFile = useCallback((f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "imagefy");
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const libBuf = buf.slice(0);
      const doc = await loadPdfDoc(libBuf);
      const out = await PDFDocument.create();
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/png");
        const resp = await fetch(dataUrl);
        const pngBytes = new Uint8Array(await resp.arrayBuffer());
        const png = await out.embedPng(pngBytes);
        const p = out.addPage([canvas.width, canvas.height]);
        p.drawImage(png, { x: 0, y: 0, width: canvas.width, height: canvas.height });
      }
      const bytes = await out.save();
      downloadBytes(bytes, `${originName}_纯图.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "转换失败");
    } finally {
      setBusy(false);
    }
  }, [file, scale, originName]);

  return (
    <ToolPageShell title="转纯图PDF" description={DESCRIPTION}>
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
        {file && (
          <div className="mt-[16px] max-w-[420px]">
            <ToolLabel>清晰度（缩放）：{scale}x</ToolLabel>
            <input
              type="range"
              min={1}
              max={4}
              step={0.5}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="mt-[8px] text-[12px] text-[#8F8F8F]">
              将每页栅格化为图片后重建 PDF，文字将不可选中/复制，适合防篡改场景。
            </p>
          </div>
        )}
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy}>
            {busy ? "处理中…" : "转为纯图 PDF 并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已生成纯图版 PDF 并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
