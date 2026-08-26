"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): Rgb | null {
  const s = hex.trim().replace(/^#/, "");
  let full: string;
  if (s.length === 3) {
    full = s
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (s.length === 6) {
    full = s;
  } else {
    return null;
  }
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(rgb: Rgb): string {
  const to2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${to2(rgb.r)}${to2(rgb.g)}${to2(rgb.b)}`.toUpperCase();
}

function rgbToHsl(rgb: Rgb): Hsl {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(hsl: Hsl): Rgb {
  const h = ((hsl.h % 360) + 360) % 360 / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function parseRgbString(s: string): Rgb | null {
  const m = s.trim().match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)$/i);
  if (!m) return null;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  if (r > 255 || g > 255 || b > 255) return null;
  return { r, g, b };
}

function parseHslString(s: string): Rgb | null {
  const m = s.trim().match(/^hsla?\(\s*(-?\d+)\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%/i);
  if (!m) return null;
  return hslToRgb({ h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) });
}

function parseAny(text: string): Rgb | null {
  const t = text.trim();
  if (t === "") return null;
  if (t.startsWith("#")) return hexToRgb(t);
  if (/^rgba?\(/i.test(t)) return parseRgbString(t);
  if (/^hsla?\(/i.test(t)) return parseHslString(t);
  // try as plain hex without #
  return hexToRgb(t);
}

export default function Page() {
  const [rgb, setRgb] = useState<Rgb>({ r: 19, g: 108, b: 233 });
  const [hexInput, setHexInput] = useState("#136CE9");
  const [rgbInput, setRgbInput] = useState("rgb(19, 108, 233)");
  const [hslInput, setHslInput] = useState("hsl(216, 83%, 49%)");

  const hex = useMemo(() => rgbToHex(rgb), [rgb]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const handleHex = (v: string) => {
    setHexInput(v);
    const parsed = parseAny(v);
    if (parsed) setRgb(parsed);
  };
  const handleRgb = (v: string) => {
    setRgbInput(v);
    const parsed = parseRgbString(v);
    if (parsed) setRgb(parsed);
  };
  const handleHsl = (v: string) => {
    setHslInput(v);
    const parsed = parseHslString(v);
    if (parsed) setRgb(parsed);
  };

  const fields: { label: string; value: string; onChange: (v: string) => void; placeholder: string }[] = [
    { label: "HEX", value: hexInput, onChange: handleHex, placeholder: "#136CE9" },
    { label: "RGB", value: rgbInput, onChange: handleRgb, placeholder: "rgb(19, 108, 233)" },
    { label: "HSL", value: hslInput, onChange: handleHsl, placeholder: "hsl(216, 83%, 49%)" },
  ];

  return (
    <ToolPageShell
      title="颜色转换"
      description="颜色代码转换工具可以帮助用户将多种颜色代码转换为Hex、RGB或HSL格式"
    >
      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>颜色预览</ToolLabel>
          <div
            className="mb-[16px] flex h-[140px] items-end rounded-[10px] border border-[#E5E7EB] p-[16px]"
            style={{ backgroundColor: hex }}
          >
            <span
              className="rounded-[6px] bg-white/90 px-[10px] py-[4px] font-mono text-[14px] text-[#242424]"
            >
              {hex}
            </span>
          </div>
          <ToolLabel>拾色器</ToolLabel>
          <input
            type="color"
            value={hex}
            onChange={(e) => {
              const parsed = hexToRgb(e.target.value);
              if (parsed) {
                setRgb(parsed);
                setHexInput(e.target.value.toUpperCase());
                setRgbInput(`rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`);
                const h = rgbToHsl(parsed);
                setHslInput(`hsl(${h.h}, ${h.s}%, ${h.l}%)`);
              }
            }}
            className="h-[44px] w-full cursor-pointer rounded-[8px] border border-[#E5E7EB] bg-white p-[4px]"
          />
          <p className="mt-[10px] text-[14px] text-[#8F8F8F]">
            点击拾色器选择颜色，或在右侧输入框中输入 HEX / RGB / HSL 任一格式，实时联动换算。
          </p>
        </ToolCard>

        <ToolCard>
          <ToolLabel>颜色代码</ToolLabel>
          <div className="flex flex-col gap-[14px]">
            {fields.map((f) => (
              <div key={f.label} className="rounded-[8px] border border-[#F6F7FA] bg-[#F9FAFB] p-[12px]">
                <div className="mb-[8px] flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#8F8F8F]">{f.label}</span>
                  <CopyButton text={f.label === "HEX" ? hex : f.label === "RGB" ? rgbStr : hslStr} label="复制" />
                </div>
                <ToolInput
                  value={f.value}
                  onChange={f.onChange}
                  placeholder={f.placeholder}
                  className="w-full font-mono"
                />
              </div>
            ))}
            <div className="rounded-[8px] border border-[#F6F7FA] bg-white p-[12px]">
              <p className="mb-[8px] text-[13px] font-medium text-[#8F8F8F]">实时换算结果</p>
              <div className="flex flex-col gap-[6px] font-mono text-[14px] text-[#242424]">
                <span>HEX: {hex}</span>
                <span>RGB: {rgbStr}</span>
                <span>HSL: {hslStr}</span>
              </div>
            </div>
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
