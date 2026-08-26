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
  "PDF图片提取是一款专为从PDF文件中提取图片而设计的在线工具。无论您是需要获取PDF文档中的插图、照片、图表或其他图像内容，这款工具都能快速高效地完成任务，帮助您轻松提取并保存所需的图片资源。";

type Extracted = { id: number; dataUrl: string; w: number; h: number; name: string };

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"render" | "embedded">("render");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [imgs, setImgs] = useState<Extracted[]>([]);
  const [originName, setOriginName] = useState("pdf");
  const seqRef = useRef(0);

  useEffect(() => {
    return () => {};
  }, []);

  const onFile = useCallback((f: File) => {
    setErr("");
    setFile(f);
    setImgs([]);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "pdf");
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setImgs([]);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const doc = await loadPdfDoc(buf);
      const out: Extracted[] = [];
      let seq = 0;

      if (mode === "render") {
        // Render each page to an image.
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
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
            id: seq++,
            dataUrl: canvas.toDataURL("image/png"),
            w: canvas.width,
            h: canvas.height,
            name: `${originName}_page_${i}.png`,
          });
        }
      } else {
        // Scan embedded image XObjects via operator list.
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const ops = await page.getOperatorList();
          const fnArray: number[] = ops.fnArray as number[];
          const argsArray: unknown[][] = ops.argsArray as unknown[][];
          for (let k = 0; k < fnArray.length; k++) {
            const fn = fnArray[k];
            // OPS.paintImageXObject = 85, OPS.paintImageXObjectRepeat = 88 in pdf.js
            if (fn === 85 || fn === 88) {
              const args = argsArray[k];
              const objId = args[0] as string;
              if (!objId) continue;
              try {
                const img = await new Promise<{
                  data: Uint8ClampedArray;
                  width: number;
                  height: number;
                  kind: number;
                } | null>((resolve) => {
                  try {
                    page.objs.get(objId, (v: unknown) => {
                      if (v && typeof v === "object" && "data" in v) {
                        resolve(
                          v as {
                            data: Uint8ClampedArray;
                            width: number;
                            height: number;
                            kind: number;
                          },
                        );
                      } else {
                        resolve(null);
                      }
                    });
                  } catch {
                    resolve(null);
                  }
                });
                if (!img || !img.data || !img.width || !img.height) continue;
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) continue;
                // pdf.js image data may be RGB (kind 1) or RGBA (kind 2).
                const idata = ctx.createImageData(img.width, img.height);
                if (img.kind === 2) {
                  idata.data.set(img.data);
                } else {
                  // RGB -> RGBA
                  const src = img.data;
                  for (let p = 0, q = 0; p < src.length; p += 3, q += 4) {
                    idata.data[q] = src[p];
                    idata.data[q + 1] = src[p + 1];
                    idata.data[q + 2] = src[p + 2];
                    idata.data[q + 3] = 255;
                  }
                }
                ctx.putImageData(idata, 0, 0);
                out.push({
                  id: seq++,
                  dataUrl: canvas.toDataURL("image/png"),
                  w: img.width,
                  h: img.height,
                  name: `${originName}_p${i}_img${out.length + 1}.png`,
                });
              } catch {
                // skip individual image failure
              }
            }
          }
        }
        if (out.length === 0) {
          setErr(
            "未能从该 PDF 中扫描到嵌入的位图对象。可尝试切换为「渲染每页」模式。",
          );
        }
      }
      seqRef.current = seq;
      setImgs(out);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "提取失败");
    } finally {
      setBusy(false);
    }
  }, [file, mode, originName]);

  const downloadAll = useCallback(() => {
    imgs.forEach((im) => {
      const a = document.createElement("a");
      a.href = im.dataUrl;
      a.download = im.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }, [imgs]);

  return (
    <ToolPageShell title="PDF图片提取" description={DESCRIPTION}>
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
          <div className="mt-[16px]">
            <ToolLabel>提取模式</ToolLabel>
            <div className="flex gap-[8px]">
              <button
                type="button"
                onClick={() => setMode("render")}
                className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                  mode === "render"
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                渲染每页为图片
              </button>
              <button
                type="button"
                onClick={() => setMode("embedded")}
                className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                  mode === "embedded"
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                扫描嵌入图片
              </button>
            </div>
            <p className="mt-[8px] text-[12px] text-[#8F8F8F]">
              「渲染每页」将每页转为整页图片；「扫描嵌入图片」尝试提取 PDF 中的位图对象（对矢量或遮罩图可能无效）。
            </p>
          </div>
        )}
        <div className="mt-[20px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy}>
            {busy ? "提取中…" : "开始提取"}
          </ToolButton>
          {imgs.length > 0 && (
            <ToolButton variant="ghost" onClick={downloadAll}>
              下载全部
            </ToolButton>
          )}
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {imgs.length > 0 && (
          <div className="mt-[20px]">
            <div className="mb-[8px] text-[13px] text-[#8F8F8F]">
              共提取 {imgs.length} 张图片
            </div>
            <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 md:grid-cols-4">
              {imgs.map((im) => (
                <a
                  key={im.id}
                  href={im.dataUrl}
                  download={im.name}
                  className="group block overflow-hidden rounded-[6px] border border-[#E5E7EB] transition-transform hover:scale-[1.03]"
                >
                  <img src={im.dataUrl} alt={im.name} className="block w-full" />
                  <div className="bg-[#F6F7FA] px-[6px] py-[3px] text-[11px] text-[#8F8F8F]">
                    {im.w}×{im.h}
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
