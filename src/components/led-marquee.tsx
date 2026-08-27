"use client";

import type { CSSProperties } from "react";
import type { LedDirection } from "@/lib/led-config";

export function LedMarquee({
  text,
  color,
  bg,
  fontSize,
  duration,
  direction,
  playing,
}: {
  text: string;
  color: string;
  bg: string;
  fontSize: number;
  duration: number;
  direction: LedDirection;
  playing: boolean;
}) {
  const fromX = direction === "left" ? "0%" : "-50%";
  const toX = direction === "left" ? "-50%" : "0%";

  const keyframes = `@keyframes ledmarquee_${direction} {
    from { transform: translateX(${fromX}); }
    to { transform: translateX(${toX}); }
  }`;

  const trackStyle: CSSProperties = {
    display: "inline-flex",
    whiteSpace: "nowrap",
    animationName: `ledmarquee_${direction}`,
    animationDuration: `${duration}s`,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationPlayState: playing ? "running" : "paused",
  };

  const spanStyle: CSSProperties = {
    color,
    backgroundColor: bg,
    fontSize: `${fontSize}px`,
    lineHeight: 1.2,
    fontWeight: 700,
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
    letterSpacing: "0.05em",
    textShadow: `0 0 12px ${color}`,
    paddingRight: `${fontSize}px`,
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={trackStyle}>
        <span style={spanStyle}>{text}</span>
        <span style={spanStyle}>{text}</span>
      </div>
    </>
  );
}
