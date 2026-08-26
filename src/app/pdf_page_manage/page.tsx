"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
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
  type PageThumb,
} from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "PDF页面管理是一款多功能的在线工具，专为管理和编辑PDF文件中的页面而设计。通过这款工具，您可以轻松添加、删除、旋转PDF页面，并调整页面顺序，从而优化和定制您的PDF文档。";

type PageEntry = {
  index: number; // original index
  rotation: number; // accumulated degrees
};

export default function Page() {
  const [buf, setBuf] = useState<ArrayBuffer | null>(null);
  const [entries, setEntries] = useState<PageEntry[]>([]);
  const [thumbs, setThumbs] = useState<Map<number, PageThumb>>(new Map());
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("managed");
  const urlsRef = useRef<string[]>([]);

  const onFile = useCallback(async (f: File) => {
    setErr("");
    setDone(false);
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
    setThumbs(new Map());
    try {
      const ab = await readFileAsArrayBuffer(f);
      // keep a copy for pdf.js (it detaches buffers).
      const libBuf = ab.slice(0);
      setBuf(ab);
      setOriginName(f.name.replace(/\.pdf$/i, "") || "managed");
      const pdf = await PDFDocument.load(ab, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setEntries(
        Array.from({ length: count }, (_, i) => ({ index: i, rotation: 0 })),
      );
      setBusy(true);
      const doc = await loadPdfDoc(libBuf);
      const map = new Map<number, PageThumb>();
      for (let i = 0; i < count; i++) {
        const page = await doc.getPage(i + 1);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          map.set(i, {
            index: i,
            dataUrl: canvas.toDataURL("image/png"),
            width: canvas.width,
            height: canvas.height,
          });
        }
      }
      setThumbs(map);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "解析失败");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const move = useCallback((i: number, dir: -1 | 1) => {
    setEntries((prev) => {
      const next = prev.slice();
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const remove = useCallback((i: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const rotate = useCallback((i: number) => {
    setEntries((prev) =>
      prev.map((e, idx) =>
        idx === i ? { ...e, rotation: (e.rotation + 90) % 360 } : e,
      ),
    );
  }, []);

  const run = useCallback(async () => {
    if (!buf || entries.length === 0) return;
    setErr("");
    setWorking(true);
    setDone(false);
    try {
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const indices = entries.map((e) => e.index);
      const copied = await out.copyPages(src, indices);
      copied.forEach((page, i) => {
        const rot = entries[i].rotation;
        if (rot) page.setRotation(degrees(rot));
        out.addPage(page);
      });
      const bytes = await out.save();
      downloadBytes(bytes, `${originName}_页面管理.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "导出失败");
    } finally {
      setWorking(false);
    }
  }, [buf, entries, originName]);

  return (
    <ToolPageShell title="PDF页面管理" description={DESCRIPTION}>
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
        {busy && (
          <div className="mt-[12px] text-[13px] text-[#136CE9]">正在生成缩略图…</div>
        )}
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {entries.length > 0 && (
          <div className="mt-[20px]">
            <div className="mb-[12px] text-[14px] text-[#242424]">
              共 {entries.length} 页 · 可调整顺序、删除、旋转
            </div>
            <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3 md:grid-cols-4">
              {entries.map((e, i) => {
                const thumb = thumbs.get(e.index);
                return (
                  <div
                    key={`${e.index}-${i}`}
                    className="overflow-hidden rounded-[8px] border border-[#E5E7EB]"
                  >
                    <div className="flex h-[150px] items-center justify-center bg-[#F6F7FA] p-[6px]">
                      {thumb ? (
                        <img
                          src={thumb.dataUrl}
                          alt={`page-${e.index + 1}`}
                          className="max-h-[140px] max-w-full"
                          style={{
                            transform: `rotate(${e.rotation}deg)`,
                          }}
                        />
                      ) : (
                        <span className="text-[12px] text-[#8F8F8F]">加载中</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between bg-white px-[8px] py-[6px]">
                      <span className="text-[12px] text-[#8F8F8F]">
                        #{i + 1}
                        {e.rotation ? ` · ${e.rotation}°` : ""}
                      </span>
                      <span className="flex gap-[4px]">
                        <button
                          type="button"
                          title="上移"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          className="h-[26px] cursor-pointer rounded-[5px] bg-[#F6F7FA] px-[6px] text-[12px] disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          title="下移"
                          onClick={() => move(i, 1)}
                          disabled={i === entries.length - 1}
                          className="h-[26px] cursor-pointer rounded-[5px] bg-[#F6F7FA] px-[6px] text-[12px] disabled:opacity-40"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          title="旋转90°"
                          onClick={() => rotate(i)}
                          className="h-[26px] cursor-pointer rounded-[5px] bg-[#F6F7FA] px-[6px] text-[12px]"
                        >
                          ↻
                        </button>
                        <button
                          type="button"
                          title="删除"
                          onClick={() => remove(i)}
                          className="h-[26px] cursor-pointer rounded-[5px] bg-[#FDECEC] px-[6px] text-[12px] text-[#E5484D]"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-[20px] flex gap-[10px]">
              <ToolButton onClick={run} disabled={working}>
                {working ? "处理中…" : "应用并下载"}
              </ToolButton>
            </div>
          </div>
        )}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已应用页面操作并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
