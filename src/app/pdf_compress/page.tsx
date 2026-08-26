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
  formatBytes,
  loadPdfDoc,
  readFileAsArrayBuffer,
} from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "PDF瘦身是一款高效的在线工具，压缩PDF大小，减小传输和存储成本，适用于有较多图片的PDF文件。";

type Mode = "objectstreams" | "rasterize";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("objectstreams");
  const [scale, setScale] = useState(1.0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [before, setBefore] = useState(0);
  const [after, setAfter] = useState(0);
  const [originName, setOriginName] = useState("compressed");

  const onFile = useCallback((f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setBefore(f.size);
    setAfter(0);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "compressed");
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      if (mode === "objectstreams") {
        const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
        const bytes = await pdf.save({ useObjectStreams: true });
        setAfter(bytes.byteLength);
        downloadBytes(bytes, `${originName}_瘦身.pdf`);
      } else {
        // Rasterize: render each page via pdf.js then build image-only PDF.
        const libBuf = buf.slice(0);
        const doc = await loadPdfDoc(libBuf);
        const out = await PDFDocument.create();
        const count = doc.numPages;
        for (let i = 1; i <= count; i++) {
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
        setAfter(bytes.byteLength);
        downloadBytes(bytes, `${originName}_瘦身.pdf`);
      }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "压缩失败");
    } finally {
      setBusy(false);
    }
  }, [file, mode, scale, originName]);

  const reduction =
    before > 0 && after > 0 ? Math.max(0, (1 - after / before) * 100) : 0;

  return (
    <ToolPageShell title="PDF瘦身" description={DESCRIPTION}>
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
          <div className="mt-[12px] text-[13px] text-[#8F8F8F]">
            原始大小：{formatBytes(before)}
          </div>
        )}
        {file && (
          <div className="mt-[20px]">
            <ToolLabel>压缩模式</ToolLabel>
            <div className="flex flex-wrap gap-[8px]">
              <button
                type="button"
                onClick={() => setMode("objectstreams")}
                className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                  mode === "objectstreams"
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                基础压缩（对象流）
              </button>
              <button
                type="button"
                onClick={() => setMode("rasterize")}
                className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                  mode === "rasterize"
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                图片化压缩（降 DPI）
              </button>
            </div>
            <p className="mt-[8px] text-[12px] text-[#8F8F8F]">
              基础压缩重写 PDF 对象流；图片化压缩将每页栅格化为图片，适合图片较多的 PDF，体积更小但文字将不可选。
            </p>
            {mode === "rasterize" && (
              <div className="mt-[16px]">
                <ToolLabel>渲染缩放：{scale.toFixed(2)}（越小体积越小）</ToolLabel>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy}>
            {busy ? "处理中…" : "压缩并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            压缩完成：{formatBytes(before)} → {formatBytes(after)}
            {reduction > 0 && `，减小 ${reduction.toFixed(1)}%`}
            。已开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
