"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { encodeGif, type EncodeFrame } from "./gif-lib";

const DESCRIPTION =
  "GIF合成器是一款多媒体制作工具，可以帮助用户将图片通过简单的步骤合成为一张高质量的GIF图。";

type FrameItem = {
  id: number;
  url: string;
  img: HTMLImageElement;
  delay: number;
};

let frameId = 0;

export default function Page() {
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loop, setLoop] = useState(true);
  const urlsRef = useRef<string[]>([]);
  const gifUrlRef = useRef<string | null>(null);

  const addFiles = useCallback((files: FileList) => {
    setErr("");
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const loaded: FrameItem[] = [];
    let pending = list.length;
    if (pending === 0) return;
    list.forEach((f) => {
      const url = URL.createObjectURL(f);
      urlsRef.current.push(url);
      const im = new Image();
      im.onload = () => {
        loaded.push({ id: frameId++, url, img: im, delay: 200 });
        pending--;
        if (pending === 0) {
          setFrames((prev) => [...prev, ...loaded]);
        }
      };
      im.onerror = () => {
        pending--;
        if (pending === 0) setFrames((prev) => [...prev, ...loaded]);
      };
      im.src = url;
    });
  }, []);

  const updateDelay = (id: number, delay: number) => {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, delay } : f)));
  };

  const removeFrame = (id: number) => {
    setFrames((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        urlsRef.current = urlsRef.current.filter((u) => u !== target.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const moveFrame = (id: number, dir: -1 | 1) => {
    setFrames((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const ni = idx + dir;
      if (ni < 0 || ni >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[ni]] = [next[ni], next[idx]];
      return next;
    });
  };

  const generate = useCallback(() => {
    if (frames.length < 2) {
      setErr("请至少添加 2 张图片");
      return;
    }
    setBusy(true);
    setErr("");
    // Use the smallest dimensions among frames; scale all to first frame's size for uniformity
    const first = frames[0];
    const w = first.img.naturalWidth;
    const h = first.img.naturalHeight;
    const encFrames: EncodeFrame[] = frames.map((f) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas 不可用");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(f.img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      return { rgba: new Uint8ClampedArray(data), width: w, height: h, delay: f.delay };
    });
    try {
      const blob = encodeGif(encFrames, w, h, loop ? 0 : 1);
      if (gifUrlRef.current) URL.revokeObjectURL(gifUrlRef.current);
      const url = URL.createObjectURL(blob);
      gifUrlRef.current = url;
      setGifUrl(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "GIF 合成失败");
    } finally {
      setBusy(false);
    }
  }, [frames, loop]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      if (gifUrlRef.current) URL.revokeObjectURL(gifUrlRef.current);
    };
  }, []);

  return (
    <ToolPageShell title="GIF合成" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] md:grid-cols-2">
          <div>
            <ToolLabel>添加图片（2 张以上）</ToolLabel>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
              className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
            />

            {frames.length > 0 && (
              <div className="mt-[16px] space-y-[10px]">
                {frames.map((f, i) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-[10px] rounded-[8px] border border-[#E5E7EB] p-[8px]"
                  >
                    <img
                      src={f.url}
                      alt={`frame-${i}`}
                      className="h-[44px] w-[44px] shrink-0 rounded-[4px] object-cover"
                    />
                    <span className="w-[28px] shrink-0 text-[13px] text-[#8F8F8F]">
                      #{i + 1}
                    </span>
                    <ToolInput
                      type="number"
                      value={String(f.delay)}
                      onChange={(v) => {
                        const n = parseInt(v, 10);
                        updateDelay(f.id, Number.isNaN(n) ? 200 : Math.max(20, n));
                      }}
                      placeholder="延时ms"
                      className="h-[34px] w-[110px]"
                    />
                    <span className="text-[12px] text-[#8F8F8F]">ms</span>
                    <div className="ml-auto flex gap-[4px]">
                      <button
                        type="button"
                        onClick={() => moveFrame(f.id, -1)}
                        disabled={i === 0}
                        className="h-[30px] w-[30px] cursor-pointer rounded-[4px] bg-[#F6F7FA] text-[14px] disabled:opacity-40 hover:bg-[#ebedf2]"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFrame(f.id, 1)}
                        disabled={i === frames.length - 1}
                        className="h-[30px] w-[30px] cursor-pointer rounded-[4px] bg-[#F6F7FA] text-[14px] disabled:opacity-40 hover:bg-[#ebedf2]"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFrame(f.id)}
                        className="h-[30px] w-[30px] cursor-pointer rounded-[4px] bg-[#FDECEC] text-[14px] text-[#E5484D] hover:bg-[#fbe0e0]"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-[16px] flex items-center gap-[16px]">
              <label className="flex cursor-pointer items-center gap-[6px] text-[14px] text-[#242424]">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="h-[16px] w-[16px] cursor-pointer"
                />
                循环播放
              </label>
            </div>

            <div className="mt-[20px] flex gap-[10px]">
              <ToolButton onClick={generate} disabled={frames.length < 2 || busy}>
                {busy ? "合成中…" : "合成 GIF"}
              </ToolButton>
              {gifUrl && (
                <ToolButton
                  variant="ghost"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = gifUrl;
                    a.download = "output.gif";
                    a.click();
                  }}
                >
                  下载 GIF
                </ToolButton>
              )}
            </div>
            {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
          </div>

          <div>
            <div className="mb-[6px] text-[13px] text-[#8F8F8F]">预览</div>
            {gifUrl ? (
              <img
                src={gifUrl}
                alt="gif preview"
                className="max-h-[420px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[13px] text-[#8F8F8F]">
                添加图片后合成 GIF 并预览
              </div>
            )}
          </div>
        </div>
      </ToolCard>
    </ToolPageShell>
  );
}
