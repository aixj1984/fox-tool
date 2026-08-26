"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  downloadBytes,
  loadPdfDoc,
  readFileAsArrayBuffer,
} from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "PDF图片转HTML是一款功能强大的在线转换工具，这款工具不仅能够处理文本和向量图形，还能够将PDF中的图片准确地转换成网页元素。转换后的HTML网页保持了PDF原始页面的布局和格式，确保了在不同的浏览器和设备上都能够以原样呈现，从而提供了更广泛的内容访问和分享可能性。";

type TextItem = {
  str: string;
  left: number;
  top: number;
  width: number;
  height: number;
  size: number;
};

type PageData = {
  index: number;
  width: number;
  height: number;
  items: TextItem[];
};

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("pdf");

  const onFile = useCallback((f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setPages([]);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "pdf");
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setPages([]);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const doc = await loadPdfDoc(buf);
      const out: PageData[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();
        const items: TextItem[] = [];
        for (const raw of textContent.items) {
          if (!raw || typeof raw !== "object") continue;
          const it = raw as Record<string, unknown>;
          if (typeof it.str !== "string" || !it.str.trim()) continue;
          const transform = (it.transform as number[] | undefined) ?? [1, 0, 0, 1, 0, 0];
          const x = transform[4] ?? 0;
          const y = transform[5] ?? 0;
          // pdf.js y is from bottom; flip to top.
          const top = viewport.height - y;
          const size = Math.hypot(transform[2] ?? 0, transform[3] ?? 0) || 12;
          const width = (it.width as number | undefined) ?? 0;
          const height = (it.height as number | undefined) ?? size;
          items.push({ str: it.str, left: x, top: top - height, width, height, size });
        }
        out.push({
          index: i,
          width: viewport.width,
          height: viewport.height,
          items,
        });
      }
      setPages(out);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "转换失败");
    } finally {
      setBusy(false);
    }
  }, [file]);

  const html = useMemo(() => {
    if (pages.length === 0) return "";
    const css = `*{margin:0;padding:0;box-sizing:border-box}
.pdf-doc{background:#fff;}
.pdf-page{position:relative;margin:0 auto 20px;background:white;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,.1);}
.pdf-text{position:absolute;white-space:pre;font-family:Helvetica,Arial,sans-serif;color:#000;line-height:1.2;}`;
    const body = pages
      .map((p) => {
        const spans = p.items
          .map(
            (it) =>
              `  <div class="pdf-text" style="left:${it.left.toFixed(
                1,
              )}px;top:${it.top.toFixed(1)}px;font-size:${it.size.toFixed(
                1,
              )}px;">${escapeHtml(it.str)}</div>`,
          )
          .join("\n");
        return `<div class="pdf-page" style="width:${p.width.toFixed(
          0,
        )}px;height:${p.height.toFixed(0)}px;">\n${spans}\n</div>`;
      })
      .join("\n");
    return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(originName)} - PDF转HTML</title>
<style>
${css}
</style>
</head>
<body>
<div class="pdf-doc">
${body}
</div>
</body>
</html>`;
  }, [pages, originName]);

  const downloadHtml = useCallback(() => {
    if (!html) return;
    downloadBytes(new TextEncoder().encode(html), `${originName}.html`, "text/html");
  }, [html, originName]);

  return (
    <ToolPageShell title="PDF转HTML" description={DESCRIPTION}>
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
        <div className="mt-[20px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy}>
            {busy ? "解析中…" : "开始转换"}
          </ToolButton>
          {html && <CopyButton text={html} label="复制 HTML" />}
          {html && (
            <ToolButton variant="ghost" onClick={downloadHtml}>
              下载 .html
            </ToolButton>
          )}
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && pages.length > 0 && (
          <div className="mt-[8px] text-[13px] text-[#1B8A3F]">
            已解析 {pages.length} 页，共 {pages.reduce((s, p) => s + p.items.length, 0)} 个文本块。
          </div>
        )}
        {pages.length > 0 && (
          <div className="mt-[20px]">
            <div className="mb-[8px] text-[13px] text-[#8F8F8F]">预览</div>
            <div className="max-h-[600px] overflow-auto rounded-[8px] border border-[#E5E7EB] bg-[#F6F7FA] p-[12px]">
              {pages.map((p) => (
                <div
                  key={p.index}
                  className="relative mx-auto mb-[16px] bg-white"
                  style={{
                    width: Math.min(p.width, 760),
                    aspectRatio: `${p.width} / ${p.height}`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {p.items
                    .filter((it) => it.str.trim())
                    .map((it, idx) => {
                      const sx = Math.min(p.width, 760) / p.width;
                      return (
                        <div
                          key={idx}
                          style={{
                            position: "absolute",
                            left: `${it.left * sx}px`,
                            top: `${it.top * sx}px`,
                            fontSize: `${it.size * sx}px`,
                            fontFamily: "Helvetica, Arial, sans-serif",
                            whiteSpace: "pre",
                            color: "#000",
                            lineHeight: 1.2,
                          }}
                        >
                          {it.str}
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
