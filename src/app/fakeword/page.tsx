"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { ENGLISH_NAME_BANK, type NameGender } from "./names-bank";

const DESCRIPTION =
  "英文名生成可以帮助用户快速生成各种不同的英文名字，无论您是需要为小说角色、游戏角色、社交媒体账号，这款工具都能提供多种选项。";

const GENDER_LABEL: Record<NameGender, string> = {
  male: "男性",
  female: "女性",
  any: "不限",
};

function secureInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function pick<T>(arr: T[]): T {
  return arr[secureInt(arr.length)];
}

function genOne(gender: NameGender): string {
  const useFemale = gender === "female" || (gender === "any" && secureInt(2) === 0);
  const bank = useFemale ? ENGLISH_NAME_BANK.female : ENGLISH_NAME_BANK.male;
  return `${pick(bank.first)} ${pick(bank.last)}`;
}

function genBatch(gender: NameGender, count: number): string[] {
  const out = new Set<string>();
  let guard = 0;
  while (out.size < count && guard < count * 8) {
    out.add(genOne(gender));
    guard++;
  }
  while (out.size < count) out.add(genOne(gender));
  return [...out];
}

export default function Page() {
  const [gender, setGender] = useState<NameGender>("any");
  const [names, setNames] = useState<string[]>([]);

  const regen = useCallback(() => {
    setNames(genBatch(gender, 12));
  }, [gender]);

  useEffect(() => {
    regen();
  }, [regen]);

  return (
    <ToolPageShell title="英文名生成" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="flex flex-wrap items-center gap-[12px]">
            {(Object.keys(GENDER_LABEL) as NameGender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`h-[36px] rounded-[8px] px-[16px] text-[14px] font-medium transition-colors ${
                  gender === g
                    ? "bg-[#136CE9] text-white"
                    : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                }`}
              >
                {GENDER_LABEL[g]}
              </button>
            ))}
            <div className="ml-auto">
              <ToolButton onClick={regen}>换一批</ToolButton>
            </div>
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
          {names.map((n, i) => (
            <div
              key={`${n}-${i}`}
              className="flex items-center justify-between rounded-[10px] border border-[#F6F7FA] bg-white px-[16px] py-[14px] shadow-[0_0_10px_0_rgba(0,0,0,0.06)]"
            >
              <span className="truncate text-[16px] text-[#242424]">{n}</span>
              <CopyButton text={n} label="复制" />
            </div>
          ))}
        </div>
      </div>
    </ToolPageShell>
  );
}
