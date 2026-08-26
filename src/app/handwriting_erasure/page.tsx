"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION = "去手写工具，可以去除试卷/文档图片上的手写笔迹，还原印刷内容。";

// RGB -> HSL. Returns h,s,l in [0,1].
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rr:
        h = (gg - bb) / d + (gg < bb ? 6 : 0);
        break;
      case gg:
        h = (bb - rr) / d + 2;
        break;
      default:
        h = (rr - gg) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [threshold, setThreshold] = useState(0.18);
  const [preserveDark, setPreserveDark] = useState(0.35);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [processing, setProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onFile = useCallback(
    (f: File) => {
      setErr("");
      setOutUrl(null);
      if (src) URL.revokeObjectURL(src);
      const url = URL.createObjectURL(f);
      setSrc(url);
      setFileName(f.name.replace(/\.[^.]+$/, "") || "image");
      const im = new Image();
      im.onload = () => {
        imgRef.current = im;
        process();
      };
      im.onerror = () => setErr("图片加载失败");
      im.src = url;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [src],
  );

  const process = useCallback(() => {
    const im = imgRef.current;
    const canvas = canvasRef.current;
    if (!im || !canvas) return;
    setProcessing(true);
    try {
      const w = im.naturalWidth;
      const h = im.naturalHeight;
      // 限制处理尺寸，避免超大图片卡顿
      const maxDim = 2000;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      const cw = Math.max(1, Math.round(w * scale));
      const ch = Math.max(1, Math.round(h * scale));
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(im, 0, 0, cw, ch);
      const imgData = ctx.getImageData(0, 0, cw, ch);
      const data = imgData.data;
      const satThr = threshold; // 饱和度阈值：高于此视为彩色（手写笔迹）
      const lumThr = preserveDark; // 亮度阈值：低于此视为深色印刷，保留

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const [, s, l] = rgbToHsl(r, g, b);
        // 印刷文字通常是低饱和且偏暗；手写笔迹（红/蓝笔）饱和度高。
        // 当像素饱和度高（彩色笔迹）且不是极暗的印刷字时，替换为白色。
        if (s > satThr && l > lumThr) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      if (outUrl) URL.revokeObjectURL(outUrl);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          setOutUrl(URL.createObjectURL(blob));
        },
        "image/png",
      );
    } finally {
      setProcessing(false);
    }
  }, [threshold, preserveDark, outUrl]);

  useEffect(() => {
    if (imgRef.current) process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, preserveDark]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [src, outUrl]);

  return (
    <ToolPageShell title="去手写" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] lg:grid-cols-[360px_1fr]">
          <div className="space-y-[16px]">
            <div>
              <ToolLabel>上传含手写笔迹的图片</ToolLabel>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
                className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
              />
              <p className="mt-[6px] text-[12px] text-[#8F8F8F]">
                适用于试卷、文档等印刷内容上的红/蓝手写笔迹去除。
              </p>
            </div>

            <div>
              <ToolLabel>饱和度阈值：{threshold.toFixed(2)}</ToolLabel>
              <input
                type="range"
                min={0.05}
                max={0.6}
                step={0.01}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="mt-[6px] text-[12px] text-[#8F8F8F]">
                越大越严格（只去除高饱和笔迹），越小越激进。
              </p>
            </div>

            <div>
              <ToolLabel>保护深色印刷：{preserveDark.toFixed(2)}</ToolLabel>
              <input
                type="range"
                min={0.1}
                max={0.7}
                step={0.01}
                value={preserveDark}
                onChange={(e) => setPreserveDark(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="mt-[6px] text-[12px] text-[#8F8F8F]">
                亮度低于此值的深色像素将被保留（保护黑色印刷字）。
              </p>
            </div>

            <div className="flex gap-[10px]">
              <ToolButton onClick={process} disabled={!src || processing}>
                {processing ? "处理中…" : "重新处理"}
              </ToolButton>
              {outUrl && (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = outUrl;
                    a.download = `${fileName}_去手写.png`;
                    a.click();
                  }}
                >
                  下载 PNG
                </ToolButton>
              )}
            </div>
            {err && <div className="text-[13px] text-[#E5484D]">{err}</div>}
          </div>

          <div>
            {src || outUrl ? (
              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <div className="mb-[6px] text-[13px] text-[#8F8F8F]">原图</div>
                  {src && (
                    <img
                      src={src}
                      alt="原图"
                      className="max-h-[420px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
                    />
                  )}
                </div>
                <div>
                  <div className="mb-[6px] text-[13px] text-[#8F8F8F]">
                    去手写后
                  </div>
                  {outUrl ? (
                    <img
                      src={outUrl}
                      alt="去手写结果"
                      className="max-h-[420px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
                    />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[13px] text-[#8F8F8F]">
                      {processing ? "处理中…" : "等待处理"}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[13px] text-[#8F8F8F]">
                上传图片以去除手写笔迹
              </div>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </ToolCard>
    </ToolPageShell>
  );
}
