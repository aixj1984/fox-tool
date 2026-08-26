"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { encodeGif, type EncodeFrame } from "../gifcreate/gif-lib";

const DESCRIPTION =
  "视频转GIF是一款实用的在线工具，专为将视频文件转换为GIF动画而设计。通过这款工具，您可以轻松将视频中的精彩片段提取并转换为GIF格式，便于在社交媒体、聊天应用和其他平台上分享和使用。";

export default function Page() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [clipDuration, setClipDuration] = useState(3);
  const [fps, setFps] = useState(10);
  const [outWidth, setOutWidth] = useState(480);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const gifUrlRef = useRef<string | null>(null);

  // Cleanup object URLs on unmount.
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      if (gifUrlRef.current) URL.revokeObjectURL(gifUrlRef.current);
    };
  }, []);

  const onFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setErr("请选择视频文件");
      return;
    }
    setErr("");
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    if (gifUrlRef.current) {
      URL.revokeObjectURL(gifUrlRef.current);
      gifUrlRef.current = null;
      setGifUrl(null);
    }
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setVideoUrl(url);
    setVideoName(file.name);
    setProgress(0);
  };

  const onLoadedMetadata = () => {
    const v = videoElRef.current;
    if (!v) return;
    setDuration(v.duration || 0);
    setStart(0);
    setClipDuration(Math.min(3, Math.max(0.1, v.duration || 3)));
  };

  // Seek the video element to a time and wait for the seek to complete.
  const seekTo = (v: HTMLVideoElement, t: number) =>
    new Promise<void>((resolve, reject) => {
      const onSeeked = () => {
        v.removeEventListener("seeked", onSeeked);
        v.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        v.removeEventListener("seeked", onSeeked);
        v.removeEventListener("error", onError);
        reject(new Error("视频跳转失败"));
      };
      v.addEventListener("seeked", onSeeked);
      v.addEventListener("error", onError);
      v.currentTime = t;
    });

  const generate = useCallback(async () => {
    const v = videoElRef.current;
    if (!v) {
      setErr("请先选择视频文件");
      return;
    }
    if (!isFinite(v.duration) || v.duration <= 0) {
      setErr("视频尚未加载完成");
      return;
    }
    const startT = Math.max(0, Math.min(start, v.duration - 0.05));
    const dur = Math.max(0.1, Math.min(clipDuration, v.duration - startT));
    const frameCount = Math.max(1, Math.floor(dur * fps));
    if (frameCount > 500) {
      setErr("帧数过多（超过 500），请缩短时长或降低帧率");
      return;
    }
    setBusy(true);
    setErr("");
    setProgress(0);
    try {
      // Pause and prepare for frame capture.
      v.pause();
      v.muted = true;

      const srcW = v.videoWidth;
      const srcH = v.videoHeight;
      if (!srcW || !srcH) throw new Error("无法读取视频画面尺寸");
      const w = Math.max(16, Math.min(outWidth, srcW));
      const h = Math.round((w * srcH) / srcW);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 不可用");

      const frames: EncodeFrame[] = [];
      const delay = Math.round(1000 / fps);

      for (let i = 0; i < frameCount; i++) {
        const t = startT + (i / fps);
        await seekTo(v, Math.min(t, v.duration - 0.001));
        ctx.drawImage(v, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        frames.push({
          rgba: new Uint8ClampedArray(data),
          width: w,
          height: h,
          delay,
        });
        setProgress(Math.round(((i + 1) / frameCount) * 100));
        // Yield to the event loop so the UI updates.
        await new Promise((r) => setTimeout(r, 0));
      }

      const blob = encodeGif(frames, w, h, 0);
      if (gifUrlRef.current) URL.revokeObjectURL(gifUrlRef.current);
      const url = URL.createObjectURL(blob);
      gifUrlRef.current = url;
      setGifUrl(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "GIF 生成失败");
    } finally {
      setBusy(false);
    }
  }, [start, clipDuration, fps, outWidth]);

  const download = () => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = `${videoName.replace(/\.[^.]+$/, "") || "video"}.gif`;
    a.click();
  };

  return (
    <ToolPageShell title="视频转GIF" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>选择视频文件</ToolLabel>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
            className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
          />
          {videoUrl && (
            <div className="mt-[12px]">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  videoElRef.current = el;
                }}
                src={videoUrl}
                controls
                playsInline
                onLoadedMetadata={onLoadedMetadata}
                className="max-h-[360px] w-full rounded-[8px] border border-[#E5E7EB] bg-black"
              />
            </div>
          )}
          {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        </ToolCard>

        {videoUrl && (
          <ToolCard>
            <div className="grid gap-[16px] md:grid-cols-2">
              <NumberField
                label={`开始时间（秒）· 视频总长 ${duration.toFixed(1)}s`}
                value={start}
                onChange={(n) => setStart(Math.max(0, Math.min(n, duration - 0.1)))}
                min={0}
                max={Math.max(0, duration - 0.1)}
                step={0.1}
              />
              <NumberField
                label="截取时长（秒）"
                value={clipDuration}
                onChange={(n) =>
                  setClipDuration(
                    Math.max(0.1, Math.min(n, duration - start)),
                  )
                }
                min={0.1}
                max={Math.max(0.1, duration - start)}
                step={0.1}
              />
              <NumberField
                label="帧率（FPS）"
                value={fps}
                onChange={(n) => setFps(Math.max(1, Math.min(n, 30)))}
                min={1}
                max={30}
                step={1}
              />
              <NumberField
                label="输出宽度（像素，等比缩放）"
                value={outWidth}
                onChange={(n) => setOutWidth(Math.max(16, Math.min(n, 1280)))}
                min={16}
                max={1280}
                step={16}
              />
            </div>

            <div className="mt-[8px] text-[13px] text-[#8F8F8F]">
              预计生成 {Math.max(1, Math.floor(clipDuration * fps))} 帧，每帧间隔 {Math.round(1000 / fps)}ms
            </div>

            <div className="mt-[16px] flex flex-wrap gap-[10px]">
              <ToolButton onClick={generate} disabled={busy || !videoUrl}>
                {busy ? `生成中… ${progress}%` : "生成 GIF"}
              </ToolButton>
              {gifUrl && (
                <ToolButton variant="ghost" onClick={download}>
                  下载 GIF
                </ToolButton>
              )}
            </div>

            {busy && (
              <div className="mt-[12px] h-[6px] w-full overflow-hidden rounded-[3px] bg-[#F6F7FA]">
                <div
                  className="h-full bg-[#136CE9] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </ToolCard>
        )}

        {gifUrl && (
          <ToolCard>
            <div className="mb-[8px] text-[14px] font-medium text-[#242424]">
              GIF 预览
            </div>
            <img
              src={gifUrl}
              alt="gif preview"
              className="max-h-[360px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
            />
          </ToolCard>
        )}

        <ToolCard>
          <div className="text-[13px] leading-[22px] text-[#8F8F8F]">
            本工具完全在浏览器本地运行：通过 HTML5 video 逐帧跳转，使用 Canvas 抓取画面，再编码为 GIF。无需上传视频文件，保护您的隐私。帧数过多时生成会较慢，建议控制在 200 帧以内。
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div>
      <ToolLabel>{label}</ToolLabel>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          onChange(Number.isNaN(n) ? min : n);
        }}
        className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
      />
    </div>
  );
}
