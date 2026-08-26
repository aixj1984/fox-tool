"use client";

import { useCallback, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { downloadBytes, readFileAsArrayBuffer } from "../_pdf_lib/pdfClient";

const DESCRIPTION = "修改PDF页面的尺寸，如修改为A3、A4等，方便打印。";

type SizeId = "a4" | "a3" | "letter" | "legal" | "custom";

const SIZES: { id: SizeId; label: string; w: number; h: number }[] = [
  { id: "a4", label: "A4 (210×297mm)", w: 595.28, h: 841.89 },
  { id: "a3", label: "A3 (297×420mm)", w: 841.89, h: 1190.55 },
  { id: "letter", label: "Letter (216×279mm)", w: 612, h: 792 },
  { id: "legal", label: "Legal (216×356mm)", w: 612, h: 1008 },
  { id: "custom", label: "自定义", w: 595, h: 842 },
];

const PT_PER_MM = 2.834645;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [sizeId, setSizeId] = useState<SizeId>("a4");
  const [customW, setCustomW] = useState(210);
  const [customH, setCustomH] = useState(297);
  const [fit, setFit] = useState(true);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("resized");

  const onFile = useCallback((f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "resized");
  }, []);

  const targetSize = useCallback(() => {
    const s = SIZES.find((x) => x.id === sizeId)!;
    let w = s.id === "custom" ? customW * PT_PER_MM : s.w;
    let h = s.id === "custom" ? customH * PT_PER_MM : s.h;
    if (orientation === "landscape") [w, h] = [h, w];
    return { width: w, height: h };
  }, [sizeId, customW, customH, orientation]);

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const pages = src.getPages();
      const embedded = await out.embedPdf(buf, src.getPageIndices());
      const { width: tw, height: th } = targetSize();

      embedded.forEach((page, i) => {
        const newPage = out.addPage([tw, th]);
        if (fit) {
          const sw = page.width;
          const sh = page.height;
          const scale = Math.min(tw / sw, th / sh);
          const dx = (tw - sw * scale) / 2;
          const dy = (th - sh * scale) / 2;
          newPage.drawPage(page, {
            x: dx,
            y: dy,
            xScale: scale,
            yScale: scale,
          });
        } else {
          const sw = page.width;
          const sh = page.height;
          const scale = Math.min(tw / sw, th / sh);
          const dx = (tw - sw * scale) / 2;
          const dy = (th - sh * scale) / 2;
          newPage.drawPage(page, {
            x: dx,
            y: dy,
            xScale: scale,
            yScale: scale,
          });
        }
        void i;
        void degrees;
      });
      void pages;
      const bytes = await out.save();
      downloadBytes(bytes, `${originName}_${sizeId}.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "尺寸修改失败");
    } finally {
      setBusy(false);
    }
  }, [file, targetSize, fit, sizeId, originName]);

  const ts = targetSize();

  return (
    <ToolPageShell title="修改PDF页面尺寸" description={DESCRIPTION}>
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
        <div className="mt-[20px] grid gap-[16px] md:grid-cols-2">
          <div>
            <ToolLabel>目标尺寸</ToolLabel>
            <div className="flex flex-wrap gap-[8px]">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSizeId(s.id)}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                    sizeId === s.id
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <ToolLabel>方向</ToolLabel>
            <div className="flex gap-[8px]">
              {(["portrait", "landscape"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrientation(o)}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                    orientation === o
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {o === "portrait" ? "纵向" : "横向"}
                </button>
              ))}
            </div>
          </div>
          {sizeId === "custom" && (
            <>
              <div>
                <ToolLabel>宽 (mm)</ToolLabel>
                <ToolInput
                  type="number"
                  value={String(customW)}
                  onChange={(v) => setCustomW(parseFloat(v) || 0)}
                />
              </div>
              <div>
                <ToolLabel>高 (mm)</ToolLabel>
                <ToolInput
                  type="number"
                  value={String(customH)}
                  onChange={(v) => setCustomH(parseFloat(v) || 0)}
                />
              </div>
            </>
          )}
        </div>
        {sizeId === "custom" && (
          <div className="mt-[16px]">
            <ToolLabel>缩放模式</ToolLabel>
            <label className="flex cursor-pointer items-center gap-[8px] text-[14px] text-[#242424]">
              <input
                type="checkbox"
                checked={fit}
                onChange={(e) => setFit(e.target.checked)}
              />
              等比缩放内容以适应新页面（取消则仅裁切到新尺寸）
            </label>
          </div>
        )}
        <div className="mt-[12px] text-[13px] text-[#8F8F8F]">
          目标页面：{ts.width.toFixed(0)} × {ts.height.toFixed(0)} pt
        </div>
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy}>
            {busy ? "处理中…" : "修改并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已修改页面尺寸并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
