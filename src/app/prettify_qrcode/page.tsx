"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "二维码美化工具可以帮助您将普通的二维码进行美化处理，使其更加个性化和吸引人。通过这款工具，您可以添加颜色、图标和其他装饰元素，创建独特的二维码。";

type Level = "L" | "M" | "Q" | "H";
type DotStyle = "square" | "rounded" | "dots";

interface LogoImage {
  src: string;
  size: number; // fraction of QR width, 0.1–0.3
}

export default function Page() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(480);
  const [level, setLevel] = useState<Level>("H");
  const [fg, setFg] = useState("#136CE9");
  const [bg, setBg] = useState("#FFFFFF");
  const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
  const [useGradient, setUseGradient] = useState(true);
  const [gradFrom, setGradFrom] = useState("#136CE9");
  const [gradTo, setGradTo] = useState("#9333EA");
  const [logo, setLogo] = useState<LogoImage | null>(null);
  const [err, setErr] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const value = text.trim();
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!value) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setErr("");
      return;
    }

    // Compute the QR matrix (modules only) so we can render a styled canvas.
    const qr = QRCode.create(value, { errorCorrectionLevel: level });
    const count = qr.modules.size;
    const data = qr.modules.data;

    const quiet = 4; // quiet zone modules
    const total = count + quiet * 2;
    const moduleSize = Math.floor(size / total);
    const drawSize = moduleSize * total;
    canvas.width = drawSize;
    canvas.height = drawSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, drawSize, drawSize);

    // Gradient or solid foreground
    let fill: string | CanvasGradient = fg;
    if (useGradient) {
      const g = ctx.createLinearGradient(0, 0, drawSize, drawSize);
      g.addColorStop(0, gradFrom);
      g.addColorStop(1, gradTo);
      fill = g;
    }
    ctx.fillStyle = fill;

    const isOn = (r: number, c: number): boolean => {
      if (r < 0 || c < 0 || r >= count || c >= count) return false;
      return data[r * count + c] === 1;
    };

    const radius = (() => {
      switch (dotStyle) {
        case "square":
          return 0;
        case "rounded":
          return moduleSize * 0.3;
        case "dots":
          return moduleSize * 0.5;
      }
    })();

    const drawModule = (x: number, y: number) => {
      if (dotStyle === "dots") {
        ctx.beginPath();
        ctx.arc(
          x + moduleSize / 2,
          y + moduleSize / 2,
          moduleSize / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else {
        roundRect(ctx, x, y, moduleSize, moduleSize, radius);
        ctx.fill();
      }
    };

    // Detector (finder) pattern positions: top-left, top-right, bottom-left.
    const isFinder = (r: number, c: number): boolean => {
      const inBox = (br: number, bc: number) =>
        r >= br && r < br + 7 && c >= bc && c < bc + 7;
      return inBox(0, 0) || inBox(0, count - 7) || inBox(count - 7, 0);
    };

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (!isOn(r, c)) continue;
        if (isFinder(r, c)) continue; // draw finders separately
        const x = (c + quiet) * moduleSize;
        const y = (r + quiet) * moduleSize;
        drawModule(x, y);
      }
    }

    // Draw finder patterns with rounded outer rings for a polished look.
    const drawFinder = (originR: number, originC: number) => {
      const ox = (originC + quiet) * moduleSize;
      const oy = (originR + quiet) * moduleSize;
      const outer = moduleSize * 7;
      const ring = moduleSize * 5;
      const inner = moduleSize * 3;
      // Outer ring (filled square with rounded corners, then punch hole)
      ctx.fillStyle = fill;
      roundRect(ctx, ox, oy, outer, outer, moduleSize * 1.4);
      ctx.fill();
      ctx.fillStyle = bg;
      roundRect(
        ctx,
        ox + moduleSize,
        oy + moduleSize,
        ring,
        ring,
        moduleSize,
      );
      ctx.fill();
      ctx.fillStyle = fill;
      roundRect(
        ctx,
        ox + moduleSize * 2,
        oy + moduleSize * 2,
        inner,
        inner,
        moduleSize * 0.8,
      );
      ctx.fill();
    };
    drawFinder(0, 0);
    drawFinder(0, count - 7);
    drawFinder(count - 7, 0);

    // Embed logo in the center with a whitespace-safe quiet area.
    if (logo) {
      const img = new Image();
      img.onload = () => {
        const logoPx = Math.floor(drawSize * logo.size);
        // Clear a quiet area behind the logo so scanners can still read.
        const pad = Math.ceil(moduleSize * 2);
        ctx.fillStyle = bg;
        roundRect(
          ctx,
          drawSize / 2 - logoPx / 2 - pad,
          drawSize / 2 - logoPx / 2 - pad,
          logoPx + pad * 2,
          logoPx + pad * 2,
          pad,
        );
        ctx.fill();
        ctx.drawImage(img, drawSize / 2 - logoPx / 2, drawSize / 2 - logoPx / 2, logoPx, logoPx);
      };
      img.src = logo.src;
    }

    setErr("");
  }, [text, size, level, fg, bg, dotStyle, useGradient, gradFrom, gradTo, logo]);

  const onLogoUpload = (file: File | null) => {
    if (!file) {
      setLogo(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo({ src: String(reader.result), size: 0.2 });
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "prettify-qrcode.png";
    a.click();
  };

  const levelLabel: Record<Level, string> = {
    L: "L · 7%",
    M: "M · 15%",
    Q: "Q · 25%",
    H: "H · 30%",
  };

  return (
    <ToolPageShell title="二维码美化" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>内容</ToolLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入文本或网址"
            rows={3}
            className="mb-[16px] w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white p-[12px] text-[14px] leading-[22px] text-[#242424] outline-none focus:border-[#136CE9]"
          />

          <div className="grid grid-cols-2 gap-[16px]">
            <div>
              <ToolLabel>尺寸（px）</ToolLabel>
              <input
                type="range"
                min={256}
                max={800}
                step={16}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-[#136CE9]"
              />
              <div className="text-[12px] text-[#8F8F8F]">{size}</div>
            </div>
            <div>
              <ToolLabel>纠错等级</ToolLabel>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
                className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[10px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
              >
                {(Object.keys(levelLabel) as Level[]).map((l) => (
                  <option key={l} value={l}>
                    {levelLabel[l]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <ToolLabel>模块样式</ToolLabel>
              <select
                value={dotStyle}
                onChange={(e) => setDotStyle(e.target.value as DotStyle)}
                className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[10px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
              >
                <option value="square">方块</option>
                <option value="rounded">圆角</option>
                <option value="dots">圆点</option>
              </select>
            </div>
            <div>
              <ToolLabel>背景色</ToolLabel>
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="h-[40px] w-full cursor-pointer rounded-[8px] border border-[#E5E7EB]"
              />
            </div>
          </div>

          <div className="mt-[16px]">
            <label className="mb-[6px] flex items-center gap-[8px] text-[14px] font-medium text-[#242424]">
              <input
                type="checkbox"
                checked={useGradient}
                onChange={(e) => setUseGradient(e.target.checked)}
                className="h-[16px] w-[16px] accent-[#136CE9]"
              />
              使用渐变色
            </label>
            {useGradient ? (
              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <span className="text-[12px] text-[#8F8F8F]">起始</span>
                  <input
                    type="color"
                    value={gradFrom}
                    onChange={(e) => setGradFrom(e.target.value)}
                    className="h-[36px] w-full cursor-pointer rounded-[8px] border border-[#E5E7EB]"
                  />
                </div>
                <div>
                  <span className="text-[12px] text-[#8F8F8F]">结束</span>
                  <input
                    type="color"
                    value={gradTo}
                    onChange={(e) => setGradTo(e.target.value)}
                    className="h-[36px] w-full cursor-pointer rounded-[8px] border border-[#E5E7EB]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[12px] text-[#8F8F8F]">前景色</span>
                <input
                  type="color"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  className="h-[36px] w-full cursor-pointer rounded-[8px] border border-[#E5E7EB]"
                />
              </div>
            )}
          </div>

          <div className="mt-[16px]">
            <ToolLabel>中心 Logo（可选）</ToolLabel>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={(e) => onLogoUpload(e.target.files?.[0] ?? null)}
              className="text-[13px] text-[#242424]"
            />
            {logo && (
              <div className="mt-[8px] flex items-center gap-[12px]">
                <span className="text-[12px] text-[#8F8F8F]">Logo 大小</span>
                <input
                  type="range"
                  min={0.1}
                  max={0.3}
                  step={0.02}
                  value={logo.size}
                  onChange={(e) =>
                    setLogo({ ...logo, size: Number(e.target.value) })
                  }
                  className="flex-1 accent-[#136CE9]"
                />
                <button
                  type="button"
                  onClick={() => setLogo(null)}
                  className="text-[13px] text-[#E5484D] hover:underline"
                >
                  移除
                </button>
              </div>
            )}
          </div>

          {err && (
            <p className="mt-[12px] text-[13px] text-[#E5484D]">生成失败：{err}</p>
          )}
        </ToolCard>

        <ToolCard>
          <ToolLabel>预览</ToolLabel>
          <div className="flex flex-col items-center gap-[16px]">
            <div className="rounded-[8px] border border-[#E5E7EB] p-[12px]">
              <canvas ref={canvasRef} className="block" />
            </div>
            <ToolButton onClick={download} disabled={!text.trim()}>
              下载 PNG
            </ToolButton>
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
