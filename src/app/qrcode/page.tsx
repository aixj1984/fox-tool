"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "二维码生成是一款实用的在线工具，专为将文本、URL、联系方式等信息生成二维码而设计。";

type Level = "L" | "M" | "Q" | "H";

export default function Page() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(320);
  const [level, setLevel] = useState<Level>("M");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#FFFFFF");
  const [dataUrl, setDataUrl] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    const value = text.trim();
    if (!value) {
      setDataUrl("");
      setErr("");
      return;
    }
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: level,
      color: { dark: fg, light: bg },
    })
      .then((url) => {
        if (cancelled) return;
        setDataUrl(url);
        setErr("");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : String(e));
        setDataUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [text, size, level, fg, bg]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  const levelLabel: Record<Level, string> = {
    L: "L · 7% 纠错",
    M: "M · 15% 纠错",
    Q: "Q · 25% 纠错",
    H: "H · 30% 纠错",
  };

  return (
    <ToolPageShell title="二维码生成" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>内容（文本 / URL）</ToolLabel>
          <ToolTextareaAuto
            value={text}
            onChange={setText}
            placeholder="输入要编码的文本或网址"
          />

          <div className="mt-[16px] grid grid-cols-2 gap-[16px]">
            <div>
              <ToolLabel>尺寸（px）</ToolLabel>
              <input
                type="range"
                min={128}
                max={1024}
                step={16}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-[#136CE9]"
              />
              <div className="text-[12px] text-[#8F8F8F]">{size} × {size}</div>
            </div>
            <div>
              <ToolLabel>纠错等级</ToolLabel>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
                className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[10px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
              >
                {(Object.keys(levelLabel) as Level[]).map((l) => (
                  <option key={l} value={l}>
                    {levelLabel[l]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <ToolLabel>前景色</ToolLabel>
              <input
                type="color"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
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
          </div>

          {err && (
            <p className="mt-[12px] text-[13px] text-[#E5484D]">
              生成失败：{err}
            </p>
          )}
        </ToolCard>

        <ToolCard>
          <ToolLabel>预览</ToolLabel>
          <div className="flex flex-col items-center gap-[16px]">
            <div className="rounded-[8px] border border-[#E5E7EB] p-[12px]">
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dataUrl} alt="QR Code" width={320} height={320} />
              ) : (
                <div
                  className="flex h-[320px] w-[320px] items-center justify-center text-[14px] text-[#8F8F8F]"
                >
                  {text.trim() ? "生成中…" : "请输入内容"}
                </div>
              )}
            </div>
            <ToolButton onClick={download} disabled={!dataUrl}>
              下载 PNG
            </ToolButton>
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function ToolTextareaAuto({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white p-[12px] text-[14px] leading-[22px] text-[#242424] outline-none focus:border-[#136CE9]"
    />
  );
}
