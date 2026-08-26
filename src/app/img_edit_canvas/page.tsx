"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "图片编辑器集合了多种实用的功能，包括图片裁剪、图片滤镜、图片旋转、图片翻转、图片画图、图片添加文字等。";

type Filter = "none" | "grayscale" | "invert" | "brighten" | "contrast";
type Tool = "none" | "brush" | "text" | "crop";

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [tool, setTool] = useState<Tool>("none");
  const [filter, setFilter] = useState<Filter>("none");
  const [brushColor, setBrushColor] = useState("#E5484D");
  const [brushSize, setBrushSize] = useState(6);
  const [textValue, setTextValue] = useState("文字");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(40);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [drawing, setDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null); // committed image state
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const textPosRef = useRef<{ x: number; y: number } | null>(null);

  // display scaling

  const onFile = useCallback((f: File) => {
    setErr("");
    setOutUrl(null);
    if (src) URL.revokeObjectURL(src);
    const url = URL.createObjectURL(f);
    setSrc(url);
    setFileName(f.name.replace(/\.[^.]+$/, "") || "image");
    const im = new Image();
    im.onload = () => {
      baseImgRef.current = im;
      const c = document.createElement("canvas");
      c.width = im.naturalWidth;
      c.height = im.naturalHeight;
      const ctx = c.getContext("2d");
      if (ctx) ctx.drawImage(im, 0, 0);
      baseCanvasRef.current = c;
      redraw();
    };
    im.onerror = () => setErr("图片加载失败");
    im.src = url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const base = baseCanvasRef.current;
    if (!canvas || !base) return;
    canvas.width = base.width;
    canvas.height = base.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(base, 0, 0);
    applyFilterToCtx(ctx, filter, canvas.width, canvas.height);
  }, [filter]);

  useEffect(() => {
    redraw();
  }, [filter, redraw]);

  const applyFilterToCtx = (ctx: CanvasRenderingContext2D, f: Filter, w: number, h: number) => {
    if (f === "none") return;
    const data = ctx.getImageData(0, 0, w, h);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      if (f === "grayscale") {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = lum; d[i + 1] = lum; d[i + 2] = lum;
      } else if (f === "invert") {
        d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2];
      } else if (f === "brighten") {
        d[i] = Math.min(255, d[i] + 40);
        d[i + 1] = Math.min(255, d[i + 1] + 40);
        d[i + 2] = Math.min(255, d[i + 2] + 40);
      } else if (f === "contrast") {
        const c = 1.4;
        d[i] = Math.max(0, Math.min(255, (d[i] - 128) * c + 128));
        d[i + 1] = Math.max(0, Math.min(255, (d[i + 1] - 128) * c + 128));
        d[i + 2] = Math.max(0, Math.min(255, (d[i + 2] - 128) * c + 128));
      }
    }
    ctx.putImageData(data, 0, 0);
  };

  const commitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const base = baseCanvasRef.current;
    if (!canvas || !base) return;
    base.width = canvas.width;
    base.height = canvas.height;
    const bctx = base.getContext("2d");
    if (!bctx) return;
    bctx.drawImage(canvas, 0, 0);
  }, []);

  const rotate90 = useCallback(() => {
    const base = baseCanvasRef.current;
    if (!base) return;
    const tmp = document.createElement("canvas");
    tmp.width = base.height;
    tmp.height = base.width;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    tctx.translate(tmp.width, 0);
    tctx.rotate(Math.PI / 2);
    tctx.drawImage(base, 0, 0);
    baseCanvasRef.current = tmp;
    redraw();
  }, [redraw]);

  const flip = useCallback((axis: "h" | "v") => {
    const base = baseCanvasRef.current;
    if (!base) return;
    const tmp = document.createElement("canvas");
    tmp.width = base.width;
    tmp.height = base.height;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    if (axis === "h") {
      tctx.translate(tmp.width, 0);
      tctx.scale(-1, 1);
    } else {
      tctx.translate(0, tmp.height);
      tctx.scale(1, -1);
    }
    tctx.drawImage(base, 0, 0);
    baseCanvasRef.current = tmp;
    redraw();
  }, [redraw]);

  const applyCrop = useCallback(() => {
    if (!cropRect) return;
    const base = baseCanvasRef.current;
    if (!base) return;
    const sx = Math.max(0, Math.round(cropRect.x));
    const sy = Math.max(0, Math.round(cropRect.y));
    const sw = Math.max(1, Math.round(cropRect.w));
    const sh = Math.max(1, Math.round(cropRect.h));
    const tmp = document.createElement("canvas");
    tmp.width = sw;
    tmp.height = sh;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    tctx.drawImage(base, sx, sy, sw, sh, 0, 0, sw, sh);
    baseCanvasRef.current = tmp;
    setCropRect(null);
    setTool("none");
    redraw();
  }, [cropRect, redraw]);

  const toCanvasCoord = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const onCanvasDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = toCanvasCoord(e);
    if (tool === "brush") {
      setDrawing(true);
      lastPointRef.current = pt;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.fillStyle = brushColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (tool === "text") {
      textPosRef.current = pt;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && textValue) {
        ctx.font = `bold ${textSize}px sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textBaseline = "top";
        ctx.fillText(textValue, pt.x, pt.y);
      }
    } else if (tool === "crop") {
      cropStartRef.current = pt;
      setCropRect({ x: pt.x, y: pt.y, w: 0, h: 0 });
    }
  };

  const onCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "brush" && drawing) {
      const pt = toCanvasCoord(e);
      const ctx = canvasRef.current?.getContext("2d");
      const last = lastPointRef.current;
      if (ctx && last) {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
      lastPointRef.current = pt;
    } else if (tool === "crop" && cropStartRef.current) {
      const pt = toCanvasCoord(e);
      const start = cropStartRef.current;
      setCropRect({
        x: Math.min(start.x, pt.x),
        y: Math.min(start.y, pt.y),
        w: Math.abs(pt.x - start.x),
        h: Math.abs(pt.y - start.y),
      });
    }
  };

  const onCanvasUp = () => {
    if (tool === "brush" && drawing) {
      setDrawing(false);
      commitCanvas();
    } else if (tool === "text") {
      commitCanvas();
    }
  };

  // overlay crop rect via redraw with selection
  useEffect(() => {
    if (tool === "crop" && cropRect && canvasRef.current && baseCanvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      redraw();
      ctx.strokeStyle = "#136CE9";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
      ctx.fillStyle = "rgba(19,108,233,0.15)";
      ctx.fillRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
    }
  }, [cropRect, tool, redraw]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    commitCanvas();
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (outUrl) URL.revokeObjectURL(outUrl);
      const url = URL.createObjectURL(blob);
      setOutUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}_edited.png`;
      a.click();
    }, "image/png");
  }, [fileName, outUrl]);

  const reset = () => {
    const im = baseImgRef.current;
    if (!im) return;
    const c = document.createElement("canvas");
    c.width = im.naturalWidth;
    c.height = im.naturalHeight;
    const ctx = c.getContext("2d");
    if (ctx) ctx.drawImage(im, 0, 0);
    baseCanvasRef.current = c;
    setFilter("none");
    setTool("none");
    setCropRect(null);
    redraw();
  };

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [src, outUrl]);

  const toolBtn = (t: Tool, label: string) => (
    <button
      type="button"
      onClick={() => {
        setTool(t);
        if (t !== "crop") setCropRect(null);
        if (t === "brush" || t === "text" || t === "crop") {
          // ensure canvas reflects committed base before drawing overlays
          redraw();
        }
      }}
      className={`h-[34px] cursor-pointer rounded-[6px] px-[12px] text-[13px] transition-colors ${
        tool === t ? "bg-[#136CE9] text-white" : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
      }`}
    >
      {label}
    </button>
  );

  const filterBtn = (f: Filter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(f)}
      className={`h-[34px] cursor-pointer rounded-[6px] px-[12px] text-[13px] transition-colors ${
        filter === f ? "bg-[#136CE9] text-white" : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <ToolPageShell title="图片编辑器" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] md:grid-cols-[280px_1fr]">
          <div>
            <ToolLabel>选择图片</ToolLabel>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
              className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
            />

            <div className="mt-[16px]">
              <ToolLabel>编辑工具</ToolLabel>
              <div className="flex flex-wrap gap-[6px]">
                {toolBtn("brush", "画笔")}
                {toolBtn("text", "文字")}
                {toolBtn("crop", "裁剪")}
                {toolBtn("none", "选择")}
              </div>
            </div>

            <div className="mt-[16px]">
              <ToolLabel>旋转/翻转</ToolLabel>
              <div className="flex flex-wrap gap-[6px]">
                <ToolButton variant="ghost" onClick={rotate90} className="h-[34px] px-[12px] text-[13px]">旋转90°</ToolButton>
                <ToolButton variant="ghost" onClick={() => flip("h")} className="h-[34px] px-[12px] text-[13px]">水平翻转</ToolButton>
                <ToolButton variant="ghost" onClick={() => flip("v")} className="h-[34px] px-[12px] text-[13px]">垂直翻转</ToolButton>
              </div>
            </div>

            <div className="mt-[16px]">
              <ToolLabel>滤镜</ToolLabel>
              <div className="flex flex-wrap gap-[6px]">
                {filterBtn("none", "原图")}
                {filterBtn("grayscale", "灰度")}
                {filterBtn("invert", "反色")}
                {filterBtn("brighten", "提亮")}
                {filterBtn("contrast", "对比度")}
              </div>
            </div>

            {tool === "brush" && (
              <div className="mt-[16px]">
                <ToolLabel>画笔颜色 / 粗细：{brushSize}px</ToolLabel>
                <div className="flex items-center gap-[8px]">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="h-[34px] w-[44px] cursor-pointer rounded-[4px] border border-[#E5E7EB]"
                  />
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {tool === "text" && (
              <div className="mt-[16px] space-y-[8px]">
                <div>
                  <ToolLabel>文字内容</ToolLabel>
                  <ToolInput value={textValue} onChange={setTextValue} />
                </div>
                <div className="flex items-center gap-[8px]">
                  <div className="flex-1">
                    <ToolLabel>颜色</ToolLabel>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-[34px] w-full cursor-pointer rounded-[4px] border border-[#E5E7EB]"
                    />
                  </div>
                  <div className="flex-1">
                    <ToolLabel>大小：{textSize}px</ToolLabel>
                    <input
                      type="range"
                      min={12}
                      max={120}
                      value={textSize}
                      onChange={(e) => setTextSize(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                  </div>
                </div>
                <p className="text-[12px] text-[#8F8F8F]">点击画布位置放置文字。</p>
              </div>
            )}

            {tool === "crop" && (
              <div className="mt-[16px]">
                <ToolButton onClick={applyCrop} disabled={!cropRect || cropRect.w < 2}>
                  应用裁剪
                </ToolButton>
                <p className="mt-[6px] text-[12px] text-[#8F8F8F]">在画布上拖拽选择裁剪区域。</p>
              </div>
            )}

            <div className="mt-[20px] flex gap-[10px]">
              <ToolButton onClick={download} disabled={!src}>
                下载图片
              </ToolButton>
              <ToolButton variant="ghost" onClick={reset} disabled={!src}>
                重置
              </ToolButton>
            </div>
            {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
          </div>

          <div>
            <ToolLabel>画布</ToolLabel>
            <div className="flex min-h-[420px] items-center justify-center overflow-auto rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-[12px]">
              {src ? (
                <canvas
                  ref={canvasRef}
                  onMouseDown={onCanvasDown}
                  onMouseMove={onCanvasMove}
                  onMouseUp={onCanvasUp}
                  onMouseLeave={onCanvasUp}
                  className="cursor-crosshair"
                  style={{ maxWidth: "640px", maxHeight: "520px", width: "auto", height: "auto" }}
                />
              ) : (
                <div className="text-[13px] text-[#8F8F8F]">上传图片开始编辑</div>
              )}
            </div>
          </div>
        </div>
      </ToolCard>
    </ToolPageShell>
  );
}
