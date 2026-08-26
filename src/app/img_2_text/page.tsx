"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
  CopyButton,
  ToolTextarea,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "图片转字符画可以将任意图片转换为由字符组成的艺术作品，适用于社交媒体分享、个性化设计和编程项目等多种场景。";

const CHARSETS: { name: string; chars: string }[] = [
  { name: "经典", chars: " .:-=+*#%@" },
  { name: "密集", chars: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$" },
  { name: "方块", chars: " ░▒▓█" },
  { name: "二值", chars: " █" },
];

export default function Page() {
  const [src, setSrc] = useState<string | null>(null);
  const [width, setWidth] = useState(100);
  const [charsetIdx, setCharsetIdx] = useState(0);
  const [invert, setInvert] = useState(false);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onFile = useCallback((f: File) => {
    setErr("");
    setOutput("");
    if (src) URL.revokeObjectURL(src);
    const url = URL.createObjectURL(f);
    setSrc(url);
    const im = new Image();
    im.onload = () => {
      imgRef.current = im;
      generate();
    };
    im.onerror = () => setErr("图片加载失败");
    im.src = url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const generate = useCallback(() => {
    const im = imgRef.current;
    if (!im) return;
    const chars = CHARSETS[charsetIdx].chars;
    const targetW = Math.max(8, Math.min(400, width));
    const scale = im.naturalHeight / im.naturalWidth;
    // characters are taller than wide; compensate by 0.5
    const targetH = Math.max(1, Math.round(targetW * scale * 0.5));
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(im, 0, 0, targetW, targetH);
    const data = ctx.getImageData(0, 0, targetW, targetH).data;
    let result = "";
    for (let y = 0; y < targetH; y++) {
      let line = "";
      for (let x = 0; x < targetW; x++) {
        const idx = (y * targetW + x) * 4;
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        let n = lum / 255;
        if (invert) n = 1 - n;
        const ci = Math.min(chars.length - 1, Math.floor(n * chars.length));
        line += chars[ci];
      }
      result += line + "\n";
    }
    setOutput(result);
  }, [charsetIdx, width, invert]);

  useEffect(() => {
    if (imgRef.current) generate();
  }, [charsetIdx, width, invert, generate]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  const downloadTxt = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-art.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageShell title="图片转字符画" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid gap-[24px] md:grid-cols-[320px_1fr]">
          <div>
            <ToolLabel>选择图片</ToolLabel>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
              className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
            />
            {src && (
              <img
                src={src}
                alt="原图"
                className="mt-[12px] max-h-[160px] w-full rounded-[8px] border border-[#E5E7EB] object-contain"
              />
            )}

            <div className="mt-[16px]">
              <ToolLabel>字符宽度：{width}</ToolLabel>
              <input
                type="range"
                min={20}
                max={300}
                step={1}
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            <div className="mt-[16px]">
              <ToolLabel>字符集</ToolLabel>
              <div className="grid grid-cols-2 gap-[6px]">
                {CHARSETS.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCharsetIdx(i)}
                    className={`h-[34px] cursor-pointer rounded-[6px] text-[13px] transition-colors ${
                      charsetIdx === i
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-[16px]">
              <label className="flex cursor-pointer items-center gap-[6px] text-[14px] text-[#242424]">
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => setInvert(e.target.checked)}
                  className="h-[16px] w-[16px] cursor-pointer"
                />
                反转明暗
              </label>
            </div>

            <div className="mt-[20px] flex gap-[10px]">
              <ToolButton onClick={generate} disabled={!src}>
                生成字符画
              </ToolButton>
              {output && <CopyButton text={output} label="复制" />}
              {output && (
                <ToolButton variant="ghost" onClick={downloadTxt}>
                  下载 TXT
                </ToolButton>
              )}
            </div>
            {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
          </div>

          <div>
            <ToolLabel>字符画输出</ToolLabel>
            {output ? (
              <ToolTextarea
                value={output}
                onChange={() => {}}
                rows={22}
                className="font-mono text-[10px] leading-[1.1] whitespace-pre overflow-auto"
              />
            ) : (
              <div className="flex h-[360px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[13px] text-[#8F8F8F]">
                上传图片后自动生成字符画
              </div>
            )}
          </div>
        </div>
      </ToolCard>
    </ToolPageShell>
  );
}
