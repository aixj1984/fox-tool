"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolTextarea,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { textToPinyin } from "./pinyin-table";

const DESCRIPTION =
  "文字转拼音工具可以帮助您将中文文本转换为拼音，便于学习和理解汉字的发音。";

export default function Page() {
  const [text, setText] = useState("");

  const pinyin = useMemo(() => textToPinyin(text), [text]);

  return (
    <ToolPageShell title="文字转拼音" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="mb-[8px] text-[14px] font-medium text-[#242424]">
            输入中文
          </div>
          <ToolTextarea
            value={text}
            onChange={setText}
            placeholder="在此输入中文，例如：你好，世界"
            rows={8}
          />
          <div className="mt-[8px] flex items-center justify-between">
            <span className="text-[13px] text-[#8F8F8F]">
              带声调拼音，自动忽略非中文字符并保留原文
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
          <div className="mb-[12px] flex items-center justify-between">
            <div className="text-[14px] font-medium text-[#242424]">
              拼音结果
            </div>
            <CopyButton text={pinyin} label="复制拼音" />
          </div>
          <div className="min-h-[80px] rounded-[8px] border border-[#F6F7FA] bg-[#FAFBFC] p-[12px]">
            {pinyin ? (
              <p className="font-mono text-[16px] leading-[28px] text-[#242424]">
                {pinyin}
              </p>
            ) : (
              <p className="text-[13px] text-[#8F8F8F]">
                拼音结果将在此显示……
              </p>
            )}
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
