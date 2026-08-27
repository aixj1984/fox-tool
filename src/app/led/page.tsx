"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { LedMarquee } from "@/components/led-marquee";
import { encodeLedConfig, type LedDirection } from "@/lib/led-config";
import { basePath } from "@/lib/img-path";
import { useLocationOrigin } from "@/hooks/use-location-origin";

const DESCRIPTION =
  "手持弹幕LED专为生成手持LED显示屏上的弹幕内容而设计。通过这款工具，您可以轻松创建个性化的弹幕文字，并将其显示在手持LED设备上。";

export default function Page() {
  const [text, setText] = useState("FoxHelper");
  const [color, setColor] = useState("#FF2D2D");
  const [bg, setBg] = useState("#000000");
  const [fontSize, setFontSize] = useState(120);
  const [speed, setSpeed] = useState(8); // seconds per loop
  const [direction, setDirection] = useState<LedDirection>("left");
  const [playing, setPlaying] = useState(true);

  const display = text.trim() ? text : "请输入文字";

  const [animKey, setAnimKey] = useState(0);
  const restart = () => setAnimKey((k) => k + 1);

  // Compose a key from the settings that affect the animation so React
  // remounts the marquee (restarting the keyframes) whenever they change —
  // no manual effect needed. `animKey` is appended so the 重新开始 button
  // can force a restart on demand.
  const marqueeKey = `${animKey}-${speed}-${direction}-${fontSize}-${text}`;

  // Build a shareable display URL that mirrors the current settings.
  // useLocationOrigin is SSR-safe (returns "" during prerender) so the
  // server and client first render the same value — avoids hydration mismatch.
  const origin = useLocationOrigin();
  const displayUrl = origin
    ? `${origin}${basePath}/led/display?${encodeLedConfig({ text, color, bg, fontSize, speed, direction })}`
    : "";

  const [qrUrl, setQrUrl] = useState("");
  useEffect(() => {
    if (!displayUrl) return;
    let cancelled = false;
    QRCode.toDataURL(displayUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [displayUrl]);

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
            <div className="flex items-center gap-[8px]">
              <span className="text-[14px] font-medium text-[#242424]">滚动方向</span>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as LedDirection)}
                className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-[10px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
              >
                <option value="left">向左滚动</option>
                <option value="right">向右滚动</option>
              </select>
            </div>
            <div className="flex items-center gap-[8px]">
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
            <LedMarquee
              key={marqueeKey}
              text={display}
              color={color}
              bg={bg}
              fontSize={fontSize}
              duration={speed}
              direction={direction}
              playing={playing}
            />
          </div>
        </div>

        <ToolCard>
          <div className="grid gap-[20px] sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="justify-self-center">
              {qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="LED 展示页二维码"
                  width={200}
                  height={200}
                  className="rounded-[8px] border border-[#E5E7EB]"
                />
              ) : (
                <div className="h-[200px] w-[200px] rounded-[8px] border border-[#E5E7EB] bg-[#FAFAFA]" />
              )}
            </div>
            <div>
              <div className="mb-[6px] flex items-center justify-between gap-[12px]">
                <ToolLabel>扫码在手机上展示</ToolLabel>
                {displayUrl && <CopyButton text={displayUrl} label="复制链接" />}
              </div>
              <p className="break-all text-[13px] leading-[20px] text-[#8F8F8F]">
                {displayUrl || "正在生成链接……"}
              </p>
              <p className="mt-[10px] text-[12px] text-[#8F8F8F]">
                扫码或打开链接进入独立展示页，文字和样式与当前一致；在手机上点一下屏幕可呼出极简工具栏，建议横屏全屏使用。
              </p>
            </div>
          </div>
        </ToolCard>

        <p className="text-[13px] text-[#8F8F8F]">
          提示：将手机横屏全屏展示，即可当作手持 LED 弹幕使用。
        </p>
      </div>
    </ToolPageShell>
  );
}
