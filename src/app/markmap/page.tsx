"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "便捷思维导图工具可以帮助您快速创建、编辑和分享思维导图，提升您的思维整理和信息管理能力。通过这款工具，您可以轻松将想法、计划和知识结构化地呈现出来，适用于学习、工作、项目管理和创意设计等多种场景。";

const SAMPLE = `# 主题
## 分支1
### 子项A
### 子项B
## 分支2
### 子项C
#### 细节
## 分支3`;

const PALETTE = ["#136CE9", "#E5484D", "#16A34A", "#9333EA", "#EA580C", "#0891B2"];

export default function Page() {
  const [md, setMd] = useState(SAMPLE);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const markmapRef = useRef<unknown>(null);
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  // Dynamically import browser-only libs after mount.
  const loadLibs = useCallback(async () => {
    const [{ Transformer }, { Markmap }] = await Promise.all([
      import("markmap-lib"),
      import("markmap-view"),
    ]);
    return { Transformer, Markmap } as {
      Transformer: typeof import("markmap-lib").Transformer;
      Markmap: typeof import("markmap-view").Markmap;
    };
  }, []);

  // Initialize the Markmap instance once.
  useEffect(() => {
    let disposed = false;
    loadLibs()
      .then(({ Markmap }) => {
        if (disposed || !svgRef.current) return;
        markmapRef.current = Markmap.create(svgRef.current, {
          autoFit: true,
          duration: 300,
          initialExpandLevel: -1,
          maxWidth: 320,
          spacingHorizontal: 80,
          spacingVertical: 16,
          paddingX: 12,
          color: (node: { state?: { depth?: number } }) =>
            PALETTE[(node.state?.depth ?? 0) % PALETTE.length],
        });
        setReady(true);
      })
      .catch(() => setErr("思维导图模块加载失败"));
    return () => {
      disposed = true;
      const mm = markmapRef.current as { destroy?: () => void } | null;
      try {
        mm?.destroy?.();
      } catch {
        /* ignore */
      }
      markmapRef.current = null;
    };
  }, [loadLibs]);

  // Update data whenever markdown or readiness changes.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    loadLibs()
      .then(({ Transformer }) => {
        if (cancelled) return;
        const mm = markmapRef.current as {
          setData?: (data: unknown) => Promise<void>;
          fit?: () => Promise<void>;
        } | null;
        if (!mm) return;
        try {
          const transformer = new Transformer();
          const { root } = transformer.transform(md);
          void mm.setData?.(root).then(() => mm.fit?.());
        } catch {
          setErr("Markdown 解析失败");
        }
      })
      .catch(() => setErr("思维导图模块加载失败"));
    return () => {
      cancelled = true;
    };
  }, [md, ready, loadLibs]);

  const downloadSvg = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    // Ensure a defined size for standalone file.
    const box = svg.getBoundingClientRect();
    clone.setAttribute("width", String(Math.max(box.width, 800)));
    clone.setAttribute("height", String(Math.max(box.height, 600)));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(clone);
    const blob = new Blob(
      ['<?xml version="1.0" encoding="UTF-8"?>\n', source],
      { type: "image/svg+xml;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "思维导图.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <ToolPageShell title="便捷思维导图" description={DESCRIPTION}>
      <ToolCard>
        <div className="grid grid-cols-2 gap-[16px]">
          <div>
            <div className="mb-[6px] flex items-center justify-between">
              <ToolLabel>Markdown 源码</ToolLabel>
              <ToolButton variant="ghost" onClick={() => setMd("")}>
                清空
              </ToolButton>
            </div>
            <textarea
              value={md}
              onChange={(e) => setMd(e.target.value)}
              rows={22}
              spellCheck={false}
              placeholder="# 主题&#10;## 分支1&#10;### 子项"
              className="w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white p-[12px] font-mono text-[14px] leading-[22px] text-[#242424] outline-none focus:border-[#136CE9]"
            />
            <p className="mt-[8px] text-[12px] text-[#8F8F8F]">
              用 # 标题层级表示思维导图节点，例如 # 为中心主题，## 为一级分支。
            </p>
          </div>
          <div>
            <div className="mb-[6px] flex items-center justify-between">
              <ToolLabel>思维导图</ToolLabel>
              <ToolButton variant="ghost" onClick={downloadSvg} disabled={!ready}>
                下载 SVG
              </ToolButton>
            </div>
            <div className="h-[520px] w-full overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white">
              {err ? (
                <div className="flex h-full items-center justify-center text-[13px] text-[#E5484D]">
                  {err}
                </div>
              ) : (
                <svg
                  ref={svgRef}
                  className="h-full w-full"
                  style={{ background: "#FFFFFF" }}
                />
              )}
            </div>
          </div>
        </div>
      </ToolCard>
    </ToolPageShell>
  );
}
