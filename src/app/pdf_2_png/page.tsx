"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const DESCRIPTION =
  "PDF转图片工具是一款专业的在线转换器，它能够将PDF文档逐页转换为独立的图片文件，或者将整个PDF文档转换为一张连续的长图。";

type Rendered = {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
};

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Rendered[]>([]);
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [originName, setOriginName] = useState("pdf");
  const [longBusy, setLongBusy] = useState(false);
  const longRef = useRef<string | null>(null);

  const onFile = useCallback(async (f: File) => {
    setErr("");
    setFile(f);
    setPages([]);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "pdf");
  }, []);

  const render = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setPages([]);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const doc = await loadPdfDoc(buf);
      const out: Rendered[] = [];
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
        out.push({
          index: i,
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height,
        });
      }
      setPages(out);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "渲染失败");
    } finally {
      setBusy(false);
    }
  }, [file, scale]);

  useEffect(() => {
    return () => {
      if (longRef.current) URL.revokeObjectURL(longRef.current);
    };
  }, []);

  const makeLongImage = useCallback(async () => {
    if (pages.length === 0) return;
    setLongBusy(true);
    setErr("");
    try {
      const totalH = pages.reduce((s, p) => s + p.height, 0);
      const maxW = Math.max(...pages.map((p) => p.width));
      const canvas = document.createElement("canvas");
      canvas.width = maxW;
      canvas.height = totalH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let y = 0;
      for (const p of pages) {
        const img = new Image();
        img.src = p.dataUrl;
        await img.decode();
        const dx = (maxW - p.width) / 2;
        ctx.drawImage(img, dx, y);
        y += p.height;
      }
      canvas.toBlob((blob) => {
        if (!blob) return;
        if (longRef.current) URL.revokeObjectURL(longRef.current);
        const url = URL.createObjectURL(blob);
        longRef.current = url;
        const a = document.createElement("a");
        a.href = url;
        a.download = `${originName}_长图.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, "image/png");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "拼图失败");
    } finally {
      setLongBusy(false);
    }
  }, [pages, originName]);

  const downloadAll = useCallback(() => {
    pages.forEach((p) => {
      const a = document.createElement("a");
      a.href = p.dataUrl;
      a.download = `${originName}_page_${p.index}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }, [pages, originName]);

  return (
    <ToolPageShell title="PDF转图片" description={DESCRIPTION}>
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
            <div className="mt-[16px] flex gap-[10px]">
              <ToolButton onClick={render} disabled={busy}>
                {busy ? "渲染中…" : "开始转换"}
              </ToolButton>
            </div>
          </div>
        )}
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {pages.length > 0 && (
          <div className="mt-[20px]">
            <div className="mb-[12px] flex items-center justify-between">
              <span className="text-[14px] text-[#242424]">共 {pages.length} 页</span>
              <span className="flex gap-[8px]">
                <ToolButton variant="ghost" onClick={downloadAll}>
                  下载全部
                </ToolButton>
                <ToolButton variant="ghost" onClick={makeLongImage} disabled={longBusy}>
                  {longBusy ? "拼图中…" : "拼成一张长图"}
                </ToolButton>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 md:grid-cols-4">
              {pages.map((p) => (
                <a
                  key={p.index}
                  href={p.dataUrl}
                  download={`${originName}_page_${p.index}.png`}
                  className="group block overflow-hidden rounded-[6px] border border-[#E5E7EB] transition-transform hover:scale-[1.03]"
                >
                  <img src={p.dataUrl} alt={`page-${p.index}`} className="block w-full" />
                  <div className="bg-[#F6F7FA] px-[6px] py-[3px] text-[11px] text-[#8F8F8F]">
                    第 {p.index} 页
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
