"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "九宫格切图可以帮助您将一张图片切割成3x3的九个小图块，非常适合在社交媒体平台上进行拼图发布。";

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [tiles, setTiles] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const tileUrlsRef = useRef<string[]>([]);

  const onFile = useCallback((f: File) => {
    setErr("");
    setTiles([]);
    tileUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    tileUrlsRef.current = [];
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setSrc(url);
    const base = f.name.replace(/\.[^.]+$/, "");
    setFileName(base || "image");
    const im = new Image();
    im.onload = () => {
      imgRef.current = im;
    };
    im.onerror = () => setErr("图片加载失败");
    im.src = url;
  }, []);

  const split = useCallback(() => {
    const im = imgRef.current;
    if (!im) return;
    const w = im.naturalWidth;
    const h = im.naturalHeight;
    const tw = Math.floor(w / 3);
    const th = Math.floor(h / 3);
    if (tw < 1 || th < 1) {
      setErr("图片尺寸过小");
      return;
    }
    tileUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    const results: string[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(im, c * tw, r * th, tw, th, 0, 0, tw, th);
        const dataUrl = canvas.toDataURL("image/png");
        results.push(dataUrl);
      }
    }
    tileUrlsRef.current = results;
    setTiles(results);
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  return (
    <ToolPageShell title="九宫格切图" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] md:grid-cols-2">
          <div>
            <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
              选择图片
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
              className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
            />
            {src && (
              <div className="mt-[16px]">
                <img
                  src={src}
                  alt="原图"
                  className="max-h-[280px] w-auto max-w-full rounded-[8px] border border-[#E5E7EB]"
                />
              </div>
            )}
            <div className="mt-[20px] flex gap-[10px]">
              <ToolButton onClick={split} disabled={!src}>
                切割为九宫格
              </ToolButton>
              {tiles.length === 9 && (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    tiles.forEach((url, i) => {
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${fileName}_${i + 1}.png`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    });
                  }}
                >
                  下载全部 9 张
                </ToolButton>
              )}
            </div>
            {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
          </div>
          <div>
            {tiles.length === 9 ? (
              <div>
                <div className="mb-[10px] text-[13px] text-[#8F8F8F]">
                  预览（点击单张可下载）
                </div>
                <div className="grid grid-cols-3 gap-[6px]">
                  {tiles.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      download={`${fileName}_${i + 1}.png`}
                      className="block overflow-hidden rounded-[6px] border border-[#E5E7EB] transition-transform hover:scale-[1.03]"
                    >
                      <img src={url} alt={`tile-${i + 1}`} className="block w-full" />
                    </a>
                  ))}
                </div>
                <p className="mt-[10px] text-[12px] text-[#8F8F8F]">
                  提示：将九张图按顺序发布到朋友圈/微博即可拼成完整图片。
                </p>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[13px] text-[#8F8F8F]">
                上传图片后点击「切割为九宫格」
              </div>
            )}
          </div>
        </div>
      </ToolCard>
    </ToolPageShell>
  );
}
