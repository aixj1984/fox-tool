"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "保护您的数字安全！只需输入密码，我们的密码安全检测工具即刻为您进行全面检测。快速评估密码强度，提供改进建议，确保您的账户防护坚不可摧。安全隐私，从强密码开始。";

// A compact blocklist of ~100 common / leaked passwords. Lowercase comparison.
const COMMON_PASSWORDS = new Set<string>([
  "123456", "123456789", "12345678", "1234567", "1234567890", "123456a",
  "123123", "111111", "222222", "333333", "444444", "555555", "666666",
  "777777", "888888", "999999", "000000", "66666666", "88888888",
  "abc123", "abc123456", "abcdef", "abcabc", "aabbcc", "qwerty",
  "qwerty123", "qwertyuiop", "qazwsx", "qweasd", "qwer1234", "1qaz2wsx",
  "password", "password1", "password12", "password123", "passw0rd",
  "iloveyou", "letmein", "welcome", "welcome1", "monkey", "dragon",
  "master", "login", "admin", "admin123", "root", "toor", "test",
  "guest", "user", "superman", "batman", "michael", "jordan", "harley",
  "ranger", "trustno1", "killer", "shadow", "sunshine", "princess",
  "football", "baseball", "soccer", "hockey", "starwars", "ninja",
  "mustang", "access", "flower", "hottie", "loveme", "azbycxdw",
  "1q2w3e4r", "1q2w3e", "zxcvbnm", "asdfgh", "asdfghjkl", "q1w2e3r4",
  "a1b2c3", "aaa111", "ab12cd", "5201314", "521521", "1314520",
  "woaini", "woaini520", "iloveu", "iloveyou1314", "147258369",
  "987654321", "135790", "246810", "121212", "112233", "123321",
  "654321", "7654321", "abcd1234",
]);

type Strength = "弱" | "中" | "强" | "很强";

const STRENGTH_STYLE: Record<Strength, { color: string; bg: string; label: string }> = {
  "弱": { color: "text-[#E5484D]", bg: "bg-[#E5484D]", label: "弱" },
  "中": { color: "text-[#F5A623]", bg: "bg-[#F5A623]", label: "中" },
  "强": { color: "text-[#166534]", bg: "bg-[#22A06B]", label: "强" },
  "很强": { color: "text-[#0f5fc4]", bg: "bg-[#136CE9]", label: "很强" },
};

function hasLower(s: string) {
  return /[a-z]/.test(s);
}
function hasUpper(s: string) {
  return /[A-Z]/.test(s);
}
function hasDigit(s: string) {
  return /[0-9]/.test(s);
}
function hasSymbol(s: string) {
  return /[^A-Za-z0-9]/.test(s);
}

// Rough entropy estimate based on pool size and length.
function entropyBits(pw: string): number {
  if (!pw) return 0;
  let pool = 0;
  if (hasLower(pw)) pool += 26;
  if (hasUpper(pw)) pool += 26;
  if (hasDigit(pw)) pool += 10;
  if (hasSymbol(pw)) pool += 33; // common punctuation range
  if (pool === 0) pool = 1;
  return pw.length * Math.log2(pool);
}

// Crack-time estimate assuming 10^8 guesses/sec (offline fast hash).
// Returns human-readable string. Guard against Infinity / NaN.
function humanTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "即时";
  if (seconds < 1) return "不到 1 秒";
  const units: [number, string][] = [
    [60, "秒"],
    [60, "分钟"],
    [24, "小时"],
    [365, "天"],
    [100, "年"],
    [100, "世纪"],
  ];
  let value = seconds;
  let unit = "秒";
  for (const [factor, name] of units) {
    if (value < factor) {
      unit = name;
      break;
    }
    value /= factor;
    unit = name;
  }
  if (unit === "世纪" && value > 1e6) return "数百万世纪以上";
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString()} ${unit}`;
}

function crackTime(pw: string): string {
  const bits = entropyBits(pw);
  if (bits <= 0) return "—";
  // Average guesses to exhaust = 2^bits / 2; at 1e8/s.
  const seconds = Math.pow(2, bits) / 2 / 1e8;
  return humanTime(seconds);
}

function scoreStrength(pw: string): Strength {
  const bits = entropyBits(pw);
  if (pw.length < 8 || bits < 28) return "弱";
  if (bits < 36) return "中";
  if (bits < 60) return "强";
  return "很强";
}

type Issue = { text: string; level: "warn" | "info" };

function detectIssues(pw: string): Issue[] {
  const issues: Issue[] = [];
  if (pw.length === 0) return issues;
  if (pw.length < 8) issues.push({ text: "密码太短，建议至少 8 位", level: "warn" });
  else if (pw.length < 12)
    issues.push({ text: "密码长度一般，建议 12 位以上更安全", level: "info" });
  if (!hasLower(pw)) issues.push({ text: "缺少小写字母", level: "warn" });
  if (!hasUpper(pw)) issues.push({ text: "缺少大写字母", level: "warn" });
  if (!hasDigit(pw)) issues.push({ text: "缺少数字", level: "warn" });
  if (!hasSymbol(pw)) issues.push({ text: "缺少符号（如 !@#$%）", level: "warn" });
  if (/^(.)\1+$/.test(pw)) issues.push({ text: "密码全部由重复字符组成", level: "warn" });
  if (/^(0123456789|1234567890|abcdefgh|qwerty|asdfgh|zxcvbn)/i.test(pw))
    issues.push({ text: "包含常见键盘序列", level: "warn" });
  if (COMMON_PASSWORDS.has(pw.toLowerCase()))
    issues.push({ text: "该密码位于常见密码字典中，极易被破解", level: "warn" });
  return issues;
}

export default function Page() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  const report = useMemo(() => {
    const length = pw.length;
    const classes = {
      lower: hasLower(pw),
      upper: hasUpper(pw),
      digit: hasDigit(pw),
      symbol: hasSymbol(pw),
    };
    const classCount = Object.values(classes).filter(Boolean).length;
    const bits = entropyBits(pw);
    const strength = scoreStrength(pw);
    const crack = crackTime(pw);
    const issues = detectIssues(pw);
    return { length, classes, classCount, bits, strength, crack, issues };
  }, [pw]);

  const style = STRENGTH_STYLE[report.strength];
  const barFill = report.length === 0 ? 0 : Math.min(100, (report.bits / 80) * 100);

  return (
    <ToolPageShell title="密码安全检测" description={DESCRIPTION}>
      <div className="flex flex-col gap-[24px]">
        <ToolCard>
          <ToolLabel>输入密码</ToolLabel>
          <div className="flex items-center gap-[8px]">
            <div className="relative flex-1">
              <ToolInput
                value={pw}
                onChange={setPw}
                placeholder="输入要检测的密码"
                type={show ? "text" : "password"}
                className="w-full pr-[64px]"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[13px] text-[#136CE9] hover:underline"
              >
                {show ? "隐藏" : "显示"}
              </button>
            </div>
          </div>
          <p className="mt-[8px] text-[12px] text-[#B0B0B0]">
            检测在浏览器本地完成，密码不会上传到任何服务器。
          </p>
        </ToolCard>

        <ToolCard>
          <div className="mb-[16px] flex items-center justify-between">
            <ToolLabel>强度评估</ToolLabel>
            {report.length > 0 ? (
              <span className={`text-[16px] font-semibold ${style.color}`}>
                {report.strength}
              </span>
            ) : (
              <span className="text-[13px] text-[#8F8F8F]">输入密码后实时评估</span>
            )}
          </div>
          <div className="h-[8px] w-full overflow-hidden rounded-full bg-[#F6F7FA]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${style.bg}`}
              style={{ width: `${barFill}%` }}
            />
          </div>

          <div className="mt-[20px] grid grid-cols-2 gap-[12px] sm:grid-cols-4">
            <Metric label="密码长度" value={report.length > 0 ? `${report.length} 位` : "—"} />
            <Metric label="字符种类" value={report.length > 0 ? `${report.classCount} / 4` : "—"} />
            <Metric label="估算熵值" value={report.length > 0 ? `${report.bits.toFixed(1)} bit` : "—"} />
            <Metric label="离线破解耗时" value={report.length > 0 ? report.crack : "—"} />
          </div>

          <div className="mt-[20px]">
            <div className="mb-[8px] text-[13px] text-[#8F8F8F]">字符组成</div>
            <div className="flex flex-wrap gap-[8px]">
              <CharClass label="小写字母" ok={report.classes.lower} />
              <CharClass label="大写字母" ok={report.classes.upper} />
              <CharClass label="数字" ok={report.classes.digit} />
              <CharClass label="符号" ok={report.classes.symbol} />
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <ToolLabel>改进建议</ToolLabel>
          {report.length === 0 ? (
            <p className="text-[13px] text-[#8F8F8F]">输入密码后将给出针对性的改进建议。</p>
          ) : report.issues.length === 0 ? (
            <p className="text-[13px] text-[#166534]">未发现明显问题，密码强度良好。</p>
          ) : (
            <ul className="flex flex-col gap-[8px]">
              {report.issues.map((it, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-[8px] text-[13px] ${
                    it.level === "warn" ? "text-[#991b1b]" : "text-[#8F8F8F]"
                  }`}
                >
                  <span
                    className={`mt-[6px] h-[6px] w-[6px] shrink-0 rounded-full ${
                      it.level === "warn" ? "bg-[#E5484D]" : "bg-[#F5A623]"
                    }`}
                  />
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#F6F7FA] bg-[#FAFBFC] p-[12px]">
      <div className="text-[12px] text-[#8F8F8F]">{label}</div>
      <div className="mt-[4px] font-mono text-[16px] text-[#242424]">{value}</div>
    </div>
  );
}

function CharClass({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded-[6px] border px-[10px] py-[4px] text-[13px] ${
        ok
          ? "border-[#22A06B]/30 bg-[#dcfce7] text-[#166534]"
          : "border-[#E5E7EB] bg-[#F6F7FA] text-[#8F8F8F]"
      }`}
    >
      <span
        className={`h-[6px] w-[6px] rounded-full ${ok ? "bg-[#22A06B]" : "bg-[#B0B0B0]"}`}
      />
      {label}
    </span>
  );
}
