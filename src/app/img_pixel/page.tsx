"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "图片像素化工具可以帮助您将图片进行像素化处理，生成具有独特视觉效果的像素风格图片。";

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [blockSize, setBlockSize] = useState(12);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
      renderPreview();
    };
    im.onerror = () => setErr("图片加载失败");
    im.src = url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const renderPreview = useCallback(() => {
    const im = imgRef.current;
    const preview = previewCanvasRef.current;
    const out = outCanvasRef.current;
    if (!im || !preview || !out) return;
    const w = im.naturalWidth;
    const h = im.naturalHeight;
    const maxW = 480;
    const scale = w > maxW ? maxW / w : 1;
    const pw = Math.max(1, Math.round(w * scale));
    const ph = Math.max(1, Math.round(h * scale));
    preview.width = pw;
    preview.height = ph;
    out.width = w;
    out.height = h;
    const pctx = preview.getContext("2d");
    const octx = out.getContext("2d");
    if (!pctx || !octx) return;

    const bs = Math.max(1, Math.floor(blockSize * scale));
    const bsOut = Math.max(1, blockSize);

    // preview pixelation
    pctx.imageSmoothingEnabled = false;
    const sw = Math.max(1, Math.ceil(pw / bs));
    const sh = Math.max(1, Math.ceil(ph / bs));
    pctx.clearRect(0, 0, pw, ph);
    pctx.drawImage(im, 0, 0, sw, sh);
    pctx.drawImage(preview, 0, 0, sw, sh, 0, 0, pw, ph);

    // full-res output pixelation
    octx.imageSmoothingEnabled = false;
    const ow = Math.max(1, Math.ceil(w / bsOut));
    const oh = Math.max(1, Math.ceil(h / bsOut));
    octx.clearRect(0, 0, w, h);
    octx.drawImage(im, 0, 0, ow, oh);
    octx.drawImage(out, 0, 0, ow, oh, 0, 0, w, h);
  }, [blockSize]);

  useEffect(() => {
    if (imgRef.current) renderPreview();
  }, [blockSize, renderPreview]);

  const generate = useCallback(() => {
    const out = outCanvasRef.current;
    if (!out) return;
    if (outUrl) URL.revokeObjectURL(outUrl);
    out.toBlob((blob) => {
      if (!blob) return;
      setOutUrl(URL.createObjectURL(blob));
    }, "image/png");
  }, [outUrl]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [src, outUrl]);

  return (
    <ToolPageShell title="图片像素化" description={DESCRIPTION}>
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
              <ToolLabel>像素块大小：{blockSize}px</ToolLabel>
              <input
                type="range"
                min={2}
                max={60}
                step={1}
                value={blockSize}
                onChange={(e) => setBlockSize(parseInt(e.target.value, 10))}
                className="w-full"
              />
              <p className="mt-[6px] text-[12px] text-[#8F8F8F]">
                数值越大像素化越明显，实时预览。
              </p>
            </div>
            <div className="mt-[24px] flex gap-[10px]">
              <ToolButton onClick={generate} disabled={!src}>
                生成并下载
              </ToolButton>
              {outUrl && (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = outUrl;
                    a.download = `${fileName}_pixel.png`;
                    a.click();
                  }}
                >
                  重新下载
                </ToolButton>
              )}
            </div>
            {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
          </div>
          <div>
            <div className="mb-[6px] text-[13px] text-[#8F8F8F]">实时预览</div>
            <canvas
              ref={previewCanvasRef}
              className="max-h-[360px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
            />
          </div>
        </div>
        <canvas ref={outCanvasRef} className="hidden" />
      </ToolCard>
    </ToolPageShell>
  );
}
