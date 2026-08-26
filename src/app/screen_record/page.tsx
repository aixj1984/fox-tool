"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { imgSrc } from "@/lib/img-path";

const DESCRIPTION = "在线录屏，支持录制指定浏览器标签页、指定窗口以及整个屏幕";

type RecState = "idle" | "recording" | "paused" | "stopped";

type FormatKey = "mp4" | "webm";

type FormatInfo = {
  key: FormatKey;
  label: string;
  mime: string;
  ext: string;
};

export default function Page() {
  const [state, setState] = useState<RecState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [err, setErr] = useState("");
  const [systemAudio, setSystemAudio] = useState(true);
  const [micAudio, setMicAudio] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState("video/webm");
  const [availableFormats, setAvailableFormats] = useState<FormatInfo[]>([]);

  const streamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordersRef = useRef<Partial<Record<FormatKey, MediaRecorder>>>({});
  const chunksRef = useRef<Partial<Record<FormatKey, Blob[]>>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef(0);
  const elapsedAccumRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);
  const downloadUrlsRef = useRef<Record<FormatKey, string | null>>({
    mp4: null,
    webm: null,
  });

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      stopStreams();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      for (const url of Object.values(downloadUrlsRef.current)) {
        if (url) URL.revokeObjectURL(url);
      }
    };
  }, []);

  // Detect supported recording formats on the client (avoids SSR hydration mismatch).
  useEffect(() => {
    if (typeof MediaRecorder === "undefined") return;
    const mp4Candidates = [
      "video/mp4;codecs=avc1,mp4a.40.2",
      "video/mp4;codecs=avc1",
      "video/mp4",
    ];
    const webmCandidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    const pick = (list: string[]) => {
      for (const c of list) if (MediaRecorder.isTypeSupported(c)) return c;
      return null;
    };
    const mp4Mime = pick(mp4Candidates);
    const webmMime = pick(webmCandidates);
    const formats: FormatInfo[] = [];
    if (mp4Mime) formats.push({ key: "mp4", label: "MP4", mime: mp4Mime, ext: "mp4" });
    if (webmMime) formats.push({ key: "webm", label: "WebM", mime: webmMime, ext: "webm" });
    setAvailableFormats(formats);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  };

  const buildRecordingStream = async (): Promise<MediaStream> => {
    const display = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: systemAudio,
    });
    const tracks = [...display.getVideoTracks()];

    const sysAudio = display.getAudioTracks();
    let micTracks: MediaStreamTrack[] = [];
    if (micAudio) {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        micStreamRef.current = micStream;
        micTracks = micStream.getAudioTracks();
      } catch {
        // mic permission denied or no device — continue without mic
      }
    }

    const audioTracks = [...sysAudio, ...micTracks];
    if (audioTracks.length > 0) {
      // If both system and mic audio are present, mix them via AudioContext.
      if (audioTracks.length > 1) {
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const dest = ctx.createMediaStreamDestination();
        const sources = audioTracks.map((t) => {
          const s = new MediaStream([t]);
          return ctx.createMediaStreamSource(s);
        });
        sources.forEach((s) => s.connect(dest));
        return new MediaStream([...tracks, ...dest.stream.getAudioTracks()]);
      }
      return new MediaStream([...tracks, ...audioTracks]);
    }
    return new MediaStream(tracks);
  };

  const startRecording = async () => {
    if (typeof window === "undefined") return;
    setErr("");
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setErr("当前浏览器不支持屏幕录制（getDisplayMedia）");
      return;
    }
    if (availableFormats.length === 0) {
      setErr("当前浏览器不支持视频录制");
      return;
    }
    try {
      const stream = await buildRecordingStream();
      streamRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopRecording();
      });

      // Clean up any previous download URLs.
      for (const url of Object.values(downloadUrlsRef.current)) {
        if (url) URL.revokeObjectURL(url);
      }
      downloadUrlsRef.current = { mp4: null, webm: null };

      // Start one recorder per supported format so the user can download either.
      const recorders: Partial<Record<FormatKey, MediaRecorder>> = {};
      const chunks: Partial<Record<FormatKey, Blob[]>> = {};
      for (const fmt of availableFormats) {
        const recorder = new MediaRecorder(stream, { mimeType: fmt.mime });
        const bucket: Blob[] = [];
        chunks[fmt.key] = bucket;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) bucket.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(bucket, { type: fmt.mime });
          if (downloadUrlsRef.current[fmt.key]) {
            URL.revokeObjectURL(downloadUrlsRef.current[fmt.key]!);
          }
          const url = URL.createObjectURL(blob);
          downloadUrlsRef.current = {
            ...downloadUrlsRef.current,
            [fmt.key]: url,
          };

          // Use the first format (preferred) for the preview.
          if (!previewUrlRef.current) {
            previewUrlRef.current = url;
            setPreviewUrl(url);
            setPreviewMime(fmt.mime);
          }
        };
        recorder.start(1000);
        recorders[fmt.key] = recorder;
      }
      recordersRef.current = recorders;
      chunksRef.current = chunks;

      elapsedAccumRef.current = 0;
      // eslint-disable-next-line react-hooks/purity -- called from an event handler, not during render
      startTsRef.current = Date.now();
      setElapsed(0);
      setState("recording");
      stopTimer();
      timerRef.current = setInterval(() => {
        setElapsed(
          Math.floor((Date.now() - startTsRef.current + elapsedAccumRef.current) / 1000),
        );
      }, 1000);
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setErr("已取消屏幕录制：用户拒绝或未选择共享源");
      } else {
        setErr(e instanceof Error ? e.message : "无法获取屏幕共享流");
      }
      stopStreams();
      setState("idle");
    }
  };

  const pauseRecording = () => {
    let any = false;
    for (const r of Object.values(recordersRef.current)) {
      if (r && r.state === "recording") {
        r.pause();
        any = true;
      }
    }
    if (any) {
      stopTimer();
      elapsedAccumRef.current += Date.now() - startTsRef.current;
      setElapsed(Math.floor(elapsedAccumRef.current / 1000));
      setState("paused");
    }
  };

  const resumeRecording = () => {
    let any = false;
    for (const r of Object.values(recordersRef.current)) {
      if (r && r.state === "paused") {
        r.resume();
        any = true;
      }
    }
    if (any) {
      startTsRef.current = Date.now();
      stopTimer();
      timerRef.current = setInterval(() => {
        setElapsed(
          Math.floor((Date.now() - startTsRef.current + elapsedAccumRef.current) / 1000),
        );
      }, 1000);
      setState("recording");
    }
  };

  const stopRecording = () => {
    const active = Object.values(recordersRef.current).filter(
      (r) => r && r.state !== "inactive",
    );
    active.forEach((r) => r!.stop());
    stopTimer();
    if (active.length > 0) {
      elapsedAccumRef.current += Date.now() - startTsRef.current;
      setElapsed(Math.floor(elapsedAccumRef.current / 1000));
    }
    // State transitions to "stopped" once preview is set; set optimistically for UI.
    if (active.length > 0) setState("stopped");
    stopStreams();
  };

  const reset = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    for (const url of Object.values(downloadUrlsRef.current)) {
      if (url) URL.revokeObjectURL(url);
    }
    downloadUrlsRef.current = { mp4: null, webm: null };
    setPreviewUrl(null);
    setElapsed(0);
    elapsedAccumRef.current = 0;
    setState("idle");
    setErr("");
  };

  const download = (fmt: FormatInfo) => {
    const url = downloadUrlsRef.current[fmt.key];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    // eslint-disable-next-line react-hooks/purity -- called from an event handler, not during render
    a.download = `screen-record-${Date.now()}.${fmt.ext}`;
    a.click();
  };

  const recording = state === "recording" || state === "paused";

  return (
    <ToolPageShell title="在线录屏" description={DESCRIPTION}>
      <div className="flex flex-col gap-[20px]">
        <ToolCard>
          <div className="flex flex-col items-center py-[20px]">
            <button
              type="button"
              onClick={startRecording}
              disabled={recording || availableFormats.length === 0}
              className="inline-flex h-[60px] w-[170px] cursor-pointer items-center justify-center gap-[8px] rounded-[10px] text-[20px] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(272deg, #136CE9 4.27%, #1796F1 98.43%)",
              }}
            >
              <Image
                src={imgSrc("/sites/tool-browser-qq-com/screen_record/record.png")}
                alt=""
                width={35}
                height={35}
                className="h-[35px] w-[35px]"
                unoptimized
              />
              <span>{state === "stopped" ? "重新录制" : "开始录制"}</span>
            </button>

            <div className="mt-[54px] flex items-center gap-[40px]">
              <label className="flex cursor-pointer items-center gap-[8px] text-[18px] text-[#333333]">
                <input
                  type="checkbox"
                  checked={systemAudio}
                  onChange={(e) => setSystemAudio(e.target.checked)}
                  disabled={recording}
                  className="h-[24px] w-[24px] cursor-pointer disabled:opacity-50"
                />
                系统声音
              </label>
              <label className="flex cursor-pointer items-center gap-[8px] text-[18px] text-[#333333]">
                <input
                  type="checkbox"
                  checked={micAudio}
                  onChange={(e) => setMicAudio(e.target.checked)}
                  disabled={recording}
                  className="h-[24px] w-[24px] cursor-pointer disabled:opacity-50"
                />
                麦克风
              </label>
            </div>
          </div>

          {recording && (
            <div className="mt-[8px] flex flex-wrap items-center justify-center gap-[12px]">
              {state === "recording" ? (
                <ToolButton variant="ghost" onClick={pauseRecording}>
                  暂停
                </ToolButton>
              ) : (
                <ToolButton onClick={resumeRecording}>继续</ToolButton>
              )}
              <ToolButton variant="ghost" onClick={stopRecording}>
                结束录制
              </ToolButton>
              <span className="ml-[8px] font-mono text-[16px] text-[#242424]">
                {formatTime(elapsed)}
              </span>
              <span className="flex items-center gap-[6px] text-[13px] text-[#E5484D]">
                <span className="inline-block h-[8px] w-[8px] rounded-full bg-[#E5484D]" />
                {state === "paused" ? "已暂停" : "录制中"}
              </span>
            </div>
          )}

          {err && (
            <div className="mt-[12px] rounded-[8px] bg-[#FDECEC] p-[10px] text-[13px] text-[#E5484D]">
              {err}
            </div>
          )}
        </ToolCard>

        {state === "recording" || state === "paused" ? (
          <ToolCard>
            <video
              autoPlay
              muted
              playsInline
              ref={(el) => {
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                }
              }}
              className="max-h-[420px] w-full rounded-[8px] border border-[#E5E7EB] bg-black object-contain"
            />
          </ToolCard>
        ) : null}

        {state === "stopped" && previewUrl && (
          <ToolCard>
            <div className="mb-[12px] flex flex-wrap items-center justify-between gap-[10px]">
              <div className="text-[14px] font-medium text-[#242424]">
                录制结果（{previewMime}）
              </div>
              <div className="flex flex-wrap gap-[10px]">
                {availableFormats.map((fmt) => (
                  <ToolButton
                    key={fmt.key}
                    variant="ghost"
                    onClick={() => download(fmt)}
                  >
                    下载 {fmt.label}
                  </ToolButton>
                ))}
                <ToolButton variant="ghost" onClick={reset}>
                  清除
                </ToolButton>
              </div>
            </div>
            <video
              src={previewUrl}
              controls
              className="max-h-[420px] w-full rounded-[8px] border border-[#E5E7EB] bg-black object-contain"
            />
          </ToolCard>
        )}

        <div className="rounded-[10px] bg-[#F6F7FA] p-[24px]">
          <div className="text-[26px] font-semibold text-[#333333]">操作指引</div>
          <div className="mt-[16px] flex gap-[20px]">
            <div className="flex-1 rounded-[10px] bg-white p-[12px]">
              <Image
                src={imgSrc("/sites/tool-browser-qq-com/screen_record/tutorial1.png")}
                alt="操作指引示意图"
                width={600}
                height={400}
                className="w-full rounded-[6px] object-contain"
                unoptimized
              />
            </div>
            <div className="flex flex-1 flex-col gap-[12px]">
              {[
                {
                  n: "步骤1：",
                  d: "设置是否启用系统声音、麦克风声音，点击开始录屏按钮",
                },
                {
                  n: "步骤2：",
                  d: "选择要录制的屏幕，点击“分享”开始录制",
                },
                {
                  n: "步骤3：",
                  d: "录制过程可暂停，点击“结束录制”或“停止共享”完成录制",
                },
                {
                  n: "步骤4：",
                  d: "点击“下载 MP4”或“下载 WebM”将录制的视频下载到本地",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex h-[68px] items-center gap-[8px] rounded-[10px] bg-[#4992F0] px-[15px] text-[14px] leading-[22px] text-white"
                >
                  <span className="shrink-0">{s.n}</span>
                  <span>{s.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
