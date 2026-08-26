"use client";

import { useEffect, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

interface ParsedUA {
  browser: string;
  browserVersion: string;
  engine: string;
  engineVersion: string;
  os: string;
  device: string;
}

// Tiny regex-based UA parser. No external dependency.
function parseUA(ua: string): ParsedUA {
  const u = ua || "";
  const empty: ParsedUA = {
    browser: "未知",
    browserVersion: "",
    engine: "未知",
    engineVersion: "",
    os: "未知",
    device: "未知",
  };
  if (!u.trim()) return empty;

  // --- OS ---
  let os = "未知";
  if (/Windows NT 10/.test(u)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/.test(u)) os = "Windows 8.1";
  else if (/Windows NT 6\.2/.test(u)) os = "Windows 8";
  else if (/Windows NT 6\.1/.test(u)) os = "Windows 7";
  else if (/Windows/.test(u)) os = "Windows";
  else if (/iPhone|iPad|iPod/.test(u)) {
    const m = u.match(/OS (\d+[_\d]*)/);
    os = m ? `iOS ${m[1].replace(/_/g, ".")}` : "iOS";
  } else if (/Mac OS X/.test(u)) {
    const m = u.match(/Mac OS X (\d+[_\d]*)/);
    os = m ? `macOS ${m[1].replace(/_/g, ".")}` : "macOS";
  } else if (/Android/.test(u)) {
    const m = u.match(/Android (\d+\.?\d*)/);
    os = m ? `Android ${m[1]}` : "Android";
  } else if (/Linux/.test(u)) os = "Linux";
  else if (/CrOS/.test(u)) os = "Chrome OS";

  // --- Engine + Engine version ---
  let engine = "未知";
  let engineVersion = "";
  if (/Gecko\/[\d.]+/.test(u) && !/like Gecko/.test(u)) {
    engine = "Gecko";
    const m = u.match(/rv:([\d.]+)/);
    engineVersion = m ? m[1] : "";
  } else if (/AppleWebKit\/([\d.]+)/.test(u) && /Chrome\/[\d.]+/.test(u)) {
    // Blink (Chrome/Edge/Opera > 15).
    engine = "Blink";
    const m = u.match(/AppleWebKit\/([\d.]+)/);
    engineVersion = m ? m[1] : "";
  } else if (/AppleWebKit\/([\d.]+)/.test(u)) {
    // WebKit (Safari).
    engine = "WebKit";
    const m = u.match(/AppleWebKit\/([\d.]+)/);
    engineVersion = m ? m[1] : "";
  } else if (/Trident\/([\d.]+)/.test(u)) {
    engine = "Trident";
    const m = u.match(/Trident\/([\d.]+)/);
    engineVersion = m ? m[1] : "";
  }

  // --- Browser + Browser version ---
  let browser = "未知";
  let browserVersion = "";
  // Edge (Chromium) — check before Chrome.
  if (/Edg\/([\d.]+)/.test(u)) {
    browser = "Microsoft Edge";
    const m = u.match(/Edg\/([\d.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (/OPR\/([\d.]+)/.test(u) || /Opera\/([\d.]+)/.test(u)) {
    browser = "Opera";
    const m = u.match(/OPR\/([\d.]+)|Opera\/([\d.]+)/);
    browserVersion = m ? m[1] || m[2] || "" : "";
  } else if (/Firefox\/([\d.]+)/.test(u)) {
    browser = "Firefox";
    const m = u.match(/Firefox\/([\d.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (/MSIE ([\d.]+)/.test(u) || /Trident\/[\d.]+/.test(u)) {
    browser = "Internet Explorer";
    const m = u.match(/MSIE ([\d.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (/Chrome\/([\d.]+)/.test(u)) {
    browser = "Chrome";
    const m = u.match(/Chrome\/([\d.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (/Safari\/([\d.]+)/.test(u) && /Version\/([\d.]+)/.test(u)) {
    browser = "Safari";
    const m = u.match(/Version\/([\d.]+)/);
    browserVersion = m ? m[1] : "";
  } else if (/Safari\/([\d.]+)/.test(u)) {
    browser = "Safari";
    const m = u.match(/Safari\/([\d.]+)/);
    browserVersion = m ? m[1] : "";
  }

  // --- Device type ---
  let device = "桌面端";
  if (/iPad/.test(u)) device = "平板 (iPad)";
  else if (/iPhone/.test(u)) device = "手机 (iPhone)";
  else if (/Android/.test(u)) {
    device = /Mobile/.test(u) ? "手机 (Android)" : "平板 (Android)";
  } else if (/Mobile/.test(u)) device = "移动设备";
  else if (/Macintosh/.test(u)) device = "桌面端 (Mac)";
  else if (/Windows/.test(u)) device = "桌面端 (PC)";

  return { browser, browserVersion, engine, engineVersion, os, device };
}

const EXAMPLES: { label: string; ua: string }[] = [
  {
    label: "Chrome / Windows",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
  {
    label: "Safari / macOS",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  },
  {
    label: "Edge / Windows",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  },
  {
    label: "Firefox / Windows",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  },
  {
    label: "Chrome / iPhone",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1",
  },
  {
    label: "Safari / iPhone",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
  },
  {
    label: "Chrome / Android",
    ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  },
  {
    label: "IE 11 / Windows 7",
    ua: "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
  },
];

export default function UserAgentPage() {
  const [currentUA, setCurrentUA] = useState<string>("");
  const [input, setInput] = useState<string>("");

  // Capture navigator.userAgent on the client only.
  useEffect(() => {
    const ua = navigator.userAgent;
    setCurrentUA(ua);
    setInput(ua);
  }, []);

  const parsed = parseUA(input);
  const currentParsed = parseUA(currentUA);

  return (
    <ToolPageShell
      title="userAgent工具"
      description="userAgent工具可以帮助您查看和分析浏览器的User-Agent字符串。通过这款工具，您可以轻松获取当前浏览器的User-Agent信息，了解浏览器类型、版本、操作系统等详细信息，便于进行网页开发、调试和兼容性测试。"
    >
      <div className="flex flex-col gap-[24px]">
        {/* Current browser UA */}
        <ToolCard>
          <ToolLabel>当前浏览器 User-Agent</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            下方为当前浏览器发送的 User-Agent 字符串，由 <code>navigator.userAgent</code> 获取。
          </p>
          <div className="flex flex-wrap items-start gap-[12px]">
            <div className="min-h-[40px] w-full break-all rounded-[8px] border border-[#E5E7EB] bg-[#F6F7FA] p-[12px] font-mono text-[13px] leading-[20px] text-[#242424]">
              {currentUA || "正在读取…"}
            </div>
            <CopyButton text={currentUA} label="复制 UA" />
            <ToolButton variant="ghost" onClick={() => setInput(currentUA)}>
              填入解析框
            </ToolButton>
          </div>

          {currentUA && (
            <div className="mt-[16px]">
              <ParseResult result={currentParsed} />
            </div>
          )}
        </ToolCard>

        {/* Parse any UA */}
        <ToolCard>
          <ToolLabel>解析任意 User-Agent 字符串</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            在下方输入框中粘贴任意 User-Agent 字符串，自动解析浏览器、引擎、操作系统与设备类型。
          </p>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="粘贴 User-Agent 字符串…"
            rows={4}
          />
          <div className="mt-[12px] flex flex-wrap gap-[8px]">
            <ToolButton variant="ghost" onClick={() => setInput(currentUA)}>
              填入当前 UA
            </ToolButton>
            <ToolButton variant="ghost" onClick={() => setInput("")}>
              清空
            </ToolButton>
          </div>

          <div className="mt-[16px]">
            <ParseResult result={parsed} />
          </div>
        </ToolCard>

        {/* Quick-fill examples */}
        <ToolCard>
          <ToolLabel>常见 User-Agent 示例</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            点击任意示例可将其填入上方解析框进行测试。
          </p>
          <div className="flex flex-wrap gap-[8px]">
            {EXAMPLES.map((ex) => (
              <ToolButton
                key={ex.label}
                variant="ghost"
                onClick={() => setInput(ex.ua)}
              >
                {ex.label}
              </ToolButton>
            ))}
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function ParseResult({ result }: { result: ParsedUA }) {
  return (
    <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
      <Field label="浏览器">
        {result.browser}
        {result.browserVersion ? ` ${result.browserVersion}` : ""}
      </Field>
      <Field label="内核">
        {result.engine}
        {result.engineVersion ? ` ${result.engineVersion}` : ""}
      </Field>
      <Field label="操作系统">{result.os}</Field>
      <Field label="设备类型">{result.device}</Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[2px] rounded-[8px] border border-[#F6F7FA] bg-[#FAFBFC] p-[12px]">
      <span className="text-[13px] text-[#8F8F8F]">{label}</span>
      <span className="text-[14px] font-medium text-[#242424]">{children}</span>
    </div>
  );
}
