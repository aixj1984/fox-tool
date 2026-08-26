"use client";

import { useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
  ToolInput,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "您可以选择在自己的原有头像上增加心仪的挂饰或是DIY定制头像。同时也可以通过编辑头像来加上家族徽记或是写下节日问候的话语";

type PendantKind = "crown" | "hat" | "flower" | "star" | "laurel" | "none";

const PENDANTS: { kind: PendantKind; label: string }[] = [
  { kind: "crown", label: "皇冠" },
  { kind: "hat", label: "礼帽" },
  { kind: "flower", label: "花朵" },
  { kind: "star", label: "星星" },
  { kind: "laurel", label: "桂冠" },
  { kind: "none", label: "无挂饰" },
];

const CANVAS_SIZE = 320;

// 默认头像：用渐变填充 + 笑脸
function drawDefaultAvatar(
  ctx: CanvasRenderingContext2D,
  size: number,
): void {
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#FFB385");
  grad.addColorStop(1, "#FF8A5C");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fill();

  // 简笔笑脸
  ctx.fillStyle = "#3A2E2A";
  // 眼睛
  ctx.beginPath();
  ctx.arc(size / 2 - 36, size / 2 - 16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size / 2 + 36, size / 2 - 16, 6, 0, Math.PI * 2);
  ctx.fill();
  // 嘴
  ctx.strokeStyle = "#3A2E2A";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 + 18, 28, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

// 内联 SVG 挂饰 → canvas 绘制
function drawPendant(
  ctx: CanvasRenderingContext2D,
  kind: PendantKind,
  cx: number,
  cy: number,
  scale: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  switch (kind) {
    case "crown": {
      // 金色皇冠
      ctx.fillStyle = "#FFC83A";
      ctx.strokeStyle = "#D89E12";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-60, 30);
      ctx.lineTo(-60, -10);
      ctx.lineTo(-30, 10);
      ctx.lineTo(0, -30);
      ctx.lineTo(30, 10);
      ctx.lineTo(60, -10);
      ctx.lineTo(60, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 宝石
      ctx.fillStyle = "#E5484D";
      ctx.beginPath();
      ctx.arc(-30, 18, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#136CE9";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#30A46C";
      ctx.beginPath();
      ctx.arc(30, 18, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "hat": {
      // 礼帽
      ctx.fillStyle = "#3A2E2A";
      ctx.strokeStyle = "#1F1815";
      ctx.lineWidth = 2;
      // 帽顶
      ctx.fillRect(-50, -50, 100, 50);
      ctx.strokeRect(-50, -50, 100, 50);
      // 帽檐
      ctx.beginPath();
      ctx.ellipse(0, 0, 75, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 装饰带
      ctx.fillStyle = "#E5484D";
      ctx.fillRect(-50, -10, 100, 10);
      break;
    }
    case "flower": {
      // 花朵 - 五瓣
      const petals = 6;
      const petalR = 22;
      const centerR = 14;
      ctx.fillStyle = "#F5A524";
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2;
        const px = Math.cos(angle) * petalR;
        const py = Math.sin(angle) * petalR;
        ctx.fillStyle = i % 2 === 0 ? "#F5A524" : "#FFB385";
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#E5484D";
      ctx.beginPath();
      ctx.arc(0, 0, centerR, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "star": {
      // 五角星
      ctx.fillStyle = "#FFD43A";
      ctx.strokeStyle = "#D89E12";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const outer = 50;
      const inner = 20;
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "laurel": {
      // 桂冠 / 叶环
      ctx.strokeStyle = "#30A46C";
      ctx.fillStyle = "#3CB371";
      ctx.lineWidth = 3;
      // 两侧月桂叶
      for (const dir of [-1, 1]) {
        ctx.save();
        ctx.scale(dir, 1);
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.rotate((i * 18 * Math.PI) / 180);
          ctx.beginPath();
          ctx.ellipse(40 - i * 4, -10 - i * 8, 16, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
      // 连接带
      ctx.strokeStyle = "#D89E12";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 50, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      break;
    }
    case "none":
    default:
      break;
  }
  ctx.restore();
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);

  const [pendant, setPendant] = useState<PendantKind>("crown");
  const [pendantX, setPendantX] = useState<number>(CANVAS_SIZE / 2);
  const [pendantY, setPendantY] = useState<number>(CANVAS_SIZE * 0.28);
  const [pendantScale, setPendantScale] = useState<number>(1);
  const [pendantRotation, setPendantRotation] = useState<number>(0);

  const [text, setText] = useState<string>("新年快乐");
  const [textSize, setTextSize] = useState<number>(28);
  const [textColor, setTextColor] = useState<string>("#E5484D");
  const [textX, setTextX] = useState<number>(CANVAS_SIZE / 2);
  const [textY, setTextY] = useState<number>(CANVAS_SIZE * 0.85);
  const [showText, setShowText] = useState<boolean>(true);

  // 加载默认头像
  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 任意状态变化都重新渲染
  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imageEl,
    pendant,
    pendantX,
    pendantY,
    pendantScale,
    pendantRotation,
    text,
    textSize,
    textColor,
    textX,
    textY,
    showText,
  ]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 背景
    if (imageEl) {
      ctx.drawImage(imageEl, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else {
      drawDefaultAvatar(ctx, CANVAS_SIZE);
    }

    // 挂饰
    if (pendant !== "none") {
      ctx.save();
      ctx.translate(pendantX, pendantY);
      ctx.rotate((pendantRotation * Math.PI) / 180);
      drawPendant(ctx, pendant, 0, 0, pendantScale);
      ctx.restore();
    }

    // 文字
    if (showText && text.trim() !== "") {
      ctx.save();
      ctx.font = `bold ${textSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      // 描边
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = Math.max(2, textSize / 10);
      ctx.lineJoin = "round";
      ctx.strokeText(text, textX, textY);
      ctx.fillStyle = textColor;
      ctx.fillText(text, textX, textY);
      ctx.restore();
    }
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImageEl(img);
        setHasImage(true);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const useDefault = () => {
    setImageEl(null);
    setHasImage(false);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "avatar-pendant.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sliderClass =
    "h-[6px] w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#136CE9]";

  return (
    <ToolPageShell title="头像挂饰" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-[360px_1fr]">
        {/* 预览 */}
        <ToolCard>
          <ToolLabel>预览</ToolLabel>
          <div className="mt-[8px] flex justify-center rounded-[10px] bg-[#F6F7FA] p-[16px]">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="rounded-[8px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.06)]"
            />
          </div>
          <div className="mt-[12px] flex gap-[8px]">
            <label className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[8px] bg-[#136CE9] px-[20px] text-[14px] font-medium text-white hover:bg-[#0f5fc4]">
              上传头像
              <input
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="hidden"
              />
            </label>
            <ToolButton variant="ghost" onClick={useDefault}>
              使用默认
            </ToolButton>
          </div>
          <div className="mt-[12px] text-[12px] text-[#8F8F8F]">
            {hasImage ? "已加载自定义头像" : "使用默认头像，可上传自定义图片替换"}
          </div>
          <div className="mt-[16px]">
            <ToolButton onClick={download} className="w-full">
              下载头像 PNG
            </ToolButton>
          </div>
        </ToolCard>

        {/* 控件 */}
        <div className="space-y-[16px]">
          <ToolCard>
            <ToolLabel>选择挂饰</ToolLabel>
            <div className="mt-[8px] grid grid-cols-3 gap-[8px] md:grid-cols-6">
              {PENDANTS.map((p) => (
                <button
                  key={p.kind}
                  type="button"
                  onClick={() => setPendant(p.kind)}
                  className={`h-[44px] rounded-[8px] text-[13px] transition-colors ${
                    pendant === p.kind
                      ? "bg-[#136CE9] text-white"
                      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {pendant !== "none" ? (
              <div className="mt-[16px] space-y-[12px]">
                <div>
                  <div className="mb-[4px] flex justify-between text-[13px] text-[#5A5A5A]">
                    <span>水平位置</span>
                    <span>{Math.round(pendantX)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={CANVAS_SIZE}
                    value={pendantX}
                    onChange={(e) => setPendantX(Number(e.target.value))}
                    className={sliderClass}
                  />
                </div>
                <div>
                  <div className="mb-[4px] flex justify-between text-[13px] text-[#5A5A5A]">
                    <span>垂直位置</span>
                    <span>{Math.round(pendantY)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={CANVAS_SIZE}
                    value={pendantY}
                    onChange={(e) => setPendantY(Number(e.target.value))}
                    className={sliderClass}
                  />
                </div>
                <div>
                  <div className="mb-[4px] flex justify-between text-[13px] text-[#5A5A5A]">
                    <span>缩放</span>
                    <span>{pendantScale.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={2.5}
                    step={0.05}
                    value={pendantScale}
                    onChange={(e) => setPendantScale(Number(e.target.value))}
                    className={sliderClass}
                  />
                </div>
                <div>
                  <div className="mb-[4px] flex justify-between text-[13px] text-[#5A5A5A]">
                    <span>旋转</span>
                    <span>{pendantRotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={pendantRotation}
                    onChange={(e) => setPendantRotation(Number(e.target.value))}
                    className={sliderClass}
                  />
                </div>
              </div>
            ) : null}
          </ToolCard>

          <ToolCard>
            <div className="mb-[8px] flex items-center justify-between">
              <ToolLabel>节日问候文字</ToolLabel>
              <label className="inline-flex items-center gap-[6px] text-[13px] text-[#5A5A5A]">
                <input
                  type="checkbox"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  className="accent-[#136CE9]"
                />
                显示文字
              </label>
            </div>
            <ToolInput
              value={text}
              onChange={setText}
              placeholder="输入节日问候，如：新年快乐、生日快乐"
            />
            {showText ? (
              <div className="mt-[12px] space-y-[12px]">
                <div className="grid grid-cols-2 gap-[12px]">
                  <div>
                    <div className="mb-[4px] text-[13px] text-[#5A5A5A]">文字大小</div>
                    <input
                      type="range"
                      min={14}
                      max={56}
                      value={textSize}
                      onChange={(e) => setTextSize(Number(e.target.value))}
                      className={sliderClass}
                    />
                    <div className="mt-[2px] text-[12px] text-[#8F8F8F]">{textSize}px</div>
                  </div>
                  <div>
                    <div className="mb-[4px] text-[13px] text-[#5A5A5A]">文字颜色</div>
                    <div className="flex gap-[6px]">
                      {["#E5484D", "#136CE9", "#30A46C", "#F5A524", "#242424", "#FFFFFF"].map(
                        (c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setTextColor(c)}
                            className={`h-[28px] w-[28px] rounded-full border-2 ${
                              textColor === c ? "border-[#136CE9]" : "border-transparent"
                            }`}
                            style={{ background: c }}
                            aria-label={`选择颜色 ${c}`}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[12px]">
                  <div>
                    <div className="mb-[4px] flex justify-between text-[13px] text-[#5A5A5A]">
                      <span>水平位置</span>
                      <span>{Math.round(textX)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={CANVAS_SIZE}
                      value={textX}
                      onChange={(e) => setTextX(Number(e.target.value))}
                      className={sliderClass}
                    />
                  </div>
                  <div>
                    <div className="mb-[4px] flex justify-between text-[13px] text-[#5A5A5A]">
                      <span>垂直位置</span>
                      <span>{Math.round(textY)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={CANVAS_SIZE}
                      value={textY}
                      onChange={(e) => setTextY(Number(e.target.value))}
                      className={sliderClass}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </ToolCard>

          <div className="rounded-[10px] bg-[#F6F7FA] p-[12px] text-[12px] leading-[18px] text-[#8F8F8F]">
            可以上传自有头像，挑选喜欢的挂饰（皇冠/礼帽/花朵/星星/桂冠），调整位置、缩放和旋转，
            再加上节日问候文字，完成后点击&ldquo;下载头像 PNG&rdquo;保存到本地。所有合成均在浏览器本地完成，
            不会上传任何图像。
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
