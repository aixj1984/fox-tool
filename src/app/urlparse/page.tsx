"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

interface ParsedUrl {
  valid: boolean;
  error?: string;
  parts?: {
    href: string;
    protocol: string;
    username: string;
    password: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
  };
  params?: { key: string; value: string }[];
}

function parseUrl(raw: string): ParsedUrl {
  const trimmed = raw.trim();
  if (trimmed === "") return { valid: false, error: "请输入需要解析的 URL。" };
  try {
    const u = new URL(trimmed);
    const params: { key: string; value: string }[] = [];
    u.searchParams.forEach((value, key) => params.push({ key, value }));
    return {
      valid: true,
      parts: {
        href: u.href,
        protocol: u.protocol,
        username: u.username,
        password: u.password,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        origin: u.origin,
      },
      params,
    };
  } catch {
    return { valid: false, error: "无效的 URL，请检查协议与格式（例如需要包含 http:// 或 https://）。" };
  }
}

export default function Page() {
  const [input, setInput] = useState("https://tool.browser.qq.com/jsoncheck?key=abc&page=1#section");

  const parsed = useMemo(() => parseUrl(input), [input]);

  const componentRows = parsed.parts
    ? [
        { label: "完整 URL", value: parsed.parts.href },
        { label: "协议 (protocol)", value: parsed.parts.protocol },
        { label: "主机名 (hostname)", value: parsed.parts.hostname },
        { label: "端口 (port)", value: parsed.parts.port || "（默认）" },
        { label: "路径 (pathname)", value: parsed.parts.pathname },
        { label: "查询串 (search)", value: parsed.parts.search || "（无）" },
        { label: "锚点 (hash)", value: parsed.parts.hash || "（无）" },
        { label: "用户名 (username)", value: parsed.parts.username || "（无）" },
        { label: "密码 (password)", value: parsed.parts.password ? "******" : "（无）" },
        { label: "来源 (origin)", value: parsed.parts.origin },
      ]
    : [];

  return (
    <ToolPageShell
      title="URL解析"
      description="URL解析是一款免费的在线域名处理工具，可以帮助您快速理解如何解析常见的URL格式，获取到域名请求方法...无论您是新手还是专家都可以提高你的工作效率"
    >
      <ToolCard className="mb-[20px]">
        <ToolLabel>输入 URL</ToolLabel>
        <ToolInput
          value={input}
          onChange={setInput}
          placeholder="https://example.com/path?key=value#hash"
          className="w-full font-mono"
        />
        {parsed.valid ? null : (
          <p className="mt-[10px] text-[14px] text-[#E5484D]">{parsed.error}</p>
        )}
      </ToolCard>

      {parsed.valid && parsed.parts ? (
        <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
          <ToolCard>
            <ToolLabel>URL 组成部分</ToolLabel>
            <div className="flex flex-col gap-[10px]">
              {componentRows.map((r) => (
                <div
                  key={r.label}
                  className="flex items-start gap-[12px] rounded-[8px] border border-[#F6F7FA] bg-[#F9FAFB] px-[12px] py-[10px]"
                >
                  <span className="w-[140px] shrink-0 text-[13px] text-[#8F8F8F]">
                    {r.label}
                  </span>
                  <span className="min-w-0 flex-1 break-all font-mono text-[14px] text-[#242424]">
                    {r.value}
                  </span>
                  <CopyButton text={r.value} label="复制" />
                </div>
              ))}
            </div>
          </ToolCard>

          <ToolCard>
            <ToolLabel>查询参数 (Query Parameters)</ToolLabel>
            {parsed.params && parsed.params.length > 0 ? (
              <div className="overflow-hidden rounded-[8px] border border-[#F6F7FA]">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-left text-[#8F8F8F]">
                      <th className="px-[12px] py-[10px] font-medium">参数名</th>
                      <th className="px-[12px] py-[10px] font-medium">参数值</th>
                      <th className="w-[70px] px-[12px] py-[10px] font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.params.map((p, i) => (
                      <tr key={`${p.key}-${i}`} className="border-t border-[#F6F7FA]">
                        <td className="break-all px-[12px] py-[10px] font-mono text-[#242424]">{p.key}</td>
                        <td className="break-all px-[12px] py-[10px] font-mono text-[#242424]">{p.value}</td>
                        <td className="px-[12px] py-[10px]">
                          <CopyButton text={p.value} label="复制" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-[120px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[14px] text-[#8F8F8F]">
                该 URL 不包含查询参数
              </div>
            )}
          </ToolCard>
        </div>
      ) : null}
    </ToolPageShell>
  );
}
