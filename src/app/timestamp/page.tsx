"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type TimestampKind = "seconds" | "milliseconds" | "invalid";

function detectKind(raw: string): TimestampKind {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return "invalid";
  if (trimmed.length === 10) return "seconds";
  if (trimmed.length === 13) return "milliseconds";
  return "invalid";
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function toLocalInputValue(d: Date): string {
  // datetime-local value format: YYYY-MM-DDTHH:mm:ss (local time, no timezone)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export default function TimestampPage() {
  const [now, setNow] = useState<number>(0);
  const [tsInput, setTsInput] = useState<string>("");
  const [dtInput, setDtInput] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live current timestamp — updates every second. Guarded against SSR.
  useEffect(() => {
    setNow(Date.now());
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // (a) Timestamp -> human-readable date (local + UTC).
  const tsResult = useMemo(() => {
    const kind = detectKind(tsInput);
    if (kind === "invalid" || tsInput.trim() === "") {
      return { kind, valid: false as const };
    }
    const num = Number(tsInput.trim());
    const ms = kind === "seconds" ? num * 1000 : num;
    if (!Number.isFinite(ms) || ms < 0) {
      return { kind, valid: false as const };
    }
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) {
      return { kind, valid: false as const };
    }
    return {
      kind,
      valid: true as const,
      local: formatLocal(d),
      utc: d.toUTCString(),
      iso: d.toISOString(),
    };
  }, [tsInput]);

  // (b) Date/time -> timestamp (seconds and milliseconds).
  const dtResult = useMemo(() => {
    const value = dtInput.trim();
    if (!value) {
      return { valid: false as const };
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return { valid: false as const };
    }
    const ms = d.getTime();
    return {
      valid: true as const,
      seconds: Math.floor(ms / 1000),
      milliseconds: ms,
    };
  }, [dtInput]);

  const nowSeconds = Math.floor(now / 1000);

  return (
    <ToolPageShell
      title="时间戳转换"
      description="时间戳转换是一款实用的在线工具，专为将时间戳（Unix时间戳）转换为人类可读的日期时间格式，或将日期时间转换为时间戳而设计。通过这款工具，您可以轻松进行时间戳和日期时间之间的相互转换，满足各种编程、数据处理和时间管理需求。"
    >
      <div className="flex flex-col gap-[24px]">
        {/* Live current timestamp */}
        <ToolCard>
          <div className="mb-[12px] flex items-center justify-between">
            <ToolLabel>当前时间戳</ToolLabel>
            <CopyButton text={String(nowSeconds)} label="复制秒级" />
          </div>
          <div className="flex flex-wrap items-center gap-[20px]">
            <div className="flex items-baseline gap-[8px]">
              <span className="text-[14px] text-[#8F8F8F]">秒级</span>
              <span className="font-mono text-[20px] font-semibold text-[#242424]">
                {nowSeconds}
              </span>
              <CopyButton text={String(nowSeconds)} label="复制" />
            </div>
            <div className="flex items-baseline gap-[8px]">
              <span className="text-[14px] text-[#8F8F8F]">毫秒级</span>
              <span className="font-mono text-[20px] font-semibold text-[#242424]">
                {now}
              </span>
              <CopyButton text={String(now)} label="复制" />
            </div>
          </div>
        </ToolCard>

        {/* (a) Timestamp -> date */}
        <ToolCard>
          <ToolLabel>时间戳 转日期时间</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            输入 10 位（秒级）或 13 位（毫秒级）Unix 时间戳，自动识别并转换为本地时间与 UTC。
          </p>
          <div className="flex flex-wrap items-center gap-[12px]">
            <ToolInput
              value={tsInput}
              onChange={setTsInput}
              placeholder="例如 1700000000 或 1700000000000"
              className="w-[320px]"
            />
            <ToolButton
              variant="ghost"
              onClick={() => setTsInput(String(nowSeconds))}
            >
              填入当前秒
            </ToolButton>
            <ToolButton
              variant="ghost"
              onClick={() => setTsInput(String(now))}
            >
              填入当前毫秒
            </ToolButton>
            <ToolButton variant="ghost" onClick={() => setTsInput("")}>
              清空
            </ToolButton>
          </div>

          {tsInput.trim() !== "" && (
            <div className="mt-[16px]">
              {tsResult.valid ? (
                <div className="flex flex-col gap-[10px]">
                  <Row label="识别类型">
                    {tsResult.kind === "seconds" ? "秒级（10位）" : "毫秒级（13位）"}
                  </Row>
                  <Row label="本地时间">
                    <span className="font-mono">{tsResult.local}</span>
                    <CopyButton text={tsResult.local} label="复制" />
                  </Row>
                  <Row label="UTC 时间">
                    <span className="font-mono">{tsResult.utc}</span>
                    <CopyButton text={tsResult.utc} label="复制" />
                  </Row>
                  <Row label="ISO 8601">
                    <span className="font-mono">{tsResult.iso}</span>
                    <CopyButton text={tsResult.iso} label="复制" />
                  </Row>
                </div>
              ) : (
                <p className="text-[13px] text-[#E5484D]">
                  无效输入：请输入 10 位（秒级）或 13 位（毫秒级）的纯数字时间戳。
                </p>
              )}
            </div>
          )}
        </ToolCard>

        {/* (b) Date -> timestamp */}
        <ToolCard>
          <ToolLabel>日期时间 转时间戳</ToolLabel>
          <p className="mb-[12px] text-[13px] text-[#8F8F8F]">
            选择一个本地日期时间，转换为对应的 Unix 时间戳（秒级与毫秒级）。
          </p>
          <div className="flex flex-wrap items-center gap-[12px]">
            <input
              type="datetime-local"
              step={1}
              value={dtInput}
              onChange={(e) => setDtInput(e.target.value)}
              className="h-[40px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9]"
            />
            <ToolButton
              variant="ghost"
              onClick={() => {
                const d = new Date();
                setDtInput(toLocalInputValue(d));
              }}
            >
              填入当前时间
            </ToolButton>
            <ToolButton variant="ghost" onClick={() => setDtInput("")}>
              清空
            </ToolButton>
          </div>

          {dtInput.trim() !== "" && (
            <div className="mt-[16px]">
              {dtResult.valid ? (
                <div className="flex flex-col gap-[10px]">
                  <Row label="秒级时间戳">
                    <span className="font-mono">{dtResult.seconds}</span>
                    <CopyButton text={String(dtResult.seconds)} label="复制" />
                  </Row>
                  <Row label="毫秒级时间戳">
                    <span className="font-mono">{dtResult.milliseconds}</span>
                    <CopyButton text={String(dtResult.milliseconds)} label="复制" />
                  </Row>
                  <Row label="UTC 时间">
                    <span className="font-mono">
                      {new Date(dtInput).toUTCString()}
                    </span>
                  </Row>
                </div>
              ) : (
                <p className="text-[13px] text-[#E5484D]">
                  无效的日期时间，请从选择器中选取一个合法值。
                </p>
              )}
            </div>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <span className="w-[110px] shrink-0 text-[14px] text-[#8F8F8F]">{label}</span>
      <div className="flex flex-wrap items-center gap-[8px]">{children}</div>
    </div>
  );
}
