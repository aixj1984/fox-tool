"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { downloadBytes, readFileAsArrayBuffer } from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "签署无忧，效率提升！PDF签名工具，为您提供快速、安全的电子签名解决方案。无需打印，直接在PDF文档上添加个人或公司签名。保障文档完整性，支持法律效力，助力商务高效运转。";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [x, setX] = useState(72);
  const [y, setY] = useState(72);
  const [w, setW] = useState(240);
  const [h, setH] = useState(100);
  const [originName, setOriginName] = useState("signed");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [hasDraw, setHasDraw] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const onFile = useCallback(async (f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "signed");
    try {
      const buf = await readFileAsArrayBuffer(f);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "解析失败");
    }
  }, []);

  // Init signature canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  };

  const onDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    lastRef.current = getPos(e);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = getPos(e);
    const last = lastRef.current!;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    setHasDraw(true);
  }, []);

  const onUp = useCallback(() => {
    drawingRef.current = false;
    lastRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDraw(false);
  }, []);

  const run = useCallback(async () => {
    if (!file || !hasDraw) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const canvas = canvasRef.current!;
      const dataUrl = canvas.toDataURL("image/png");
      const resp = await fetch(dataUrl);
      const pngBytes = new Uint8Array(await resp.arrayBuffer());
      const buf = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      const png = await pdf.embedPng(pngBytes);
      const page = pdf.getPage(Math.min(pageIdx, pdf.getPageCount() - 1));
      const { height } = page.getSize();
      page.drawImage(png, {
        x,
        y: height - y - h,
        width: w,
        height: h,
      });
      const bytes = await pdf.save();
      downloadBytes(bytes, `${originName}_签名.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "签名失败");
    } finally {
      setBusy(false);
    }
  }, [file, hasDraw, pageIdx, x, y, w, h, originName]);

  return (
    <ToolPageShell title="PDF签名" description={DESCRIPTION}>
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
          <div className="mt-[16px]">
            <ToolLabel>手写签名（在下方区域用鼠标/触摸书写）</ToolLabel>
            <canvas
              ref={canvasRef}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
              className="block w-full max-w-[600px] touch-none rounded-[8px] border border-[#E5E7EB]"
              style={{ aspectRatio: "3 / 1" }}
            />
            <div className="mt-[8px]">
              <ToolButton variant="ghost" onClick={clearCanvas}>
                清除签名
              </ToolButton>
            </div>
          </div>
        )}
        {pageCount > 0 && (
          <div className="mt-[16px] grid gap-[16px] md:grid-cols-4">
            <div>
              <ToolLabel>目标页码</ToolLabel>
              <ToolInput
                type="number"
                value={String(pageIdx + 1)}
                onChange={(v) => setPageIdx(Math.max(1, parseInt(v, 10) || 1) - 1)}
              />
            </div>
            <div>
              <ToolLabel>X (pt)</ToolLabel>
              <ToolInput type="number" value={String(x)} onChange={(v) => setX(parseFloat(v) || 0)} />
            </div>
            <div>
              <ToolLabel>距底部 Y (pt)</ToolLabel>
              <ToolInput type="number" value={String(y)} onChange={(v) => setY(parseFloat(v) || 0)} />
            </div>
            <div>
              <ToolLabel>宽度 (pt)</ToolLabel>
              <ToolInput type="number" value={String(w)} onChange={(v) => setW(parseFloat(v) || 1)} />
            </div>
            <div>
              <ToolLabel>高度 (pt)</ToolLabel>
              <ToolInput type="number" value={String(h)} onChange={(v) => setH(parseFloat(v) || 1)} />
            </div>
          </div>
        )}
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || !hasDraw || busy}>
            {busy ? "处理中…" : "添加签名并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已添加签名并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
