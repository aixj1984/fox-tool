"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "通过这款工具，您可以轻松将图片中的颜色去除，生成具有经典黑白效果的图片";

type OutFormat = "png" | "jpeg";

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outFormat, setOutFormat] = useState<OutFormat>("png");
  const [err, setErr] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onFile = useCallback((f: File) => {
    setErr("");
    setOutUrl(null);
    if (src) URL.revokeObjectURL(src);
    const url = URL.createObjectURL(f);
    setSrc(url);
    setFileName(f.name.replace(/\.[^.]+$/, "") || "image");
    const im = new Image();
    im.onload = () => {
      imgRef.current = im;
    };
    im.onerror = () => setErr("图片加载失败");
    im.src = url;
  }, [src]);

  const applyGrayscale = useCallback(() => {
    const im = imgRef.current;
    const canvas = canvasRef.current;
    if (!im || !canvas) return;
    const w = im.naturalWidth;
    const h = im.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (outFormat === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(im, 0, 0);
    const data = ctx.getImageData(0, 0, w, h);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = lum;
      d[i + 1] = lum;
      d[i + 2] = lum;
    }
    ctx.putImageData(data, 0, 0);
    if (outUrl) URL.revokeObjectURL(outUrl);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setOutUrl(URL.createObjectURL(blob));
      },
      outFormat === "png" ? "image/png" : "image/jpeg",
      outFormat === "jpeg" ? 0.92 : undefined,
    );
  }, [outFormat, outUrl]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [src, outUrl]);

  return (
    <ToolPageShell title="图片黑白化" description={DESCRIPTION}>
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
            <div className="mt-[20px]">
              <ToolLabel>输出格式</ToolLabel>
              <div className="flex gap-[10px]">
                {(["png", "jpeg"] as OutFormat[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setOutFormat(f)}
                    className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
                      outFormat === f
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {f === "png" ? "PNG" : "JPG"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-[24px] flex gap-[10px]">
              <ToolButton onClick={applyGrayscale} disabled={!src}>
                生成黑白图片
              </ToolButton>
              {outUrl && (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = outUrl;
                    a.download = `${fileName}_bw.${outFormat === "png" ? "png" : "jpg"}`;
                    a.click();
                  }}
                >
                  下载
                </ToolButton>
              )}
            </div>
            {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
          </div>
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <div className="mb-[6px] text-[13px] text-[#8F8F8F]">原图</div>
              {src ? (
                <img
                  src={src}
                  alt="原图"
                  className="max-h-[240px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
                />
              ) : (
                <div className="flex h-[160px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[12px] text-[#8F8F8F]">
                  未上传
                </div>
              )}
            </div>
            <div>
              <div className="mb-[6px] text-[13px] text-[#8F8F8F]">黑白效果</div>
              {outUrl ? (
                <img
                  src={outUrl}
                  alt="黑白"
                  className="max-h-[240px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
                />
              ) : (
                <div className="flex h-[160px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[12px] text-[#8F8F8F]">
                  未生成
                </div>
              )}
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </ToolCard>
    </ToolPageShell>
  );
}
