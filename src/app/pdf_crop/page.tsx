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
import { downloadBytes, readFileAsArrayBuffer } from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "PDF页面裁剪是一款实用的在线工具，专为对PDF文件的页面进行裁剪而设计。通过这款工具，您可以自定义裁剪区域，对PDF的所有页面进行统一裁剪，适用于去除页面白边、调整页面内容区域等需求。";

type Dim = { width: number; height: number };

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [dim, setDim] = useState<Dim | null>(null);
  const [unit, setUnit] = useState<"percent" | "px">("percent");
  const [top, setTop] = useState(5);
  const [right, setRight] = useState(5);
  const [bottom, setBottom] = useState(5);
  const [left, setLeft] = useState(5);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("crop");

  const onFile = useCallback(async (f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "crop");
    try {
      const buf = await readFileAsArrayBuffer(f);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      const page = pdf.getPage(0);
      setDim(page.getSize());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "解析失败");
    }
  }, []);

  const run = useCallback(async () => {
    if (!file || !dim) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      const t = unit === "percent" ? (top / 100) * dim.height : top;
      const r = unit === "percent" ? (right / 100) * dim.width : right;
      const b = unit === "percent" ? (bottom / 100) * dim.height : bottom;
      const l = unit === "percent" ? (left / 100) * dim.width : left;
      const pages = pdf.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        const tx = unit === "percent" ? (l / (dim.width || 1)) * width : l;
        const ty = unit === "percent" ? (b / (dim.height || 1)) * height : b;
        const tw = unit === "percent" ? (1 - (l + r) / (dim.width || 1)) * width : width - l - r;
        const th = unit === "percent" ? (1 - (t + b) / (dim.height || 1)) * height : height - t - b;
        if (tw <= 0 || th <= 0) {
          throw new Error("裁剪边距过大，结果页面尺寸为 0");
        }
        page.setCropBox(tx, ty, tw, th);
      }
      const bytes = await pdf.save();
      downloadBytes(bytes, `${originName}_裁剪.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "裁剪失败");
    } finally {
      setBusy(false);
    }
  }, [file, dim, unit, top, right, bottom, left, originName]);

  const max = unit === "percent" ? 49 : 1000;

  return (
    <ToolPageShell title="PDF页面裁剪" description={DESCRIPTION}>
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
        {dim && (
          <div className="mt-[12px] text-[13px] text-[#8F8F8F]">
            第一页尺寸：{dim.width.toFixed(0)} × {dim.height.toFixed(0)} pt
          </div>
        )}
        {dim && (
          <div className="mt-[20px]">
            <ToolLabel>单位</ToolLabel>
            <div className="flex gap-[8px]">
              {(["percent", "px"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                    unit === u
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {u === "percent" ? "百分比 %" : "像素 px"}
                </button>
              ))}
            </div>
          </div>
        )}
        {dim && (
          <div className="mt-[20px] grid gap-[16px] md:grid-cols-4">
            {([
              ["上", top, setTop],
              ["右", right, setRight],
              ["下", bottom, setBottom],
              ["左", left, setLeft],
            ] as const).map(([label, val, set]) => (
              <div key={label}>
                <ToolLabel>
                  {label} {unit === "percent" ? "(%)" : "(px)"}：{val}
                </ToolLabel>
                <input
                  type="range"
                  min={0}
                  max={max}
                  step={unit === "percent" ? 1 : 4}
                  value={val}
                  onChange={(e) => set(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy}>
            {busy ? "处理中…" : "裁剪并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已裁剪所有页面并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
