"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "字帖生成是一款在线工具，专为生成个性化字帖而设计。通过这款工具，您可以选择不同的模板、年级，快速生成适合练习书写的字帖。";

type GridType = "mizi" | "tian" | "jiugong" | "huigong";
type FontType = "kai" | "song" | "li";

const GRIDS: { key: GridType; label: string }[] = [
  { key: "mizi", label: "米字格" },
  { key: "tian", label: "田字格" },
  { key: "jiugong", label: "九宫格" },
  { key: "huigong", label: "回宫格" },
];

const FONTS: { key: FontType; label: string; family: string }[] = [
  { key: "kai", label: "楷书", family: '"KaiTi", "STKaiti", "楷体", serif' },
  { key: "song", label: "宋体", family: '"SimSun", "宋体", "Songti SC", serif' },
  { key: "li", label: "隶书", family: '"LiSu", "STLiti", "隶书", serif' },
];

const DEFAULT_TEXT = "天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏";

function drawGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: GridType,
) {
  ctx.save();
  ctx.strokeStyle = "#D4A574";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, size, size);

  ctx.strokeStyle = "#E8C9A0";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);

  const cx = x + size / 2;
  const cy = y + size / 2;

  if (type === "mizi") {
    // 米字格: 两条对角线 + 水平/垂直中线
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.moveTo(cx, y);
    ctx.lineTo(cx, y + size);
    ctx.moveTo(x, cy);
    ctx.lineTo(x + size, cy);
    ctx.stroke();
  } else if (type === "tian") {
    // 田字格: 水平中线 + 垂直中线
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx, y + size);
    ctx.moveTo(x, cy);
    ctx.lineTo(x + size, cy);
    ctx.stroke();
  } else if (type === "jiugong") {
    // 九宫格: 两条水平 + 两条垂直，分成 9 格
    const t1 = x + size / 3;
    const t2 = x + (2 * size) / 3;
    const s1 = y + size / 3;
    const s2 = y + (2 * size) / 3;
    ctx.beginPath();
    ctx.moveTo(t1, y);
    ctx.lineTo(t1, y + size);
    ctx.moveTo(t2, y);
    ctx.lineTo(t2, y + size);
    ctx.moveTo(x, s1);
    ctx.lineTo(x + size, s1);
    ctx.moveTo(x, s2);
    ctx.lineTo(x + size, s2);
    ctx.stroke();
  } else if (type === "huigong") {
    // 回宫格: 内框 + 中线
    const inset = size * 0.2;
    ctx.beginPath();
    ctx.rect(x + inset, y + inset, size - 2 * inset, size - 2 * inset);
    ctx.moveTo(cx, y);
    ctx.lineTo(cx, y + size);
    ctx.moveTo(x, cy);
    ctx.lineTo(x + size, cy);
    ctx.stroke();
  }
  ctx.restore();
}

export default function Page() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [fontKey, setFontKey] = useState<FontType>("kai");
  const [grid, setGrid] = useState<GridType>("mizi");
  const [perLine, setPerLine] = useState(8);
  const [rows, setRows] = useState(6);
  const [fontSize, setFontSize] = useState(72);
  const [mode, setMode] = useState<"tracing" | "blank">("tracing");
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const font = FONTS.find((f) => f.key === fontKey) ?? FONTS[0];

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // 取出去除空白与标点的汉字
    const chars = Array.from(text.replace(/[\s\p{P}\p{S}]/gu, ""));
    if (chars.length === 0) return;

    const cell = fontSize + 24; // 格子边长 = 字号 + 内边距
    const padX = 40;
    const padY = 40;
    const lineGap = 12;
    const cols = Math.max(1, perLine);
    const rowCount = Math.max(1, rows);

    const w = padX * 2 + cols * cell;
    const h = padY * 2 + rowCount * cell + (rowCount - 1) * lineGap;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 白底
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);

    ctx.font = `${fontSize}px ${font.family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const total = rowCount * cols;
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = padX + c * cell;
      const y = padY + r * (cell + lineGap);

      drawGrid(ctx, x, y, cell, grid);

      if (mode === "tracing" && i < chars.length) {
        // 描红：浅灰色字符供临摹
        ctx.save();
        ctx.fillStyle = "#CCCCCC";
        ctx.fillText(chars[i], x + cell / 2, y + cell / 2);
        ctx.restore();
      }
    }

    if (outUrl) URL.revokeObjectURL(outUrl);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setOutUrl(URL.createObjectURL(blob));
    }, "image/png");
  }, [text, font, grid, perLine, rows, fontSize, mode, outUrl]);

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, fontKey, grid, perLine, rows, fontSize, mode]);

  useEffect(() => {
    return () => {
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [outUrl]);

  const chars = Array.from(text.replace(/[\s\p{P}\p{S}]/gu, ""));

  return (
    <ToolPageShell title="字帖生成" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] lg:grid-cols-[360px_1fr]">
          <div className="space-y-[16px]">
            <div>
              <ToolLabel>字帖内容</ToolLabel>
              <ToolTextarea
                value={text}
                onChange={setText}
                rows={4}
                placeholder="输入要练习的汉字"
              />
              <p className="mt-[6px] text-[12px] text-[#8F8F8F]">
                共 {chars.length} 个汉字（自动忽略标点与空格）
              </p>
            </div>

            <div>
              <ToolLabel>字体</ToolLabel>
              <div className="flex gap-[10px]">
                {FONTS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFontKey(f.key)}
                    className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
                      fontKey === f.key
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <ToolLabel>模板</ToolLabel>
              <div className="grid grid-cols-2 gap-[10px]">
                {GRIDS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGrid(g.key)}
                    className={`h-[40px] cursor-pointer rounded-[8px] px-[14px] text-[14px] font-medium transition-colors ${
                      grid === g.key
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <ToolLabel>显示模式</ToolLabel>
              <div className="flex gap-[10px]">
                <button
                  type="button"
                  onClick={() => setMode("tracing")}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
                    mode === "tracing"
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  描红字帖
                </button>
                <button
                  type="button"
                  onClick={() => setMode("blank")}
                  className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
                    mode === "blank"
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  空白临摹
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[12px]">
              <div>
                <ToolLabel>每行字数：{perLine}</ToolLabel>
                <input
                  type="range"
                  min={4}
                  max={12}
                  step={1}
                  value={perLine}
                  onChange={(e) => setPerLine(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
              <div>
                <ToolLabel>行数：{rows}</ToolLabel>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
              <div>
                <ToolLabel>字号：{fontSize}px</ToolLabel>
                <input
                  type="range"
                  min={40}
                  max={120}
                  step={4}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-[10px]">
              <ToolButton onClick={render}>重新生成</ToolButton>
              {outUrl && (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = outUrl;
                    a.download = "字帖.png";
                    a.click();
                  }}
                >
                  下载 PNG
                </ToolButton>
              )}
            </div>
          </div>

          <div>
            <div className="mb-[6px] text-[13px] text-[#8F8F8F]">预览（可打印）</div>
            <div className="max-h-[600px] overflow-auto rounded-[8px] border border-[#E5E7EB] bg-[#FAFAFA] p-[12px]">
              {outUrl ? (
                <img
                  src={outUrl}
                  alt="字帖预览"
                  className="mx-auto max-w-full"
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-[13px] text-[#8F8F8F]">
                  正在生成字帖……
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
