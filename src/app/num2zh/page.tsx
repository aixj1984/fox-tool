"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const LOWER_DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const UPPER_DIGITS = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];

// Integer section places (per 4-digit group): "", 万, 亿, 万亿, ...
const SECTION_UNITS_LOWER = ["", "万", "亿", "万亿"];
const SECTION_UNITS_UPPER = ["", "万", "亿", "万亿"];

// Within a 4-digit section: 千 百 十 (个)
const PLACE_UNITS_LOWER = ["", "十", "百", "千"];
const PLACE_UNITS_UPPER = ["", "拾", "佰", "仟"];

function convertIntegerSection(
  digits: string,
  digitsArr: string[],
  unit: string,
  placeUnits: string[]
): string {
  // digits: 1-4 digit string for one section
  let result = "";
  const len = digits.length;
  let lastZero = false;
  for (let i = 0; i < len; i++) {
    const d = Number(digits[i]);
    const posFromRight = len - 1 - i; // 0=个,1=十,2=百,3=千
    if (d === 0) {
      lastZero = true;
    } else {
      if (lastZero && result !== "") {
        result += digitsArr[0];
      }
      lastZero = false;
      result += digitsArr[d] + (placeUnits[posFromRight] || "");
    }
  }
  result += unit;
  return result;
}

function convertIntegerPart(
  intStr: string,
  digitsArr: string[],
  sectionUnits: string[],
  placeUnits: string[]
): string {
  if (intStr === "0") return digitsArr[0];
  // Split into 4-digit groups from the right.
  const groups: string[] = [];
  let s = intStr;
  while (s.length > 4) {
    groups.unshift(s.slice(-4));
    s = s.slice(0, -4);
  }
  groups.unshift(s);

  let result = "";
  const sectionCount = groups.length;
  groups.forEach((g, idx) => {
    const unit = sectionUnits[sectionCount - 1 - idx] ?? "";
    const isLast = idx === sectionCount - 1;
    const groupDigits = g.padStart(4, "0");
    const allZero = groupDigits === "0000";
    if (allZero) {
      // skip empty section, but remember a zero boundary
      if (!isLast) {
        // will be handled by next non-zero group's leading zero
      }
      return;
    }
    const sectionStr = convertIntegerSection(g, digitsArr, unit, placeUnits);
    // Handle leading-zero boundary between sections
    if (result !== "" && /^0/.test(g)) {
      // previous section ended, this starts with zero → insert 零
      // but only if previous didn't already end with zero marker
      if (!/零$/.test(result)) {
        result += digitsArr[0];
      }
    }
    result += sectionStr;
  });
  return result;
}

function convertFractionPart(
  fracStr: string,
  digitsArr: string[]
): string {
  if (fracStr === "") return "";
  const unitNames = ["角", "分", "厘", "毫"];
  let out = "";
  for (let i = 0; i < Math.min(fracStr.length, 4); i++) {
    const d = Number(fracStr[i]);
    if (d === 0) {
      // skip zero in fractional part but keep a 零 marker if needed
      out += digitsArr[0];
    } else {
      out += digitsArr[d] + (unitNames[i] || "");
    }
  }
  // Trim trailing 零
  return out.replace(/零+$/g, "");
}

function numberToZh(value: string): { lower: string; upper: string; error: string } {
  const trimmed = value.trim();
  if (trimmed === "") return { lower: "", upper: "", error: "请输入数字。" };
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { lower: "", upper: "", error: "请输入有效的数字（支持小数与负号）。" };
  }
  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [intPart, fracPart = ""] = unsigned.split(".");

  // Handle integer part using BigInt-safe string processing (no scientific notation issues).
  const intTrimmed = intPart.replace(/^0+/, "") || "0";

  const lowerInt = convertIntegerPart(intTrimmed, LOWER_DIGITS, SECTION_UNITS_LOWER, PLACE_UNITS_LOWER);
  const upperInt = convertIntegerPart(intTrimmed, UPPER_DIGITS, SECTION_UNITS_UPPER, PLACE_UNITS_UPPER);

  const lowerFrac = convertFractionPart(fracPart, LOWER_DIGITS);
  const upperFrac = convertFractionPart(fracPart, UPPER_DIGITS);

  let lower = lowerInt;
  let upper = upperInt;

  if (fracPart !== "") {
    if (lowerFrac === "") {
      lower += "整";
    } else {
      lower += "点" + fracPart.split("").map((c) => LOWER_DIGITS[Number(c)]).join("");
    }
    // For uppercase (financial), use 角分厘毫 units
    if (upperFrac === "") {
      upper += "元整";
    } else {
      upper = upperInt + "元" + upperFrac;
    }
  } else {
    upper += "元整";
  }

  // Special case: zero
  if (intTrimmed === "0" && fracPart === "") {
    lower = "零";
    upper = "零元整";
  }

  const sign = negative ? "负" : "";
  return { lower: sign + lower, upper: sign + upper, error: "" };
}

export default function Page() {
  const [input, setInput] = useState("12345.67");

  const { lower, upper, error } = useMemo(() => numberToZh(input), [input]);

  return (
    <ToolPageShell
      title="数字大小写转换"
      description="数字大写和小写是一款免费且开源的数字大小写转换工具...它可以将阿拉伯数字或罗马数字转换为大写或小写，从而使其在文档撰写、数据处理和图形制作等方面得到更广泛的应用。"
    >
      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>输入数字</ToolLabel>
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder="请输入数字，例如 12345.67"
            type="text"
            className="w-full font-mono text-[16px]"
          />
          {error ? (
            <p className="mt-[10px] text-[14px] text-[#E5484D]">{error}</p>
          ) : (
            <p className="mt-[10px] text-[14px] text-[#8F8F8F]">
              支持负数、小数与大数；大写采用财务金额格式（元角分）。
            </p>
          )}
        </ToolCard>

        <ToolCard>
          <ToolLabel>转换结果</ToolLabel>
          <div className="flex flex-col gap-[14px]">
            <div className="rounded-[8px] border border-[#F6F7FA] bg-[#F9FAFB] px-[14px] py-[12px]">
              <div className="mb-[6px] flex items-center justify-between">
                <span className="text-[13px] text-[#8F8F8F]">小写中文</span>
                <CopyButton text={lower} label="复制" />
              </div>
              <p className="break-all text-[16px] text-[#242424]">{lower || "—"}</p>
            </div>
            <div className="rounded-[8px] border border-[#F6F7FA] bg-[#F9FAFB] px-[14px] py-[12px]">
              <div className="mb-[6px] flex items-center justify-between">
                <span className="text-[13px] text-[#8F8F8F]">大写中文（财务）</span>
                <CopyButton text={upper} label="复制" />
              </div>
              <p className="break-all text-[16px] text-[#242424]">{upper || "—"}</p>
            </div>
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
