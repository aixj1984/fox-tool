"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "图片转换是一款在线图片转换工具，可以帮助用户将图片转换为jpg、png、webp、bmp格式";

type Format = "jpeg" | "png" | "webp";

const FORMAT_LABEL: Record<Format, string> = {
  jpeg: "JPG",
  png: "PNG",
  webp: "WebP",
};

const FORMAT_EXT: Record<Format, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

const FORMAT_MIME: Record<Format, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState(0.92);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState<number | null>(null);
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  const [err, setErr] = useState<string>("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onFile = useCallback((f: File) => {
    setErr("");
    setOutUrl(null);
    setOutSize(null);
    if (src) URL.revokeObjectURL(src);
    const url = URL.createObjectURL(f);
    setSrc(url);
    const base = f.name.replace(/\.[^.]+$/, "");
    setFileName(base || "image");
    const im = new Image();
    im.onload = () => {
      setDim({ w: im.naturalWidth, h: im.naturalHeight });
      imgRef.current = im;
    };
    im.onerror = () => setErr("图片加载失败");
    im.src = url;
  }, [src]);

  const convert = useCallback(() => {
    const im = imgRef.current;
    const canvas = canvasRef.current;
    if (!im || !canvas) return;
    canvas.width = im.naturalWidth;
    canvas.height = im.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(im, 0, 0);
    const q = format === "png" ? undefined : quality;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErr("转换失败，浏览器可能不支持该格式");
          return;
        }
        if (outUrl) URL.revokeObjectURL(outUrl);
        setOutUrl(URL.createObjectURL(blob));
        setOutSize(blob.size);
      },
      FORMAT_MIME[format],
      q,
    );
  }, [format, quality, outUrl]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [src, outUrl]);

  return (
    <ToolPageShell title="图片格式转换" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] md:grid-cols-2">
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
            {dim ? (
              <div className="mt-[10px] text-[13px] text-[#8F8F8F]">
                原图尺寸：{dim.w} × {dim.h}
              </div>
            ) : null}
            <div className="mt-[20px]">
              <ToolLabel>目标格式</ToolLabel>
              <div className="flex gap-[10px]">
                {(Object.keys(FORMAT_LABEL) as Format[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
                      format === f
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {FORMAT_LABEL[f]}
                  </button>
                ))}
              </div>
              <p className="mt-[8px] text-[12px] text-[#8F8F8F]">
                BMP 格式暂不支持，可选 JPG / PNG / WebP。
              </p>
            </div>
            {(format === "jpeg" || format === "webp") && (
              <div className="mt-[20px]">
                <ToolLabel>质量：{Math.round(quality * 100)}%</ToolLabel>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
            <div className="mt-[24px] flex gap-[10px]">
              <ToolButton onClick={convert} disabled={!src}>
                开始转换
              </ToolButton>
              {outUrl && (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = outUrl;
                    a.download = `${fileName}.${FORMAT_EXT[format]}`;
                    a.click();
                  }}
                >
                  下载 {FORMAT_LABEL[format]}
                </ToolButton>
              )}
            </div>
            {err && (
              <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>
            )}
            {outSize !== null && (
              <div className="mt-[12px] text-[13px] text-[#8F8F8F]">
                输出大小：{(outSize / 1024).toFixed(1)} KB
              </div>
            )}
          </div>
          <div>
            {src && (
              <div className="mb-[12px]">
                <div className="mb-[6px] text-[13px] text-[#8F8F8F]">预览</div>
                <img
                  src={src}
                  alt="原图"
                  className="max-h-[260px] w-auto max-w-full rounded-[8px] border border-[#E5E7EB]"
                />
              </div>
            )}
            {outUrl && (
              <div>
                <div className="mb-[6px] text-[13px] text-[#8F8F8F]">转换结果</div>
                <img
                  src={outUrl}
                  alt="转换结果"
                  className="max-h-[260px] w-auto max-w-full rounded-[8px] border border-[#E5E7EB]"
                />
              </div>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </ToolCard>
    </ToolPageShell>
  );
}
