"use client";

import { useEffect, useState } from "react";
import { LedMarquee } from "@/components/led-marquee";
import { decodeLedConfig, type LedConfig } from "@/lib/led-config";
import { useLocationSearch } from "@/hooks/use-location-search";

export default function LedDisplayPage() {
  // useLocationSearch is SSR-safe (returns "" during prerender) so the
  // server and client render the same initial value — avoids hydration
  // mismatch (React error #418). On the client it reads the real query
  // string and decodeLedConfig produces the config.
  const search = useLocationSearch();
  const config: LedConfig = decodeLedConfig(search);
  const [playing, setPlaying] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Auto-hide controls after a few seconds of inactivity; tap to bring them back.
  useEffect(() => {
    if (!showControls) return;
    const t = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(t);
  }, [showControls]);

  const restart = () => setAnimKey((k) => k + 1);
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  return (
    <div
      onClick={() => setShowControls((s) => !s)}
      className="flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: config.bg }}
    >
      <div className="w-full">
        <LedMarquee
          key={animKey}
          text={config.text.trim() ? config.text : "请输入文字"}
          color={config.color}
          bg={config.bg}
          fontSize={config.fontSize}
          duration={config.speed}
          direction={config.direction}
          playing={playing}
        />
      </div>

      {showControls && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-[24px] left-1/2 flex w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 items-center gap-[8px] rounded-[999px] bg-white/85 px-[12px] py-[8px] backdrop-blur"
        >
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="h-[36px] flex-1 cursor-pointer rounded-[999px] bg-[#136CE9] px-[12px] text-[14px] font-medium text-white whitespace-nowrap"
          >
            {playing ? "暂停" : "播放"}
          </button>
          <button
            type="button"
            onClick={restart}
            className="h-[36px] flex-1 cursor-pointer rounded-[999px] bg-[#F6F7FA] px-[12px] text-[14px] font-medium text-[#242424] whitespace-nowrap"
          >
            重新开始
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="h-[36px] flex-1 cursor-pointer rounded-[999px] bg-[#F6F7FA] px-[12px] text-[14px] font-medium text-[#242424] whitespace-nowrap"
          >
            {isFullscreen ? "退出全屏" : "全屏"}
          </button>
        </div>
      )}
    </div>
  );
}
