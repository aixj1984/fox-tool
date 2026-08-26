"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { decodeGif } from "../gifcreate/gif-lib";

const DESCRIPTION =
  "GIF分解是一款实用的在线工具，专为将GIF动画分解为单帧图片而设计。通过这款工具，您可以轻松将一个GIF文件中的每一帧提取出来。";

type Frame = {
  url: string;
  delay: number;
  index: number;
};

export default function Page() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [err, setErr] = useState("");
  const [fileName, setFileName] = useState("gif");
  const [busy, setBusy] = useState(false);
  const urlsRef = useRef<string[]>([]);

  const onFile = useCallback(async (f: File) => {
    setErr("");
    setBusy(true);
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
    setFrames([]);
    try {
      const buf = await f.arrayBuffer();
      const result = decodeGif(buf);
      setFileName(f.name.replace(/\.[^.]+$/, "") || "gif");
      const out: Frame[] = [];
      for (let i = 0; i < result.frames.length; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = result.width;
        canvas.height = result.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.putImageData(result.frames[i].imageData, 0, 0);
        const url = canvas.toDataURL("image/png");
        urlsRef.current.push(url);
        out.push({ url, delay: result.frames[i].delay, index: i });
      }
      setFrames(out);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "GIF 解析失败");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  return (
    <ToolPageShell title="GIF分解" description={DESCRIPTION}>
      <ToolCard>
        <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
          选择 GIF 文件
        </label>
        <input
          type="file"
          accept="image/gif"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
          className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
        />
        {busy && <div className="mt-[12px] text-[13px] text-[#136CE9]">正在解析 GIF 帧…</div>}
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}

        {frames.length > 0 && (
          <div className="mt-[20px]">
            <div className="mb-[12px] flex items-center justify-between">
              <span className="text-[14px] text-[#242424]">
                共 {frames.length} 帧
              </span>
              <ToolButton
                variant="ghost"
                onClick={() => {
                  frames.forEach((fr) => {
                    const a = document.createElement("a");
                    a.href = fr.url;
                    a.download = `${fileName}_frame_${fr.index + 1}.png`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  });
                }}
              >
                下载全部
              </ToolButton>
            </div>
            <div className="grid grid-cols-4 gap-[12px] sm:grid-cols-6">
              {frames.map((fr) => (
                <a
                  key={fr.index}
                  href={fr.url}
                  download={`${fileName}_frame_${fr.index + 1}.png`}
                  className="group block overflow-hidden rounded-[6px] border border-[#E5E7EB] transition-transform hover:scale-[1.04]"
                  title={`第 ${fr.index + 1} 帧，延时 ${fr.delay}ms`}
                >
                  <img
                    src={fr.url}
                    alt={`frame-${fr.index + 1}`}
                    className="block w-full"
                  />
                  <div className="bg-[#F6F7FA] px-[6px] py-[3px] text-[11px] text-[#8F8F8F]">
                    #{fr.index + 1} · {fr.delay}ms
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {frames.length === 0 && !busy && !err && (
          <div className="mt-[20px] flex h-[160px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[13px] text-[#8F8F8F]">
            上传 GIF 后将分解出每一帧
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
