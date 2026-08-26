"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { textToPinyin } from "../tta/pinyin-table";

const DESCRIPTION =
  "汉字标准发音工具可以帮助您学习和掌握汉字的标准发音。通过这款工具，您可以输入任意汉字或词语，工具会自动提供标准的拼音和发音，便于您进行语言学习、发音练习和教学辅助。";

// Split text into syllable tokens: each Chinese char becomes its own token
// (with its pinyin), and runs of non-Chinese chars become one token preserved
// as-is.
type Token = { ch: string; pinyin: string; isChinese: boolean };

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      tokens.push({ ch: buf, pinyin: buf, isChinese: false });
      buf = "";
    }
  };
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    const isChinese = code >= 0x3400 && code <= 0x9fff;
    if (isChinese) {
      flush();
      tokens.push({ ch, pinyin: textToPinyin(ch).trim() || ch, isChinese: true });
    } else {
      buf += ch;
    }
  }
  flush();
  return tokens;
}

export default function Page() {
  const [text, setText] = useState("");
  const [zhVoiceURI, setZhVoiceURI] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [err, setErr] = useState("");
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    const load = () => {
      const list = synth.getVoices();
      if (list.length) {
        setVoices(list);
        voicesRef.current = list;
        if (!zhVoiceURI) {
          const zh = list.find((v) => v.lang.toLowerCase().startsWith("zh"));
          setZhVoiceURI(zh ? zh.voiceURI : "");
        }
      }
    };
    load();
    synth.addEventListener("voiceschanged", load);
    return () => {
      synth.removeEventListener("voiceschanged", load);
      synth.cancel();
    };
  }, [zhVoiceURI]);

  const tokens = useMemo(() => tokenize(text), [text]);
  const pinyinText = useMemo(() => textToPinyin(text), [text]);

  const speak = (content: string) => {
    if (typeof window === "undefined") return;
    if (!content.trim()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(content);
    const v =
      voicesRef.current.find((vv) => vv.voiceURI === zhVoiceURI) ?? null;
    if (v) u.voice = v;
    u.lang = v?.lang ?? "zh-CN";
    u.rate = 0.9;
    u.onerror = () => setErr("");
    setErr("");
    synth.speak(u);
  };

  const zhVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith("zh"),
  );

  return (
    <ToolPageShell title="汉字标准发音" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>输入汉字或词语</ToolLabel>
          <ToolInput
            value={text}
            onChange={setText}
            placeholder="例如：你好，中国"
            className="w-full"
          />
          <div className="mt-[8px] flex items-center justify-between">
            <span className="text-[13px] text-[#8F8F8F]">
              支持单个汉字或整句，逐字显示拼音并可单独朗读
            </span>
            <button
              type="button"
              onClick={() => {
                setText("");
                setErr("");
              }}
              className="text-[13px] text-[#136CE9] hover:underline"
            >
              清空
            </button>
          </div>

          <div className="mt-[16px]">
            <ToolLabel>中文语音引擎</ToolLabel>
            <select
              value={zhVoiceURI}
              onChange={(e) => setZhVoiceURI(e.target.value)}
              className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
            >
              <option value="">系统默认中文语音</option>
              {zhVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}（{v.lang}）
                </option>
              ))}
            </select>
          </div>

          <div className="mt-[16px] flex gap-[10px]">
            <ToolButton
              onClick={() => speak(text)}
              disabled={!text.trim()}
            >
              朗读全部
            </ToolButton>
            <ToolButton
              variant="ghost"
              onClick={() => {
                if (typeof window !== "undefined") window.speechSynthesis.cancel();
              }}
              disabled={!text.trim()}
            >
              停止
            </ToolButton>
          </div>
          {err && (
            <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>
          )}
        </ToolCard>

        <ToolCard>
          <div className="mb-[12px] text-[14px] font-medium text-[#242424]">
            拼音结果
          </div>
          {tokens.length === 0 ? (
            <p className="text-[13px] text-[#8F8F8F]">
              输入汉字后，拼音将逐字显示在此……
            </p>
          ) : (
            <div className="flex flex-wrap gap-[12px]">
              {tokens.map((t, i) =>
                t.isChinese ? (
                  <div
                    key={i}
                    className="flex flex-col items-center rounded-[8px] border border-[#F6F7FA] bg-[#FAFBFC] px-[12px] py-[10px]"
                  >
                    <span className="font-mono text-[16px] text-[#136CE9]">
                      {t.pinyin}
                    </span>
                    <span className="mt-[4px] text-[20px] leading-[28px] text-[#242424]">
                      {t.ch}
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(t.ch)}
                      className="mt-[6px] cursor-pointer rounded-[4px] bg-[#136CE9] px-[10px] py-[2px] text-[12px] text-white hover:bg-[#0f5fc4]"
                    >
                      播放发音
                    </button>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex flex-col items-center px-[4px] py-[10px]"
                  >
                    <span className="font-mono text-[12px] text-[#8F8F8F]">
                      &nbsp;
                    </span>
                    <span className="mt-[4px] text-[20px] leading-[28px] text-[#8F8F8F]">
                      {t.ch}
                    </span>
                    <span className="mt-[6px] h-[22px]">&nbsp;</span>
                  </div>
                ),
              )}
            </div>
          )}
          {pinyinText && (
            <div className="mt-[16px] border-t border-[#F6F7FA] pt-[12px]">
              <div className="mb-[4px] text-[13px] text-[#8F8F8F]">
                整句拼音：
              </div>
              <p className="font-mono text-[15px] leading-[24px] text-[#242424]">
                {pinyinText}
              </p>
            </div>
          )}
        </ToolCard>

        <ToolCard>
          <div className="text-[13px] leading-[22px] text-[#8F8F8F]">
            本工具基于内置拼音表与浏览器 Web Speech API（speechSynthesis）实现，拼音与发音均在本地浏览器完成。多音字取最常用读音；发音使用系统提供的中文语音引擎。
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
