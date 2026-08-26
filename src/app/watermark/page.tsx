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
  "图片加水印工具可以帮助您在图片上添加自定义的水印信息，保护您的版权或标识您的作品。通过这款工具，您可以轻松添加文本或图片水印，调整水印的位置、大小和透明度。";

type Position = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

const POSITIONS: { key: Position; label: string }[] = [
  { key: "tl", label: "左上" },
  { key: "tc", label: "中上" },
  { key: "tr", label: "右上" },
  { key: "ml", label: "左中" },
  { key: "mc", label: "居中" },
  { key: "mr", label: "右中" },
  { key: "bl", label: "左下" },
  { key: "bc", label: "中下" },
  { key: "br", label: "右下" },
];

function posCoord(pos: Position, iw: number, ih: number, ww: number, wh: number, pad: number) {
  let x = pad;
  let y = pad;
  if (pos.endsWith("c")) x = (iw - ww) / 2;
  if (pos.endsWith("r")) x = iw - ww - pad;
  if (pos.startsWith("m")) y = (ih - wh) / 2;
  if (pos.startsWith("b")) y = ih - wh - pad;
  return { x, y };
}

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [wmType, setWmType] = useState<"text" | "image">("text");
  const [text, setText] = useState("© FoxHelper");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(0.7);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState<Position>("br");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoScale, setLogoScale] = useState(0.3);
  const [outUrl, setOutUrl] = useState<string | null>(null);
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

  const onLogoFile = useCallback((f: File) => {
    if (logoSrc) URL.revokeObjectURL(logoSrc);
    const url = URL.createObjectURL(f);
    setLogoSrc(url);
    const im = new Image();
    im.onload = () => setLogoImg(im);
    im.onerror = () => setErr("水印图片加载失败");
    im.src = url;
  }, [logoSrc]);

  const render = useCallback(() => {
    const im = imgRef.current;
    const canvas = canvasRef.current;
    if (!im || !canvas) return;
    const w = im.naturalWidth;
    const h = im.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(im, 0, 0);
    ctx.globalAlpha = opacity;
    const pad = Math.round(Math.min(w, h) * 0.03);

    if (wmType === "text" && text) {
      const fs = fontSize * (Math.min(w, h) / 600 > 0.5 ? Math.min(w, h) / 600 : 0.5);
      ctx.font = `bold ${fs}px sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = "top";
      const metrics = ctx.measureText(text);
      const tw = metrics.width;
      const th = fs;
      const { x, y } = posCoord(position, w, h, tw, th, pad);
      ctx.save();
      ctx.translate(x + tw / 2, y + th / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, -tw / 2, -th / 2);
      ctx.restore();
    } else if (wmType === "image" && logoImg) {
      const lw = im.naturalWidth * logoScale;
      const lh = (logoImg.naturalHeight / logoImg.naturalWidth) * lw;
      const { x, y } = posCoord(position, w, h, lw, lh, pad);
      ctx.save();
      ctx.translate(x + lw / 2, y + lh / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (outUrl) URL.revokeObjectURL(outUrl);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setOutUrl(URL.createObjectURL(blob));
    }, "image/png");
  }, [wmType, text, fontSize, color, opacity, rotation, position, logoImg, logoScale, outUrl]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
      if (outUrl) URL.revokeObjectURL(outUrl);
      if (logoSrc) URL.revokeObjectURL(logoSrc);
    };
  }, [src, outUrl, logoSrc]);

  return (
    <ToolPageShell title="图片加水印" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] md:grid-cols-2">
          <div>
            <ToolLabel>选择原图</ToolLabel>
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
              <ToolLabel>水印类型</ToolLabel>
              <div className="flex gap-[10px]">
                <button
                  type="button"
                  onClick={() => setWmType("text")}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
                    wmType === "text"
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  文字水印
                </button>
                <button
                  type="button"
                  onClick={() => setWmType("image")}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
                    wmType === "image"
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  图片水印
                </button>
              </div>
            </div>

            {wmType === "text" ? (
              <div className="mt-[16px] space-y-[14px]">
                <div>
                  <ToolLabel>水印文字</ToolLabel>
                  <ToolInput value={text} onChange={setText} placeholder="输入水印文字" />
                </div>
                <div className="grid grid-cols-2 gap-[12px]">
                  <div>
                    <ToolLabel>字号：{fontSize}px</ToolLabel>
                    <input
                      type="range"
                      min={12}
                      max={120}
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ToolLabel>颜色</ToolLabel>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-[40px] w-full cursor-pointer rounded-[8px] border border-[#E5E7EB]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-[16px] space-y-[14px]">
                <div>
                  <ToolLabel>选择水印图片</ToolLabel>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onLogoFile(f);
                    }}
                    className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
                  />
                </div>
                <div>
                  <ToolLabel>水印大小：{Math.round(logoScale * 100)}%</ToolLabel>
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.01}
                    value={logoScale}
                    onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="mt-[16px] grid grid-cols-2 gap-[12px]">
              <div>
                <ToolLabel>透明度：{Math.round(opacity * 100)}%</ToolLabel>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <ToolLabel>旋转：{rotation}°</ToolLabel>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-[16px]">
              <ToolLabel>位置</ToolLabel>
              <div className="grid grid-cols-3 gap-[6px] max-w-[180px]">
                {POSITIONS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPosition(p.key)}
                    className={`h-[34px] cursor-pointer rounded-[6px] text-[12px] transition-colors ${
                      position === p.key
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-[24px] flex gap-[10px]">
              <ToolButton onClick={render} disabled={!src}>
                添加水印
              </ToolButton>
              {outUrl && (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = outUrl;
                    a.download = `${fileName}_watermark.png`;
                    a.click();
                  }}
                >
                  下载
                </ToolButton>
              )}
            </div>
            {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
          </div>
          <div>
            {outUrl ? (
              <img
                src={outUrl}
                alt="结果"
                className="max-h-[460px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[13px] text-[#8F8F8F]">
                上传图片并添加水印
              </div>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </ToolCard>
    </ToolPageShell>
  );
}
