"use client";

import { useEffect, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "手持弹幕LED专为生成手持LED显示屏上的弹幕内容而设计。通过这款工具，您可以轻松创建个性化的弹幕文字，并将其显示在手持LED设备上。";

type Direction = "left" | "right";

export default function Page() {
  const [text, setText] = useState("FoxHelper");
  const [color, setColor] = useState("#FF2D2D");
  const [bg, setBg] = useState("#000000");
  const [fontSize, setFontSize] = useState(120);
  const [speed, setSpeed] = useState(8); // seconds per loop
  const [direction, setDirection] = useState<Direction>("left");
  const [playing, setPlaying] = useState(true);

  const display = text.trim() ? text : "请输入文字";

  // Key forces the animation to restart when settings change so the
  // new duration/direction takes effect immediately.
  const [animKey, setAnimKey] = useState(0);
  const restart = () => setAnimKey((k) => k + 1);

  // Restart animation whenever a setting that affects the keyframes changes.
  useEffect(() => {
    restart();
  }, [speed, direction, text, fontSize]);

  const marqueeStyle: React.CSSProperties = {
    color,
    backgroundColor: bg,
    fontSize: `${fontSize}px`,
    lineHeight: 1.2,
    fontWeight: 700,
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
    letterSpacing: "0.05em",
    textShadow: `0 0 12px ${color}`,
  };

  return (
    <ToolPageShell title="手持弹幕LED" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>弹幕文字</ToolLabel>
          <ToolInput
            value={text}
            onChange={setText}
            placeholder="输入要在 LED 屏上显示的文字"
            className="mb-[16px] w-full"
          />

          <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-4">
            <div>
              <ToolLabel>文字颜色</ToolLabel>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-[40px] w-full cursor-pointer rounded-[8px] border border-[#E5E7EB]"
              />
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
            <div>
              <ToolLabel>字号（px）</ToolLabel>
              <input
                type="range"
                min={40}
                max={240}
                step={4}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#136CE9]"
              />
              <div className="text-[12px] text-[#8F8F8F]">{fontSize}</div>
            </div>
            <div>
              <ToolLabel>速度（秒/圈）</ToolLabel>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-[#136CE9]"
              />
              <div className="text-[12px] text-[#8F8F8F]">{speed}s</div>
            </div>
          </div>

          <div className="mt-[16px] flex flex-wrap items-center gap-[12px]">
            <div>
              <ToolLabel>滚动方向</ToolLabel>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
                className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-[10px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
              >
                <option value="left">向左滚动</option>
                <option value="right">向右滚动</option>
              </select>
            </div>
            <div className="flex items-end gap-[8px]">
              <ToolButton onClick={() => setPlaying((p) => !p)}>
                {playing ? "暂停" : "播放"}
              </ToolButton>
              <ToolButton variant="ghost" onClick={restart}>
                重新开始
              </ToolButton>
            </div>
          </div>
        </ToolCard>

        {/* LED display — full-width stage so it can be held up on a phone. */}
        <div className="overflow-hidden rounded-[12px] border border-[#1a1a1a] shadow-[0_0_24px_rgba(0,0,0,0.15)]">
          <div
            className="relative flex w-full items-center overflow-hidden"
            style={{ height: `${fontSize * 2}px`, backgroundColor: bg }}
          >
            <Marquee
              key={animKey}
              text={display}
              style={marqueeStyle}
              duration={speed}
              direction={direction}
              playing={playing}
              fontSize={fontSize}
            />
          </div>
        </div>

        <p className="text-[13px] text-[#8F8F8F]">
          提示：将手机横屏全屏展示，即可当作手持 LED 弹幕使用。
        </p>
      </div>
    </ToolPageShell>
  );
}

function Marquee({
  text,
  style,
  duration,
  direction,
  playing,
  fontSize,
}: {
  text: string;
  style: React.CSSProperties;
  duration: number;
  direction: Direction;
  playing: boolean;
  fontSize: number;
}) {
  // The track holds two copies of the text so the loop is seamless.
  // Animation translates from 0 to -50% (left) or -50% to 0 (right).
  const fromX = direction === "left" ? "0%" : "-50%";
  const toX = direction === "left" ? "-50%" : "0%";

  const keyframes = `@keyframes ledmarquee_${direction} {
    from { transform: translateX(${fromX}); }
    to { transform: translateX(${toX}); }
  }`;

  const trackStyle: React.CSSProperties = {
    display: "inline-flex",
    whiteSpace: "nowrap",
    animationName: `ledmarquee_${direction}`,
    animationDuration: `${duration}s`,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationPlayState: playing ? "running" : "paused",
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={trackStyle}>
        <span style={{ ...style, paddingRight: `${fontSize}px` }}>{text}</span>
        <span style={{ ...style, paddingRight: `${fontSize}px` }}>{text}</span>
      </div>
    </>
  );
}
