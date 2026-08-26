"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { decodeQRFromImageData } from "./qr-decoder";

const DESCRIPTION =
  "扫一扫，信息即达。二维码扫描工具，快速准确读取二维码内嵌的各类数据信息。支持链接、文本、名片等多种格式。";

type Result = { text: string; format: string };

export default function Page() {
  const [result, setResult] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [camActive, setCamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const onFile = useCallback(async (f: File) => {
    setErr("");
    setResult(null);
    try {
      const url = URL.createObjectURL(f);
      const im = new Image();
      im.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1024;
        let w = im.naturalWidth;
        let h = im.naturalHeight;
        if (w > maxDim || h > maxDim) {
          const s = maxDim / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setErr("无法处理图片");
          URL.revokeObjectURL(url);
          return;
        }
        ctx.drawImage(im, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const data = ctx.getImageData(0, 0, w, h);
        const r = decodeQRFromImageData(data);
        if (r) setResult(r);
        else setErr("未识别到二维码，请使用更清晰的二维码图片");
      };
      im.onerror = () => {
        setErr("图片加载失败");
        URL.revokeObjectURL(url);
      };
      im.src = url;
    } catch {
      setErr("解析失败");
    }
  }, []);

  // BarcodeDetector fallback (Chrome/Edge support it for QR)
  const hasBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;

  const onFileWithDetector = useCallback(async (f: File) => {
    setErr("");
    setResult(null);
    // Prefer native BarcodeDetector if available (more robust)
    if (hasBarcodeDetector) {
      try {
        // @ts-expect-error: BarcodeDetector is not in TS lib yet
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const url = URL.createObjectURL(f);
        const im = new Image();
        im.onload = async () => {
          try {
            const codes = await detector.detect(im);
            URL.revokeObjectURL(url);
            if (codes.length > 0 && codes[0].rawValue) {
              const text = codes[0].rawValue;
              setResult({ text, format: detectFormat(text) });
            } else {
              // fall back to our decoder
              await onFile(f);
            }
          } catch {
            URL.revokeObjectURL(url);
            await onFile(f);
          }
        };
        im.onerror = () => {
          URL.revokeObjectURL(url);
          onFile(f);
        };
        im.src = url;
        return;
      } catch {
        // fall through
      }
    }
    await onFile(f);
  }, [hasBarcodeDetector, onFile]);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCamActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setErr("");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setCamActive(true);

      const tick = () => {
        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const r = decodeQRFromImageData(data);
          if (r) {
            setResult(r);
            stopCamera();
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setErr("无法访问摄像头，请检查权限或使用上传图片方式");
      setCamActive(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <ToolPageShell title="二维码扫描" description={DESCRIPTION}>
      <ToolCard>
        <div className="mb-[16px] flex gap-[10px]">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setMode("upload");
            }}
            className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
              mode === "upload" ? "bg-[#136CE9] text-white" : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
            }`}
          >
            上传图片识别
          </button>
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={`h-[40px] cursor-pointer rounded-[8px] px-[18px] text-[14px] font-medium transition-colors ${
              mode === "camera" ? "bg-[#136CE9] text-white" : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
            }`}
          >
            摄像头扫描
          </button>
        </div>

        {mode === "upload" && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileWithDetector(f);
              }}
              className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
            />
            <p className="mt-[8px] text-[12px] text-[#8F8F8F]">
              支持上传包含二维码的图片，自动识别解析。
            </p>
          </div>
        )}

        {mode === "camera" && (
          <div>
            <div className="overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className="mx-auto max-h-[400px] w-full object-contain"
              />
            </div>
            <div className="mt-[12px] flex gap-[10px]">
              {!camActive ? (
                <ToolButton onClick={startCamera}>开启摄像头扫描</ToolButton>
              ) : (
                <ToolButton variant="ghost" onClick={stopCamera}>停止扫描</ToolButton>
              )}
            </div>
            <p className="mt-[8px] text-[12px] text-[#8F8F8F]">
              将二维码对准摄像头，识别后自动停止。需要授权摄像头权限。
            </p>
          </div>
        )}

        {err && <div className="mt-[16px] text-[13px] text-[#E5484D]">{err}</div>}

        {result && (
          <div className="mt-[20px] rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-[16px]">
            <div className="mb-[8px] flex items-center gap-[8px]">
              <span className="rounded-[4px] bg-[#136CE9] px-[8px] py-[2px] text-[12px] text-white">
                {result.format}
              </span>
              <span className="text-[14px] text-[#242424]">识别结果</span>
            </div>
            <div className="break-all rounded-[6px] bg-white p-[12px] font-mono text-[14px] text-[#242424]">
              {result.text}
            </div>
            <div className="mt-[12px] flex gap-[10px]">
              <CopyButton text={result.text} label="复制内容" />
              {/^https?:\/\//i.test(result.text) && (
                <ToolButton
                  variant="ghost"
                  onClick={() => window.open(result.text, "_blank")}
                >
                  打开链接
                </ToolButton>
              )}
            </div>
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}

function detectFormat(text: string): string {
  if (/^https?:\/\//i.test(text)) return "链接";
  if (/^mailto:/i.test(text)) return "邮箱";
  if (/^tel:/i.test(text)) return "电话";
  if (/^WIFI:/i.test(text)) return "WiFi";
  if (/^BEGIN:VCARD/i.test(text)) return "名片";
  return "文本";
}
