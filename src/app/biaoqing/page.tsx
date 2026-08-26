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
  "表情包制作是一款在线的表情包制作工具，可以帮助用户制作出各种可爱、有趣的图片表情包";

type TextLayer = {
  id: number;
  text: string;
  x: number; // 0..1 relative
  y: number; // 0..1 relative
  size: number; // px relative to canvas width fraction
  color: string;
  stroke: string;
  strokeWidth: number;
};

let layerId = 0;

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("biaoqing");
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
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
    setFileName(f.name.replace(/\.[^.]+$/, "") || "biaoqing");
    const im = new Image();
    im.onload = () => {
      imgRef.current = im;
      render();
    };
    im.onerror = () => setErr("图片加载失败");
    im.src = url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const render = useCallback(() => {
    const im = imgRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let w = 500;
    let h = 500;
    if (im) {
      w = im.naturalWidth;
      h = im.naturalHeight;
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    if (im) ctx.drawImage(im, 0, 0, w, h);
    for (const layer of layers) {
      const fs = layer.size * w;
      ctx.font = `bold ${fs}px "Microsoft YaHei", "PingFang SC", sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.lineWidth = layer.strokeWidth * w * 0.04;
      ctx.strokeStyle = layer.stroke;
      ctx.fillStyle = layer.color;
      ctx.lineJoin = "round";
      ctx.strokeText(layer.text, layer.x * w, layer.y * h);
      ctx.fillText(layer.text, layer.x * w, layer.y * h);
    }
  }, [layers]);

  useEffect(() => {
    render();
  }, [layers, render]);

  const addLayer = () => {
    const nl: TextLayer = {
      id: layerId++,
      text: "表情包文字",
      x: 0.5,
      y: 0.9,
      size: 0.08,
      color: "#ffffff",
      stroke: "#000000",
      strokeWidth: 3,
    };
    setLayers((prev) => [...prev, nl]);
    setSelected(nl.id);
  };

  const updateLayer = (id: number, patch: Partial<TextLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLayer = (id: number) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelected(null);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (outUrl) URL.revokeObjectURL(outUrl);
      const url = URL.createObjectURL(blob);
      setOutUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.png`;
      a.click();
    }, "image/png");
  };

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [src, outUrl]);

  const sel = layers.find((l) => l.id === selected) ?? null;

  return (
    <ToolPageShell title="表情包制作" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] md:grid-cols-[300px_1fr]">
          <div>
            <ToolLabel>选择图片（可选，留空使用白底）</ToolLabel>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
              className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
            />

            <div className="mt-[16px] flex gap-[8px]">
              <ToolButton onClick={addLayer}>添加文字</ToolButton>
              {sel && (
                <ToolButton variant="ghost" onClick={() => removeLayer(sel.id)}>
                  删除选中
                </ToolButton>
              )}
            </div>

            {layers.length > 0 && (
              <div className="mt-[16px] space-y-[8px]">
                <div className="text-[13px] text-[#8F8F8F]">文字图层</div>
                {layers.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelected(l.id)}
                    className={`block w-full truncate rounded-[6px] border px-[10px] py-[6px] text-left text-[13px] transition-colors ${
                      selected === l.id
                        ? "border-[#136CE9] bg-[#EEF3FE] text-[#136CE9]"
                        : "border-[#E5E7EB] bg-white text-[#242424] hover:bg-[#F6F7FA]"
                    }`}
                  >
                    {l.text || "（空文字）"}
                  </button>
                ))}
              </div>
            )}

            {sel && (
              <div className="mt-[16px] space-y-[10px] rounded-[8px] border border-[#E5E7EB] p-[12px]">
                <div>
                  <ToolLabel>文字内容</ToolLabel>
                  <ToolInput value={sel.text} onChange={(v) => updateLayer(sel.id, { text: v })} />
                </div>
                <div className="grid grid-cols-2 gap-[8px]">
                  <div>
                    <ToolLabel>文字色</ToolLabel>
                    <input
                      type="color"
                      value={sel.color}
                      onChange={(e) => updateLayer(sel.id, { color: e.target.value })}
                      className="h-[34px] w-full cursor-pointer rounded-[4px] border border-[#E5E7EB]"
                    />
                  </div>
                  <div>
                    <ToolLabel>描边色</ToolLabel>
                    <input
                      type="color"
                      value={sel.stroke}
                      onChange={(e) => updateLayer(sel.id, { stroke: e.target.value })}
                      className="h-[34px] w-full cursor-pointer rounded-[4px] border border-[#E5E7EB]"
                    />
                  </div>
                </div>
                <div>
                  <ToolLabel>字号：{Math.round(sel.size * 100)}</ToolLabel>
                  <input
                    type="range"
                    min={0.02}
                    max={0.3}
                    step={0.005}
                    value={sel.size}
                    onChange={(e) => updateLayer(sel.id, { size: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <ToolLabel>描边粗细：{sel.strokeWidth}</ToolLabel>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={sel.strokeWidth}
                    onChange={(e) => updateLayer(sel.id, { strokeWidth: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-[8px]">
                  <div>
                    <ToolLabel>水平位置：{Math.round(sel.x * 100)}%</ToolLabel>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={sel.x}
                      onChange={(e) => updateLayer(sel.id, { x: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ToolLabel>垂直位置：{Math.round(sel.y * 100)}%</ToolLabel>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={sel.y}
                      onChange={(e) => updateLayer(sel.id, { y: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-[20px]">
              <ToolButton onClick={download}>下载表情包</ToolButton>
            </div>
            {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
          </div>

          <div>
            <ToolLabel>预览</ToolLabel>
            <div className="flex min-h-[440px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-[12px]">
              <canvas ref={canvasRef} className="max-h-[520px] max-w-full" />
            </div>
          </div>
        </div>
      </ToolCard>
    </ToolPageShell>
  );
}
