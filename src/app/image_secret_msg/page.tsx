"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type Mode = "encode" | "decode";

// Magic header placed at the start of the hidden bitstream so the decoder can
// locate the message boundary even when the carrier image has extra pixels.
const MAGIC = "STG1";

// LSB steganography in the alpha channel of a PNG via canvas.
// Bitstream layout: [MAGIC (32 bits)][length (32 bits, big-endian)][message bytes].
// Each bit is written into the LSB of successive alpha values (row-major).

function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
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

function encodeMessage(message: string): number[] {
  const msgBytes = new TextEncoder().encode(message);
  const lenBytes = new Uint8Array(4);
  const view = new DataView(lenBytes.buffer);
  view.setUint32(0, msgBytes.length, false);
  const magicBytes = new TextEncoder().encode(MAGIC);
  const all = new Uint8Array(magicBytes.length + lenBytes.length + msgBytes.length);
  all.set(magicBytes, 0);
  all.set(lenBytes, magicBytes.length);
  all.set(msgBytes, magicBytes.length + lenBytes.length);
  return bytesToBits(all);
}

function decodeMessage(bits: number[]): { ok: true; out: string } | { ok: false; err: string } {
  const magicLen = MAGIC.length * 8;
  if (bits.length < magicLen + 32) {
    return { ok: false, err: "图片中未发现隐藏信息（数据不足）。" };
  }
  const magicBits = bits.slice(0, magicLen);
  const magic = new TextDecoder().decode(bitsToBytes(magicBits));
  if (magic !== MAGIC) {
    return { ok: false, err: "未检测到有效的隐写标记，该图片可能未隐藏信息。" };
  }
  const lenBits = bits.slice(magicLen, magicLen + 32);
  const lenBytes = bitsToBytes(lenBits);
  const view = new DataView(lenBytes.buffer);
  const msgLen = view.getUint32(0, false);
  const needed = magicLen + 32 + msgLen * 8;
  if (bits.length < needed) {
    return { ok: false, err: "隐藏信息长度异常，数据已损坏。" };
  }
  const msgBits = bits.slice(magicLen + 32, needed);
  const msgBytes = bitsToBytes(msgBits);
  return { ok: true, out: new TextDecoder().decode(msgBytes) };
}

const DESCRIPTION =
  "图片隐写工具可以帮助您将文本或文件隐藏在图片中，实现信息的隐秘传输和存储。通过这款工具，您可以将敏感信息嵌入到图片中，只有使用特定工具或密钥才能提取，适用于信息安全、隐私保护和数据隐藏等场景。";

export default function Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [src, setSrc] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [err, setErr] = useState("");
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onFile = useCallback((f: File) => {
    setErr("");
    setResult("");
    if (src) URL.revokeObjectURL(src);
    if (outUrl) {
      URL.revokeObjectURL(outUrl);
      setOutUrl(null);
    }
    const url = URL.createObjectURL(f);
    setSrc(url);
    const im = new Image();
    im.onload = () => {
      imgRef.current = im;
    };
    im.onerror = () => setErr("图片加载失败");
    im.src = url;
  }, [src, outUrl]);

  const handleEncode = useCallback(() => {
    setErr("");
    setResult("");
    if (outUrl) {
      URL.revokeObjectURL(outUrl);
      setOutUrl(null);
    }
    const im = imgRef.current;
    const canvas = canvasRef.current;
    if (!im || !canvas) {
      setErr("请先上传一张 PNG 图片。");
      return;
    }
    if (!message) {
      setErr("请输入需要隐藏的消息。");
      return;
    }
    canvas.width = im.naturalWidth;
    canvas.height = im.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setErr("无法获取画布上下文。");
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(im, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const pixels = data.length / 4;

    const bits = encodeMessage(message);
    if (bits.length > pixels) {
      setErr("图片容量不足，无法容纳该消息。请使用更大的图片或缩短消息。");
      return;
    }
    for (let i = 0; i < bits.length; i++) {
      const alphaIdx = i * 4 + 3;
      data[alphaIdx] = (data[alphaIdx] & 0xfe) | bits[i];
    }
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        setErr("编码失败，浏览器可能不支持 PNG 输出。");
        return;
      }
      setOutUrl(URL.createObjectURL(blob));
      setResult("编码成功，请下载下方图片。");
    }, "image/png");
  }, [message, outUrl]);

  const handleDecode = useCallback(() => {
    setErr("");
    setResult("");
    const im = imgRef.current;
    const canvas = canvasRef.current;
    if (!im || !canvas) {
      setErr("请先上传一张已隐藏信息的 PNG 图片。");
      return;
    }
    canvas.width = im.naturalWidth;
    canvas.height = im.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setErr("无法获取画布上下文。");
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(im, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const pixels = data.length / 4;

    const bits: number[] = [];
    for (let i = 0; i < pixels; i++) {
      bits.push(data[i * 4 + 3] & 1);
    }
    const r = decodeMessage(bits);
    if (r.ok) {
      setResult(r.out);
    } else {
      setErr(r.err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [src, outUrl]);

  return (
    <ToolPageShell title="图片隐写" description={DESCRIPTION}>
      <div className="mb-[16px] flex flex-wrap items-center gap-[10px]">
        <button
          type="button"
          onClick={() => {
            setMode("encode");
            setErr("");
            setResult("");
          }}
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
          onClick={() => {
            setMode("decode");
            setErr("");
            setResult("");
          }}
          className={`h-[40px] cursor-pointer rounded-[8px] px-[20px] text-[14px] font-medium transition-colors ${
            mode === "decode"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          解码（提取消息）
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>选择 PNG 图片</ToolLabel>
          <input
            type="file"
            accept="image/png"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
            className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
          />
          {src && (
            <div className="mt-[12px]">
              <img
                src={src}
                alt="预览"
                className="max-h-[200px] w-auto max-w-full rounded-[8px] border border-[#E5E7EB]"
              />
            </div>
          )}

          {mode === "encode" && (
            <div className="mt-[16px]">
              <ToolLabel>需要隐藏的消息</ToolLabel>
              <ToolTextarea
                value={message}
                onChange={setMessage}
                placeholder="请输入要隐藏到图片中的文本消息"
                rows={5}
              />
              <div className="mt-[12px] flex gap-[10px]">
                <ToolButton onClick={handleEncode} disabled={!src}>
                  编码并生成图片
                </ToolButton>
              </div>
            </div>
          )}

          {mode === "decode" && (
            <div className="mt-[16px]">
              <div className="mt-[12px] flex gap-[10px]">
                <ToolButton onClick={handleDecode} disabled={!src}>
                  提取隐藏消息
                </ToolButton>
              </div>
            </div>
          )}

          {err && <p className="mt-[12px] text-[13px] text-[#E5484D]">{err}</p>}
          <p className="mt-[10px] text-[13px] text-[#8F8F8F]">
            使用 LSB（最低有效位）算法将消息写入 PNG 像素的 Alpha 通道。请使用无损 PNG，JPEG 会破坏隐写数据。
          </p>
        </ToolCard>

        <ToolCard>
          <ToolLabel>{mode === "encode" ? "编码结果" : "提取到的消息"}</ToolLabel>
          {mode === "encode" && outUrl ? (
            <div>
              <img
                src={outUrl}
                alt="编码结果"
                className="max-h-[200px] w-auto max-w-full rounded-[8px] border border-[#E5E7EB]"
              />
              <div className="mt-[12px] flex gap-[10px]">
                <ToolButton
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = outUrl;
                    a.download = "stego.png";
                    a.click();
                  }}
                >
                  下载 PNG
                </ToolButton>
              </div>
            </div>
          ) : (
            <ToolTextarea
              value={result}
              onChange={() => undefined}
              placeholder="结果将显示在这里"
              rows={8}
              className="bg-[#F9FAFB]"
            />
          )}
          {mode === "decode" && result && (
            <ToolTextarea
              value={result}
              onChange={() => undefined}
              placeholder=""
              rows={8}
              className="mt-[12px] bg-[#F9FAFB]"
            />
          )}
        </ToolCard>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </ToolPageShell>
  );
}
