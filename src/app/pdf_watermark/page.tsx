"use client";

import { useCallback, useState } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { downloadBytes, readFileAsArrayBuffer } from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "PDF加水印工具是一款在线应用，它允许用户在PDF文件上添加自定义的水印信息。这项功能对于保护版权、标记文件状态或个性化文档非常有用，并能够自定义水印的位置、大小、透明度和旋转角度，以满足不同的需求和偏好。";

type Pos = "center" | "diagonal" | "top-left" | "bottom-right";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("机密");
  const [size, setSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [pos, setPos] = useState<Pos>("diagonal");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("watermark");

  const onFile = useCallback((f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "watermark");
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();
      const color = rgb(0.6, 0.6, 0.6);
      for (const page of pages) {
        const { width, height } = page.getSize();
        const tw = font.widthOfTextAtSize(text, size);
        let x = (width - tw) / 2;
        let y = height / 2;
        let rot = degrees(rotation);
        if (pos === "center") {
          rot = degrees(0);
          x = (width - tw) / 2;
          y = height / 2;
        } else if (pos === "diagonal") {
          rot = degrees(rotation);
          x = (width - tw) / 2;
          y = height / 2;
        } else if (pos === "top-left") {
          rot = degrees(0);
          x = 24;
          y = height - size - 24;
        } else if (pos === "bottom-right") {
          rot = degrees(0);
          x = width - tw - 24;
          y = 24;
        }
        page.drawText(text, {
          x,
          y,
          size,
          font,
          color,
          opacity,
          rotate: rot,
        });
      }
      const bytes = await pdf.save();
      downloadBytes(bytes, `${originName}_水印.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "加水印失败");
    } finally {
      setBusy(false);
    }
  }, [file, text, size, opacity, rotation, pos, originName]);

  const positions: { id: Pos; label: string }[] = [
    { id: "diagonal", label: "对角线" },
    { id: "center", label: "居中" },
    { id: "top-left", label: "左上" },
    { id: "bottom-right", label: "右下" },
  ];

  return (
    <ToolPageShell title="PDF加水印" description={DESCRIPTION}>
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
            <ToolLabel>水印文字</ToolLabel>
            <ToolInput value={text} onChange={setText} placeholder="例如 机密" />
          </div>
          <div>
            <ToolLabel>位置</ToolLabel>
            <div className="flex flex-wrap gap-[8px]">
              {positions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPos(p.id)}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                    pos === p.id
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <ToolLabel>字号：{size}</ToolLabel>
            <input
              type="range"
              min={12}
              max={120}
              step={1}
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          <div>
            <ToolLabel>透明度：{Math.round(opacity * 100)}%</ToolLabel>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <ToolLabel>旋转角度：{rotation}°</ToolLabel>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy || !text}>
            {busy ? "处理中…" : "添加水印并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已添加水印并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
