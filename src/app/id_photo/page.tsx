"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  PHOTO_SIZE_TABS,
  BG_COLORS,
  mmToPx,
  type PhotoSize,
} from "./sizes";
import { cutoutPortrait } from "./matting";

const DESCRIPTION =
  "证件照生成工具帮助你快速生成高质量证件照。上传照片后一键纯前端抠图，支持更换背景色、按多种尺寸导出，并提供 6 寸排版打印。全程在浏览器本地完成，不上传任何照片。";

type Step = 1 | 2 | 3 | 4;

export default function Page() {
  const [tabKey, setTabKey] = useState<string>(PHOTO_SIZE_TABS[0].key);
  const [selectedSize, setSelectedSize] = useState<PhotoSize>(
    PHOTO_SIZE_TABS[0].sizes[0],
  );
  const [bgColor, setBgColor] = useState(BG_COLORS[0].value);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: -0.04 });
  const [step, setStep] = useState<Step>(1);

  const [origUrl, setOrigUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [err, setErr] = useState("");

  const origUrlRef = useRef<string | null>(null);
  const cutoutUrlRef = useRef<string | null>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (origUrlRef.current) URL.revokeObjectURL(origUrlRef.current);
      if (cutoutUrlRef.current) URL.revokeObjectURL(cutoutUrlRef.current);
    };
  }, []);

  const onFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErr("请选择图片文件");
      return;
    }
    setErr("");
    if (origUrlRef.current) URL.revokeObjectURL(origUrlRef.current);
    if (cutoutUrlRef.current) {
      URL.revokeObjectURL(cutoutUrlRef.current);
      cutoutUrlRef.current = null;
      setCutoutUrl(null);
    }
    const url = URL.createObjectURL(file);
    origUrlRef.current = url;
    setOrigUrl(url);
    setStep(2);
  };

  const doCutout = useCallback(async () => {
    if (!imgElRef.current) {
      setErr("图片尚未加载完成");
      return;
    }
    setBusy(true);
    setErr("");
    setProgressMsg("准备中…");
    try {
      const canvas = await cutoutPortrait(imgElRef.current, setProgressMsg);
      const blob = await canvasToBlob(canvas);
      if (cutoutUrlRef.current) URL.revokeObjectURL(cutoutUrlRef.current);
      const url = URL.createObjectURL(blob);
      cutoutUrlRef.current = url;
      setCutoutUrl(url);
      setStep(3);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "抠图失败");
    } finally {
      setBusy(false);
      setProgressMsg("");
    }
  }, []);

  // 生成单张证件照（人像居中、填充背景色、按尺寸裁剪）
  const composeSingle = useCallback(
    (cutoutImg: HTMLImageElement, size: PhotoSize, bg: string, off: { x: number; y: number }): HTMLCanvasElement => {
      const wPx = mmToPx(size.wMm);
      const hPx = mmToPx(size.hMm);
      const canvas = document.createElement("canvas");
      canvas.width = wPx;
      canvas.height = hPx;
      const ctx = canvas.getContext("2d")!;
      // 背景色（支持渐变）
      if (bg.startsWith("linear-gradient")) {
        const grad = parseLinearGradient(bg, ctx, wPx, hPx);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg;
      }
      ctx.fillRect(0, 0, wPx, hPx);
      // 人像按 "cover" 方式填充到画布，再按用户拖动偏移定位
      const srcW = cutoutImg.naturalWidth;
      const srcH = cutoutImg.naturalHeight;
      const scale = Math.max(wPx / srcW, hPx / srcH);
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      // 水平居中 + 用户偏移；off.x/off.y 是相对于 drawW/drawH 的比例
      const dx = (wPx - drawW) / 2 + off.x * drawW;
      const dy = (hPx - drawH) / 2 + off.y * drawH;
      ctx.drawImage(cutoutImg, dx, dy, drawW, drawH);
      return canvas;
    },
    [],
  );

  const downloadSingle = useCallback(async () => {
    if (!cutoutUrl) return;
    const img = new Image();
    img.src = cutoutUrl;
    await new Promise((r) => {
      img.onload = r;
    });
    const canvas = composeSingle(img, selectedSize, bgColor, offset);
    const blob = await canvasToBlob(canvas);
    triggerDownload(blob, `${selectedSize.name}-${Date.now()}.png`);
  }, [cutoutUrl, selectedSize, bgColor, composeSingle, offset]);

  const downloadPrint6R = useCallback(async () => {
    if (!cutoutUrl) return;
    const img = new Image();
    img.src = cutoutUrl;
    await new Promise((r) => {
      img.onload = r;
    });
    // 6 寸照片：152×102mm @ 300 DPI
    const printWPx = mmToPx(152);
    const printHPx = mmToPx(102);
    const canvas = document.createElement("canvas");
    canvas.width = printWPx;
    canvas.height = printHPx;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, printWPx, printHPx);

    const singleW = mmToPx(selectedSize.wMm);
    const singleH = mmToPx(selectedSize.hMm);
    const gap = mmToPx(3);
    const marginX = Math.floor((printWPx - (Math.floor(printWPx / (singleW + gap)) * (singleW + gap) - gap)) / 2);
    const cols = Math.max(1, Math.floor((printWPx + gap) / (singleW + gap)));
    const rows = Math.max(1, Math.floor((printHPx + gap) / (singleH + gap)));

    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = marginX + c * (singleW + gap);
        const y = r * (singleH + gap);
        if (x + singleW > printWPx || y + singleH > printHPx) continue;
        const single = composeSingle(img, selectedSize, bgColor, offset);
        ctx.drawImage(single, x, y);
        count++;
      }
    }

    const blob = await canvasToBlob(canvas);
    triggerDownload(blob, `证件照排版-6寸-${selectedSize.name}-${count}张-${Date.now()}.png`);
  }, [cutoutUrl, selectedSize, bgColor, composeSingle, offset]);

  const currentTab = PHOTO_SIZE_TABS.find((t) => t.key === tabKey)!;

  return (
    <ToolPageShell title="证件照生成" description={DESCRIPTION}>
      <div className="flex flex-col gap-[20px]">
        {/* 步骤条 */}
        <ToolCard>
          <div className="flex flex-wrap items-center gap-[24px] text-[14px]">
            {[
              { n: 1, label: "选择尺寸" },
              { n: 2, label: "上传照片" },
              { n: 3, label: "一键抠图" },
              { n: 4, label: "下载照片" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-[6px]">
                <span
                  className={`inline-flex h-[24px] w-[24px] items-center justify-center rounded-full text-[12px] ${
                    step >= (s.n as Step)
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#8F8F8F]"
                  }`}
                >
                  {s.n}
                </span>
                <span
                  className={step >= (s.n as Step) ? "text-[#242424]" : "text-[#8F8F8F]"}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </ToolCard>

        {/* 选择尺寸 */}
        <ToolCard>
          <div className="mb-[12px] text-[16px] font-semibold text-[#242424]">选择尺寸</div>
          <div className="mb-[16px] flex flex-wrap gap-[8px] border-b border-[#F6F7FA] pb-[12px]">
            {PHOTO_SIZE_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTabKey(t.key);
                  setSelectedSize(t.sizes[0]);
                }}
                className={`h-[36px] cursor-pointer rounded-[8px] px-[16px] text-[14px] transition-colors ${
                  tabKey === t.key
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-[8px] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {currentTab.sizes.map((s) => {
              const active =
                selectedSize.name === s.name && selectedSize.wMm === s.wMm && selectedSize.hMm === s.hMm;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setSelectedSize(s);
                  }}
                  className={`flex cursor-pointer flex-col items-center rounded-[8px] border p-[10px] text-center transition-colors ${
                    active
                      ? "border-[#136CE9] bg-[#EAF2FF]"
                      : "border-[#E5E7EB] bg-white hover:border-[#136CE9]"
                  }`}
                >
                  <span className="text-[14px] text-[#242424]">{s.name}</span>
                  <span className="mt-[2px] text-[12px] text-[#8F8F8F]">
                    {s.wMm}*{s.hMm}mm
                  </span>
                </button>
              );
            })}
          </div>
        </ToolCard>

        {/* 上传 + 抠图 */}
        <ToolCard>
          <div className="mb-[12px] text-[16px] font-semibold text-[#242424]">上传照片</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
            className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
          />
          {origUrl && (
            <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
              <div>
                <div className="mb-[6px] text-[13px] text-[#8F8F8F]">原始照片</div>
                <img
                  ref={imgElRef}
                  src={origUrl}
                  alt="原始照片"
                  className="max-h-[320px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <div>
                <div className="mb-[6px] text-[13px] text-[#8F8F8F]">
                  {cutoutUrl ? "抠图结果 · 拖动调整人像位置（虚线框为目标尺寸裁剪范围）" : "抠图结果"}
                </div>
                {cutoutUrl ? (
                  <DragEditor
                    cutoutUrl={cutoutUrl}
                    size={selectedSize}
                    offset={offset}
                    onOffsetChange={setOffset}
                  />
                ) : (
                  <div className="flex h-[240px] w-full items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[13px] text-[#8F8F8F]">
                    {busy ? progressMsg : "点击下方按钮进行一键抠图"}
                  </div>
                )}
              </div>
            </div>
          )}

          {origUrl && (
            <div className="mt-[16px] flex flex-wrap gap-[10px]">
              <ToolButton onClick={doCutout} disabled={busy}>
                {busy ? `抠图中… ${progressMsg}` : "一键抠图"}
              </ToolButton>
            </div>
          )}

          {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        </ToolCard>

        {/* 背景色 + 预览 + 下载 */}
        {cutoutUrl && (
          <ToolCard>
            <div className="mb-[12px] text-[16px] font-semibold text-[#242424]">背景色与预览</div>
            <div className="flex flex-wrap items-center gap-[8px]">
              {BG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setBgColor(c.value)}
                  className={`h-[40px] w-[40px] cursor-pointer rounded-[8px] border-2 transition-transform ${
                    bgColor === c.value ? "border-[#136CE9] scale-105" : "border-[#E5E7EB]"
                  }`}
                  style={{
                    background: c.value.startsWith("linear-gradient")
                      ? c.value
                      : c.value,
                  }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
            </div>

            <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
              <div>
                <div className="mb-[6px] text-[13px] text-[#8F8F8F]">
                  单张预览（{selectedSize.name} · {selectedSize.wMm}*{selectedSize.hMm}mm）
                </div>
                <PreviewCanvas
                  cutoutUrl={cutoutUrl}
                  size={selectedSize}
                  bg={bgColor}
                  offset={offset}
                  compose={composeSingle}
                />
              </div>
              <div>
                <div className="mb-[6px] text-[13px] text-[#8F8F8F]">6 寸排版预览（152×102mm）</div>
                <PreviewCanvas6R
                  cutoutUrl={cutoutUrl}
                  size={selectedSize}
                  bg={bgColor}
                  offset={offset}
                  compose={composeSingle}
                />
              </div>
            </div>

            <div className="mt-[16px] flex flex-wrap gap-[10px]">
              <ToolButton onClick={downloadSingle}>下载单张 PNG</ToolButton>
              <ToolButton variant="ghost" onClick={downloadPrint6R}>
                下载 6 寸排版
              </ToolButton>
              <ToolButton
                variant="ghost"
                onClick={() => setOffset({ x: 0, y: -0.04 })}
              >
                重置位置
              </ToolButton>
            </div>
          </ToolCard>
        )}

        <ToolCard>
          <div className="text-[13px] leading-[22px] text-[#8F8F8F]">
            本工具使用 Google MediaPipe Selfie Segmentation 模型在浏览器本地完成人像抠图，无需上传照片到服务器，保护您的隐私。建议上传正面、光线均匀的半身照以获得最佳效果。
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function PreviewCanvas({
  cutoutUrl,
  size,
  bg,
  offset,
  compose,
}: {
  cutoutUrl: string;
  size: PhotoSize;
  bg: string;
  offset: { x: number; y: number };
  compose: (img: HTMLImageElement, size: PhotoSize, bg: string, off: { x: number; y: number }) => HTMLCanvasElement;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const composed = compose(img, size, bg, offset);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = composed.width;
      canvas.height = composed.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(composed, 0, 0);
    };
    img.src = cutoutUrl;
    return () => {
      cancelled = true;
    };
  }, [cutoutUrl, size, bg, offset, compose]);
  return (
    <canvas
      ref={canvasRef}
      className="max-h-[320px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
    />
  );
}

function PreviewCanvas6R({
  cutoutUrl,
  size,
  bg,
  offset,
  compose,
}: {
  cutoutUrl: string;
  size: PhotoSize;
  bg: string;
  offset: { x: number; y: number };
  compose: (img: HTMLImageElement, size: PhotoSize, bg: string, off: { x: number; y: number }) => HTMLCanvasElement;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const printW = mmToPx(152);
      const printH = mmToPx(102);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = printW;
      canvas.height = printH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, printW, printH);
      const singleW = mmToPx(size.wMm);
      const singleH = mmToPx(size.hMm);
      const gap = mmToPx(3);
      const cols = Math.max(1, Math.floor((printW + gap) / (singleW + gap)));
      const rows = Math.max(1, Math.floor((printH + gap) / (singleH + gap)));
      const marginX = Math.floor((printW - (cols * (singleW + gap) - gap)) / 2);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = marginX + c * (singleW + gap);
          const y = r * (singleH + gap);
          if (x + singleW > printW || y + singleH > printH) continue;
          const single = compose(img, size, bg, offset);
          ctx.drawImage(single, x, y);
        }
      }
    };
    img.src = cutoutUrl;
    return () => {
      cancelled = true;
    };
  }, [cutoutUrl, size, bg, offset, compose]);
  return (
    <canvas
      ref={canvasRef}
      className="max-h-[320px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
    />
  );
}

// 可拖动编辑器：底图（cover 填充）+ 目标尺寸裁剪框（虚线），拖动底图调整人像位置。
function DragEditor({
  cutoutUrl,
  size,
  offset,
  onOffsetChange,
}: {
  cutoutUrl: string;
  size: PhotoSize;
  offset: { x: number; y: number };
  onOffsetChange: (off: { x: number; y: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgNaturalRef = useRef<{ w: number; h: number } | null>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffX: number;
    startOffY: number;
    imgDrawW: number;
    imgDrawH: number;
  } | null>(null);

  // 加载底图原始尺寸
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgNaturalRef.current = { w: img.naturalWidth, h: img.naturalHeight };
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = cutoutUrl;
  }, [cutoutUrl]);

  // 监听容器尺寸变化（响应式）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () =>
      setContainerSize({ w: container.clientWidth, h: container.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // 根据容器尺寸、底图原始尺寸、offset 计算并应用底图位置
  useEffect(() => {
    const container = containerRef.current;
    const natural = imgNaturalRef.current;
    const img = imgRef.current;
    if (!container || !natural || !img || !containerSize) return;
    const cw = containerSize.w;
    const ch = containerSize.h;
    const scale = Math.max(cw / natural.w, ch / natural.h);
    const drawW = natural.w * scale;
    const drawH = natural.h * scale;
    img.style.width = `${drawW}px`;
    img.style.height = `${drawH}px`;
    img.style.transform = `translate(calc(-50% + ${offset.x * drawW}px), calc(-50% + ${offset.y * drawH}px))`;
  }, [imgNatural, containerSize, offset]);

  const aspect = size.wMm / size.hMm;
  const containerStyle: React.CSSProperties = {
    aspectRatio: `${size.wMm} / ${size.hMm}`,
    width: aspect >= 1 ? "100%" : undefined,
    maxHeight: "360px",
  };
  if (aspect < 1) {
    containerStyle.height = "360px";
    containerStyle.width = "auto";
    containerStyle.maxWidth = "100%";
    containerStyle.margin = "0 auto";
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const natural = imgNaturalRef.current;
    const container = containerRef.current;
    if (!natural || !container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const scale = Math.max(cw / natural.w, ch / natural.h);
    const drawW = natural.w * scale;
    const drawH = natural.h * scale;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffX: offset.x,
      startOffY: offset.y,
      imgDrawW: drawW,
      imgDrawH: drawH,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragStateRef.current;
    if (!st || st.pointerId !== e.pointerId) return;
    const dxPx = e.clientX - st.startX;
    const dyPx = e.clientY - st.startY;
    const offX = st.startOffX + dxPx / st.imgDrawW;
    const offY = st.startOffY + dyPx / st.imgDrawH;
    const clampedX = Math.max(-0.5, Math.min(0.5, offX));
    const clampedY = Math.max(-0.5, Math.min(0.5, offY));
    onOffsetChange({ x: clampedX, y: clampedY });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = dragStateRef.current;
    if (st && st.pointerId === e.pointerId) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      dragStateRef.current = null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative cursor-move overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-[#F6F7FA] touch-none select-none"
      style={{
        ...containerStyle,
        backgroundImage:
          "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
        backgroundSize: "16px 16px",
        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        ref={imgRef}
        src={cutoutUrl}
        alt="可拖动人像"
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[2px] border-2 border-dashed border-[#136CE9]"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.6) inset" }}
      />
      <div className="pointer-events-none absolute bottom-[6px] right-[8px] rounded-[4px] bg-black/50 px-[6px] py-[2px] text-[11px] text-white">
        拖动调整位置
      </div>
    </div>
  );
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("无法生成图片"));
    }, "image/png");
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseLinearGradient(
  text: string,
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): CanvasGradient {
  // 简易解析：linear-gradient(180deg, #B4D4FF 0%, #438EDB 100%)
  const angleMatch = text.match(/(\d+)deg/);
  const angle = angleMatch ? parseInt(angleMatch[1], 10) : 180;
  const colors = Array.from(text.matchAll(/(#[0-9a-fA-F]{3,8})\s+(\d+)%/g));
  const rad = (angle - 90) * (Math.PI / 180);
  const x0 = w / 2 - (Math.cos(rad) * w) / 2;
  const y0 = h / 2 - (Math.sin(rad) * h) / 2;
  const x1 = w / 2 + (Math.cos(rad) * w) / 2;
  const y1 = h / 2 + (Math.sin(rad) * h) / 2;
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  colors.forEach((m) => {
    grad.addColorStop(parseInt(m[2], 10) / 100, m[1]);
  });
  return grad;
}
