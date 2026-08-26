"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolTextarea,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type Mode = "encode" | "decode";

// Zero-width character steganography.
// We hide a secret message inside cover text using zero-width characters as bits,
// inserted after the first character of the cover text (so the output looks identical).
// Encoding: U+200B = 0, U+200C = 1, U+200D = separator/end marker.
// Bitstream: [UTF-8 bytes of secret] each byte as 8 bits MSB-first, terminated by U+200D.

const ZW_ZERO = "​"; // zero-width space -> bit 0
const ZW_ONE = "‌";  // zero-width non-joiner -> bit 1
const ZW_END = "‍";  // zero-width joiner -> terminator

function encodeBitsToZeroWidth(bits: number[]): string {
  let out = "";
  for (const b of bits) out += b === 1 ? ZW_ONE : ZW_ZERO;
  out += ZW_END;
  return out;
}

function decodeZeroWidthToBits(text: string): number[] {
  const bits: number[] = [];
  for (const ch of text) {
    if (ch === ZW_ZERO) bits.push(0);
    else if (ch === ZW_ONE) bits.push(1);
    else if (ch === ZW_END) break;
  }
  return bits;
}

function bitsToBytes(bits: number[]): Uint8Array {
  const len = Math.floor(bits.length / 8);
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i * 8 + j];
    out[i] = v;
  }
  return out;
}

function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  }
  return bits;
}

function textStegoEncode(cover: string, secret: string): string {
  if (!cover) return "";
  if (!secret) return cover;
  const secretBytes = new TextEncoder().encode(secret);
  const bits = bytesToBits(secretBytes);
  const hidden = encodeBitsToZeroWidth(bits);
  // Insert the hidden stream after the first visible character.
  return cover[0] + hidden + cover.slice(1);
}

function textStegoDecode(stego: string): string {
  const bits = decodeZeroWidthToBits(stego);
  if (bits.length === 0) return "";
  const bytes = bitsToBytes(bits);
  return new TextDecoder().decode(bytes);
}

const DESCRIPTION =
  "文字隐写工具可以帮助您将文本信息隐藏在其他文本中，实现信息的隐秘传输和存储。";

export default function Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [cover, setCover] = useState("");
  const [secret, setSecret] = useState("");
  const [stego, setStego] = useState("");

  const encodeResult = useMemo(() => {
    if (mode !== "encode") return "";
    return textStegoEncode(cover, secret);
  }, [mode, cover, secret]);

  const decodeResult = useMemo(() => {
    if (mode !== "decode") return "";
    return textStegoDecode(stego);
  }, [mode, stego]);

  return (
    <ToolPageShell title="文字隐写" description={DESCRIPTION}>
      <div className="mb-[16px] flex flex-wrap items-center gap-[10px]">
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={`h-[40px] cursor-pointer rounded-[8px] px-[20px] text-[14px] font-medium transition-colors ${
            mode === "encode"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          编码（隐藏消息）
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`h-[40px] cursor-pointer rounded-[8px] px-[20px] text-[14px] font-medium transition-colors ${
            mode === "decode"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          解码（提取消息）
        </button>
      </div>

      {mode === "encode" ? (
        <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
          <ToolCard>
            <ToolLabel>载体文本（封面文本）</ToolLabel>
            <ToolTextarea
              value={cover}
              onChange={setCover}
              placeholder="请输入作为掩护的普通文本，例如：今天天气真好"
              rows={6}
            />
            <div className="mt-[16px]">
              <ToolLabel>需要隐藏的秘密消息</ToolLabel>
              <ToolTextarea
                value={secret}
                onChange={setSecret}
                placeholder="请输入要隐藏的文本，例如：今晚八点老地方见"
                rows={4}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setCover("");
                setSecret("");
              }}
              className="mt-[10px] inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[8px] bg-[#F6F7FA] px-[16px] text-[13px] font-medium text-[#242424] hover:bg-[#ebedf2]"
            >
              清空
            </button>
          </ToolCard>

          <ToolCard>
            <div className="mb-[6px] flex items-center justify-between">
              <ToolLabel>隐写结果（看起来与原文相同）</ToolLabel>
              <CopyButton text={encodeResult} label="复制结果" />
            </div>
            <ToolTextarea
              value={encodeResult}
              onChange={() => undefined}
              placeholder="隐藏消息后的文本将显示在这里"
              rows={10}
              className="bg-[#F9FAFB]"
            />
            <p className="mt-[10px] text-[13px] text-[#8F8F8F]">
              使用零宽字符（U+200B/U+200C/U+200D）在文本中编码秘密消息，复制后粘贴到任意地方均可再解码。
            </p>
          </ToolCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
          <ToolCard>
            <ToolLabel>含隐写信息的文本</ToolLabel>
            <ToolTextarea
              value={stego}
              onChange={setStego}
              placeholder="请粘贴包含零宽字符的文本"
              rows={10}
            />
            <button
              type="button"
              onClick={() => setStego("")}
              className="mt-[10px] inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[8px] bg-[#F6F7FA] px-[16px] text-[13px] font-medium text-[#242424] hover:bg-[#ebedf2]"
            >
              清空
            </button>
          </ToolCard>

          <ToolCard>
            <div className="mb-[6px] flex items-center justify-between">
              <ToolLabel>提取到的秘密消息</ToolLabel>
              <CopyButton text={decodeResult} label="复制结果" />
            </div>
            <ToolTextarea
              value={decodeResult}
              onChange={() => undefined}
              placeholder="解码出的秘密消息将显示在这里"
              rows={10}
              className="bg-[#F9FAFB]"
            />
            {decodeResult ? (
              <p className="mt-[10px] text-[13px] text-[#8F8F8F]">
                成功提取隐藏消息。
              </p>
            ) : (
              <p className="mt-[10px] text-[13px] text-[#8F8F8F]">
                未检测到隐藏消息，请确认文本中包含零宽字符。
              </p>
            )}
          </ToolCard>
        </div>
      )}
    </ToolPageShell>
  );
}
