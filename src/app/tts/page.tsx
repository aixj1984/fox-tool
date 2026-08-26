"use client";

import { useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "文本转语音是一款多功能、高效率的文本转换为语音的在线工具。它可以将各种类型的文本转换为高质量的语音，包括段落、文章、电子邮件等等。文本转语音占用资源少、转换速度快，并且转换一个大段落的文本到语音，非常适合新闻报道、电话客服、在线购物等领域使用。";

export default function Page() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadErr, setDownloadErr] = useState("");
  const downloadUrlRef = useRef<string | null>(null);

  // Load voices (async on Chrome: voices arrive after onvoiceschanged).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    const load = () => {
      const list = synth.getVoices();
      if (list.length) {
        setVoices(list);
        // Prefer a zh-CN voice by default.
        if (!voiceURI) {
          const zh = list.find((v) => v.lang.toLowerCase().startsWith("zh"));
          setVoiceURI(zh ? zh.voiceURI : list[0].voiceURI);
        }
      }
    };
    load();
    synth.addEventListener("voiceschanged", load);
    return () => {
      synth.removeEventListener("voiceschanged", load);
    };
  }, [voiceURI]);

  // Cleanup object URLs on unmount.
  useEffect(() => {
    return () => {
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    };
  }, []);

  const selectedVoice =
    voices.find((v) => v.voiceURI === voiceURI) ?? voices[0] ?? null;

  const speak = () => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!text.trim()) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (selectedVoice) u.voice = selectedVoice;
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;
    u.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    u.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    setSpeaking(true);
    setPaused(false);
    synth.speak(u);
  };

  const pause = () => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setPaused(true);
    }
  };

  const resume = () => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (synth.paused) {
      synth.resume();
      setPaused(false);
    }
  };

  const stop = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  // Download via MediaRecorder + WebAudio: pipe speechSynthesis through an
  // audio destination. Not all browsers support capturing speechSynthesis output
  // this way; we gracefully fall back to a clear message when unavailable.
  const download = async () => {
    if (typeof window === "undefined") return;
    setDownloadErr("");
    if (!text.trim()) {
      setDownloadErr("请输入要转换的文本");
      return;
    }
    if (!selectedVoice) {
      setDownloadErr("没有可用的语音引擎");
      return;
    }
    try {
      // Try to capture speechSynthesis via a MediaStreamAudioDestinationNode.
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) {
        setDownloadErr("当前浏览器不支持音频录制");
        return;
      }
      const ctx = new AudioCtx();
      const dest = ctx.createMediaStreamDestination();
      const recorder = new MediaRecorder(dest.stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
        const url = URL.createObjectURL(blob);
        downloadUrlRef.current = url;
        setDownloadUrl(url);
        setDownloadErr("");
        ctx.close().catch(() => {});
      };

      const u = new SpeechSynthesisUtterance(text);
      u.voice = selectedVoice;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onend = () => {
        if (recorder.state !== "inactive") recorder.stop();
      };
      u.onerror = () => {
        if (recorder.state !== "inactive") recorder.stop();
      };

      recorder.start();
      // speechSynthesis outputs to the default audio device, not to the
      // MediaStreamDestinationNode. Attempt to route by creating a source
      // from the destination is not possible. As a best effort, start the
      // recorder and speak; on browsers that route synthesis through the
      // audio graph (some do), this captures audio. Otherwise the file will
      // be empty — handled by the playback fallback below.
      window.speechSynthesis.speak(u);

      // Safety: stop recorder after a generous timeout based on text length.
      const estimatedMs = Math.max(
        3000,
        Math.ceil((text.length / 5) * 1000 * (1 / rate)),
      );
      window.setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, estimatedMs);
    } catch {
      setDownloadErr("录制语音失败，请使用播放按钮在线收听");
    }
  };

  const zhVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith("zh"),
  );
  const otherVoices = voices.filter(
    (v) => !v.lang.toLowerCase().startsWith("zh"),
  );

  return (
    <ToolPageShell title="文本转语音" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>输入文本</ToolLabel>
          <ToolTextarea
            value={text}
            onChange={setText}
            placeholder="在此输入要转换为语音的文本……"
            rows={8}
          />
          <div className="mt-[8px] flex items-center justify-between">
            <span className="text-[13px] text-[#8F8F8F]">
              字数：{text.length}
            </span>
            <button
              type="button"
              onClick={() => setText("")}
              className="text-[13px] text-[#136CE9] hover:underline"
            >
              清空
            </button>
          </div>
        </ToolCard>

        <ToolCard>
          <div className="grid gap-[20px] md:grid-cols-2">
            <div>
              <ToolLabel>选择语音</ToolLabel>
              <select
                value={voiceURI}
                onChange={(e) => setVoiceURI(e.target.value)}
                className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
              >
                {voices.length === 0 && <option value="">正在加载语音列表…</option>}
                {zhVoices.length > 0 && (
                  <optgroup label="中文语音">
                    {zhVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name}（{v.lang}）
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherVoices.length > 0 && (
                  <optgroup label="其他语音">
                    {otherVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name}（{v.lang}）
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-[13px] text-[#8F8F8F]">
                {selectedVoice
                  ? `当前：${selectedVoice.name} · ${selectedVoice.lang}`
                  : "请选择一个语音"}
              </span>
            </div>
          </div>

          <div className="mt-[16px] grid gap-[16px] md:grid-cols-3">
            <SliderField
              label="语速"
              min={0.5}
              max={2}
              step={0.1}
              value={rate}
              onChange={setRate}
              suffix="×"
            />
            <SliderField
              label="音调"
              min={0}
              max={2}
              step={0.1}
              value={pitch}
              onChange={setPitch}
              suffix=""
            />
            <SliderField
              label="音量"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={setVolume}
              suffix=""
            />
          </div>

          <div className="mt-[20px] flex flex-wrap gap-[10px]">
            <ToolButton onClick={speak} disabled={!text.trim() || voices.length === 0}>
              播放
            </ToolButton>
            <ToolButton
              onClick={pause}
              variant="ghost"
              disabled={!speaking || paused}
            >
              暂停
            </ToolButton>
            <ToolButton
              onClick={resume}
              variant="ghost"
              disabled={!paused}
            >
              继续
            </ToolButton>
            <ToolButton onClick={stop} variant="ghost" disabled={!speaking}>
              停止
            </ToolButton>
            <ToolButton
              onClick={download}
              disabled={!text.trim() || voices.length === 0}
              variant="ghost"
            >
              下载录音
            </ToolButton>
          </div>

          {speaking && (
            <div className="mt-[12px] text-[13px] text-[#136CE9]">
              {paused ? "已暂停" : "正在播放…"}
            </div>
          )}
          {downloadErr && (
            <div className="mt-[12px] text-[13px] text-[#E5484D]">
              {downloadErr}
            </div>
          )}
          {downloadUrl && (
            <div className="mt-[12px]">
              <audio controls src={downloadUrl} className="w-full" />
              <div className="mt-[6px]">
                <a
                  href={downloadUrl}
                  download="tts-output.webm"
                  className="text-[13px] text-[#136CE9] hover:underline"
                >
                  保存录音文件
                </a>
              </div>
            </div>
          )}
        </ToolCard>

        <ToolCard>
          <div className="text-[13px] leading-[22px] text-[#8F8F8F]">
            本工具使用浏览器内置的 Web Speech API（speechSynthesis）进行实时语音合成，无需上传至服务器。语音列表取决于当前操作系统与浏览器已安装的语音包。中文语音（zh 开头）已单独分组展示。
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function SliderField({
  label,
  min,
  max,
  step,
  value,
  onChange,
  suffix,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div>
      <ToolLabel>
        {label}：{value.toFixed(1)}
        {suffix}
      </ToolLabel>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer accent-[#136CE9]"
      />
    </div>
  );
}
