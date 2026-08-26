"use client";

import { useMemo, useRef, useState } from "react";
import { marked } from "marked";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "Markdown编辑器是一款简单易用的文字处理和排版工具，旨在帮助用户快速创建专业、高效、优美的文档。它采用 Markdown 语法，能够有效提升文档的可读性和易用性。";

// Configure marked for synchronous output (no async/walkTokens).
marked.setOptions({
  gfm: true,
  breaks: true,
  async: false,
});

const SAMPLE = `# Markdown 编辑器

这是一个 **实时预览** 的 Markdown 编辑器。

## 功能列表
- 支持 GitHub Flavored Markdown
- 实时渲染
- 一键复制 HTML

## 代码示例
\`\`\`js
function hello() {
  console.log("Hello, world!");
}
\`\`\`

> 引用：知识就是力量。

[链接到示例](https://example.com)

| 表头 | 值 |
| ---- | -- |
| A    | 1  |
| B    | 2  |
`;

type ToolbarAction = {
  label: string;
  title: string;
  apply: (before: string, selStart: number, selEnd: number) => {
    text: string;
    selStart: number;
    selEnd: number;
  };
};

const toolbar: ToolbarAction[] = [
  {
    label: "B",
    title: "加粗",
    apply: (t, s, e) => {
      const sel = t.slice(s, e) || "粗体";
      const next = t.slice(0, s) + `**${sel}**` + t.slice(e);
      return { text: next, selStart: s + 2, selEnd: s + 2 + sel.length };
    },
  },
  {
    label: "I",
    title: "斜体",
    apply: (t, s, e) => {
      const sel = t.slice(s, e) || "斜体";
      const next = t.slice(0, s) + `*${sel}*` + t.slice(e);
      return { text: next, selStart: s + 1, selEnd: s + 1 + sel.length };
    },
  },
  {
    label: "H1",
    title: "一级标题",
    apply: (t, s) => insertLinePrefix(t, s, "# "),
  },
  {
    label: "H2",
    title: "二级标题",
    apply: (t, s) => insertLinePrefix(t, s, "## "),
  },
  {
    label: "“ ”",
    title: "链接",
    apply: (t, s, e) => {
      const sel = t.slice(s, e) || "链接文字";
      const next = t.slice(0, s) + `[${sel}](https://)` + t.slice(e);
      return { text: next, selStart: s + 1, selEnd: s + 1 + sel.length };
    },
  },
  {
    label: "• 列表",
    title: "无序列表",
    apply: (t, s) => insertLinePrefix(t, s, "- "),
  },
  {
    label: "</>",
    title: "行内代码",
    apply: (t, s, e) => {
      const sel = t.slice(s, e) || "code";
      const next = t.slice(0, s) + `\`${sel}\`` + t.slice(e);
      return { text: next, selStart: s + 1, selEnd: s + 1 + sel.length };
    },
  },
];

function insertLinePrefix(
  text: string,
  selStart: number,
  prefix: string,
): { text: string; selStart: number; selEnd: number } {
  // Find start of the line containing selStart.
  let lineStart = selStart;
  while (lineStart > 0 && text[lineStart - 1] !== "\n") lineStart -= 1;
  const next = text.slice(0, lineStart) + prefix + text.slice(lineStart);
  return {
    text: next,
    selStart: selStart + prefix.length,
    selEnd: selStart + prefix.length,
  };
}

export default function Page() {
  const [md, setMd] = useState(SAMPLE);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const html = useMemo(() => {
    try {
      const out = marked.parse(md, { async: false });
      return typeof out === "string" ? out : "";
    } catch {
      return "<p style=\"color:#E5484D\">渲染出错</p>";
    }
  }, [md]);

  const applyAction = (action: ToolbarAction) => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart ?? md.length;
    const e = ta.selectionEnd ?? md.length;
    const { text: next, selStart, selEnd } = action.apply(md, s, e);
    setMd(next);
    // Restore selection after React updates the textarea.
    window.requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  };

  return (
    <ToolPageShell title="markdown编辑器" description={DESCRIPTION}>
      <div className="flex flex-col gap-[16px]">
        <ToolCard>
          <div className="mb-[10px] flex flex-wrap items-center gap-[8px]">
            {toolbar.map((a) => (
              <button
                key={a.label}
                type="button"
                title={a.title}
                onClick={() => applyAction(a)}
                className="min-w-[36px] rounded-[6px] border border-[#E5E7EB] bg-white px-[10px] py-[4px] text-[13px] font-medium text-[#242424] transition-colors hover:bg-[#F6F7FA]"
              >
                {a.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-[8px]">
              <CopyButton text={html} label="复制 HTML" />
              <ToolButton variant="ghost" onClick={() => setMd("")}>
                清空
              </ToolButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div>
              <div className="mb-[6px] text-[13px] font-medium text-[#242424]">
                源码
              </div>
              <textarea
                ref={taRef}
                value={md}
                onChange={(e) => setMd(e.target.value)}
                rows={20}
                spellCheck={false}
                className="w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white p-[12px] font-mono text-[14px] leading-[22px] text-[#242424] outline-none focus:border-[#136CE9]"
                placeholder="输入 Markdown 源码……"
              />
            </div>
            <div>
              <div className="mb-[6px] text-[13px] font-medium text-[#242424]">
                预览
              </div>
              <div
                className="prose prose-sm max-w-none min-h-[420px] overflow-auto rounded-[8px] border border-[#E5E7EB] bg-white p-[16px] [&_a]:text-[#136CE9] [&_a]:underline [&_blockquote]:border-l-[#136CE9] [&_blockquote]:pl-[12px] [&_blockquote]:text-[#8F8F8F] [&_code]:rounded [&_code]:bg-[#F6F7FA] [&_code]:px-[4px] [&_code]:py-[1px] [&_code]:text-[#92400e] [&_h1]:text-[22px] [&_h1]:font-semibold [&_h2]:mt-[16px] [&_h2]:text-[18px] [&_h2]:font-semibold [&_hr]:border-[#E5E7EB] [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-[20px] [&_pre]:overflow-auto [&_pre]:rounded-[8px] [&_pre]:bg-[#242424] [&_pre]:p-[12px] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white [&_table]:w-full [&_td]:border [&_td]:border-[#E5E7EB] [&_td]:px-[8px] [&_td]:py-[4px] [&_th]:border [&_th]:border-[#E5E7EB] [&_th]:bg-[#F6F7FA] [&_th]:px-[8px] [&_th]:py-[4px] [&_ul]:list-disc [&_ul]:pl-[20px]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
