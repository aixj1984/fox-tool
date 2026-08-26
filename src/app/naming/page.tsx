"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import {
  NAME_CHAR_BANK,
  COMMON_SURNAMES,
  type NamingStyle,
  type NamingGender,
  type NameChar,
} from "./char-bank";

const DESCRIPTION =
  "取名字工具是一款免费的工具，可以用来给自己的朋友和家人取名字，用户可以选择自己想要的姓名组合，满足自己的特定需求。";

const STYLE_LABEL: Record<NamingStyle, string> = {
  elegant: "儒雅",
  grand: "大气",
  lively: "灵动",
  classic: "经典",
};

const GENDER_LABEL: Record<NamingGender, string> = {
  male: "男",
  female: "女",
  neutral: "中性",
};

type GenderChoice = "male" | "female";

function secureInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function pick<T>(arr: T[]): T {
  return arr[secureInt(arr.length)];
}

function filterChars(style: NamingStyle, gender: GenderChoice): NameChar[] {
  // A character is eligible if it has the chosen style AND fits the gender
  // (either matches exactly or is tagged neutral).
  return NAME_CHAR_BANK.filter(
    (c) =>
      c.styles.includes(style) &&
      (c.gender.includes(gender) || c.gender.includes("neutral")),
  );
}

interface GeneratedName {
  full: string;
  given: string;
  meanings: string[];
}

function genOne(surname: string, style: NamingStyle, gender: GenderChoice): GeneratedName {
  const pool = filterChars(style, gender);
  // 60% two-character given name, 40% single-character.
  const twoChar = secureInt(10) < 6;
  if (pool.length === 0) {
    return { full: surname, given: "", meanings: [] };
  }
  if (!twoChar) {
    const c = pick(pool);
    return { full: surname + c.ch, given: c.ch, meanings: [c.meaning] };
  }
  const a = pick(pool);
  let b = pick(pool);
  let guard = 0;
  while (b.ch === a.ch && guard < 8) {
    b = pick(pool);
    guard++;
  }
  return {
    full: surname + a.ch + b.ch,
    given: a.ch + b.ch,
    meanings: [a.meaning, b.meaning],
  };
}

function genBatch(
  surname: string,
  style: NamingStyle,
  gender: GenderChoice,
  count: number,
): GeneratedName[] {
  const out = new Map<string, GeneratedName>();
  let guard = 0;
  while (out.size < count && guard < count * 10) {
    const n = genOne(surname, style, gender);
    if (n.given) out.set(n.full, n);
    guard++;
  }
  while (out.size < count) {
    const n = genOne(surname, style, gender);
    if (n.given) out.set(n.full, n);
  }
  return [...out.values()];
}

export default function Page() {
  const [surname, setSurname] = useState("李");
  const [gender, setGender] = useState<GenderChoice>("male");
  const [style, setStyle] = useState<NamingStyle>("elegant");
  const [names, setNames] = useState<GeneratedName[]>([]);

  const regen = useCallback(() => {
    const sn = surname.trim() || "李";
    setNames(genBatch(sn, style, gender, 12));
  }, [surname, style, gender]);

  useEffect(() => {
    regen();
  }, [regen]);

  const poolSize = useMemo(
    () => filterChars(style, gender).length,
    [style, gender],
  );

  return (
    <ToolPageShell title="取名字" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3">
            <div>
              <ToolLabel>姓氏</ToolLabel>
              <ToolInput
                value={surname}
                onChange={setSurname}
                placeholder="例如：李"
                className="w-full"
              />
              <div className="mt-[8px] flex flex-wrap gap-[6px]">
                {COMMON_SURNAMES.slice(0, 10).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSurname(s)}
                    className="h-[28px] rounded-[6px] bg-[#F6F7FA] px-[10px] text-[13px] text-[#242424] hover:bg-[#ebedf2]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <ToolLabel>性别</ToolLabel>
              <div className="flex gap-[8px]">
                {(Object.keys(GENDER_LABEL) as NamingGender[])
                  .filter((g) => g !== "neutral")
                  .map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g as GenderChoice)}
                      className={`h-[36px] flex-1 rounded-[8px] text-[14px] font-medium transition-colors ${
                        gender === g
                          ? "bg-[#136CE9] text-white"
                          : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                      }`}
                    >
                      {GENDER_LABEL[g]}
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <ToolLabel>风格</ToolLabel>
              <div className="flex flex-wrap gap-[6px]">
                {(Object.keys(STYLE_LABEL) as NamingStyle[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`h-[32px] rounded-[8px] px-[12px] text-[13px] font-medium transition-colors ${
                      style === s
                        ? "bg-[#136CE9] text-white"
                        : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
                    }`}
                  >
                    {STYLE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-[16px] flex items-center justify-between">
            <span className="text-[12px] text-[#8F8F8F]">
              当前风格可选字库：{poolSize} 字
            </span>
            <ToolButton onClick={regen}>换一批</ToolButton>
          </div>
        </ToolCard>

        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
          {names.map((n, i) => (
            <div
              key={`${n.full}-${i}`}
              className="group flex items-center justify-between rounded-[10px] border border-[#F6F7FA] bg-white px-[16px] py-[14px] shadow-[0_0_10px_0_rgba(0,0,0,0.06)]"
            >
              <div>
                <div className="text-[18px] font-medium text-[#242424]">
                  {n.full}
                </div>
                <div className="mt-[2px] text-[12px] text-[#8F8F8F]">
                  {n.meanings.join(" · ")}
                </div>
              </div>
              <CopyButton text={n.full} label="复制" />
            </div>
          ))}
        </div>
      </div>
    </ToolPageShell>
  );
}
