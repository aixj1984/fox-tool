"use client";

import { useCallback, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { downloadBytes, readFileAsArrayBuffer } from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "PDF加页码是一款便捷的在线工具，专为在PDF文件中添加页码而设计。通过这款工具，您可以轻松为PDF文件的每一页添加页码，提升文档的专业性和可读性。无论是用于报告、论文、电子书还是其他文档，PDF加页码工具都能满足您的需求。";

type PosId =
  | "bc"
  | "bl"
  | "br"
  | "tc"
  | "tl"
  | "tr"
  | "cl"
  | "cr"
  | "cc";

const POSITIONS: { id: PosId; label: string }[] = [
  { id: "tl", label: "左上" },
  { id: "tc", label: "上中" },
  { id: "tr", label: "右上" },
  { id: "cl", label: "左中" },
  { id: "cc", label: "居中" },
  { id: "cr", label: "右中" },
  { id: "bl", label: "左下" },
  { id: "bc", label: "下中" },
  { id: "br", label: "右下" },
];

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pos, setPos] = useState<PosId>("bc");
  const [start, setStart] = useState(1);
  const [format, setFormat] = useState("{n}");
  const [size, setSize] = useState(12);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("numbered");

  const onFile = useCallback((f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "numbered");
  }, []);

  const formatNum = (n: number) =>
    format.includes("{n}") ? format.replace("{n}", String(n)) : `${n}`;

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const color = rgb(0, 0, 0);
      const margin = 24;
      let n = start;
      for (const page of pages) {
        const { width, height } = page.getSize();
        const label = formatNum(n);
        const tw = font.widthOfTextAtSize(label, size);
        const th = size;
        let x = 0;
        let y = 0;
        if (pos === "bl") {
          x = margin;
          y = margin;
        } else if (pos === "bc") {
          x = (width - tw) / 2;
          y = margin;
        } else if (pos === "br") {
          x = width - tw - margin;
          y = margin;
        } else if (pos === "tl") {
          x = margin;
          y = height - th - margin;
        } else if (pos === "tc") {
          x = (width - tw) / 2;
          y = height - th - margin;
        } else if (pos === "tr") {
          x = width - tw - margin;
          y = height - th - margin;
        } else if (pos === "cl") {
          x = margin;
          y = (height - th) / 2;
        } else if (pos === "cr") {
          x = width - tw - margin;
          y = (height - th) / 2;
        } else {
          x = (width - tw) / 2;
          y = (height - th) / 2;
        }
        page.drawText(label, { x, y, size, font, color });
        n++;
      }
      const bytes = await pdf.save();
      downloadBytes(bytes, `${originName}_页码.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "加页码失败");
    } finally {
      setBusy(false);
    }
  }, [file, pos, start, format, size, originName]);

  return (
    <ToolPageShell title="PDF加页码" description={DESCRIPTION}>
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
            <ToolLabel>起始页码</ToolLabel>
            <ToolInput
              type="number"
              value={String(start)}
              onChange={(v) => setStart(parseInt(v, 10) || 1)}
            />
          </div>
          <div>
            <ToolLabel>页码格式（用 {"{n}"} 占位）</ToolLabel>
            <ToolInput
              value={format}
              onChange={setFormat}
              placeholder="例如 {n} 或 第{n}页 或 -{n}-"
            />
          </div>
          <div>
            <ToolLabel>字号：{size}</ToolLabel>
            <input
              type="range"
              min={8}
              max={32}
              step={1}
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          <div>
            <ToolLabel>位置</ToolLabel>
            <div className="grid grid-cols-3 gap-[6px]">
              {POSITIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPos(p.id)}
                  className={`h-[34px] cursor-pointer rounded-[6px] text-[13px] font-medium transition-colors ${
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
        </div>
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy}>
            {busy ? "处理中…" : "添加页码并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已添加页码并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
