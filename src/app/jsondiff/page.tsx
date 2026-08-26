"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolTextarea,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type DiffOp = "added" | "removed" | "changed";

interface DiffEntry {
  path: string;
  op: DiffOp;
  left?: unknown;
  right?: unknown;
}

function parseJson(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, error: "输入为空。" };
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function formatValue(v: unknown): string {
  if (v === undefined) return "undefined";
  if (typeof v === "string") return `"${v}"`;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function deepDiff(
  left: unknown,
  right: unknown,
  path: string,
  out: DiffEntry[]
): void {
  // Both objects (non-array) → recurse by keys
  if (isObject(left) && isObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    keys.forEach((k) => {
      const childPath = path === "" ? k : `${path}.${k}`;
      const lv = left[k];
      const rv = right[k];
      if (!(k in left)) {
        out.push({ path: childPath, op: "added", right: rv });
      } else if (!(k in right)) {
        out.push({ path: childPath, op: "removed", left: lv });
      } else {
        deepDiff(lv, rv, childPath, out);
      }
    });
    return;
  }
  // Both arrays → compare index by index
  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length);
    for (let i = 0; i < max; i++) {
      const childPath = `${path}[${i}]`;
      if (i >= left.length) {
        out.push({ path: childPath, op: "added", right: right[i] });
      } else if (i >= right.length) {
        out.push({ path: childPath, op: "removed", left: left[i] });
      } else {
        deepDiff(left[i], right[i], childPath, out);
      }
    }
    return;
  }
  // Type differs or primitives differ
  if (left !== right) {
    // If types differ but both are complex (one object, one array etc.), report as changed
    const leftComplex = isObject(left) || Array.isArray(left);
    const rightComplex = isObject(right) || Array.isArray(right);
    if (leftComplex || rightComplex) {
      out.push({ path, op: "changed", left, right });
    } else {
      out.push({ path, op: "changed", left, right });
    }
  }
}

const OP_META: Record<DiffOp, { label: string; color: string; bg: string }> = {
  added: { label: "新增 (+)", color: "#1A8243", bg: "#E8F8EE" },
  removed: { label: "删除 (-)", color: "#E5484D", bg: "#FEECEC" },
  changed: { label: "修改 (~)", color: "#B54708", bg: "#FEF6E7" },
};

export default function Page() {
  const [leftText, setLeftText] = useState(
    `{"name":"FoxHelper","version":1,"tools":["md5","json","url"],"author":{"name":"Tencent","email":"a@b.com"}}`
  );
  const [rightText, setRightText] = useState(
    `{"name":"FoxHelper","version":2,"tools":["md5","json","yaml"],"author":{"name":"Tencent","email":"x@y.com"},"license":"MIT"}`
  );

  const { diffs, error } = useMemo(() => {
    const lp = parseJson(leftText);
    const rp = parseJson(rightText);
    if (!lp.ok) return { diffs: [] as DiffEntry[], error: `左侧 JSON 错误：${lp.error}` };
    if (!rp.ok) return { diffs: [] as DiffEntry[], error: `右侧 JSON 错误：${rp.error}` };
    const out: DiffEntry[] = [];
    deepDiff(lp.value, rp.value, "", out);
    return { diffs: out, error: "" };
  }, [leftText, rightText]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let changed = 0;
    diffs.forEach((d) => {
      if (d.op === "added") added += 1;
      else if (d.op === "removed") removed += 1;
      else changed += 1;
    });
    return { added, removed, changed };
  }, [diffs]);

  return (
    <ToolPageShell
      title="JSON diff"
      description="JSON diff工具用于比较两个JSON对象之间的差异...支持任意大小和结构的JSON对象，并提供易于理解的输出以进行快速处理"
    >
      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>JSON A（原始）</ToolLabel>
          <ToolTextarea
            value={leftText}
            onChange={setLeftText}
            placeholder="粘贴第一个 JSON 对象..."
            rows={12}
          />
        </ToolCard>
        <ToolCard>
          <ToolLabel>JSON B（对比）</ToolLabel>
          <ToolTextarea
            value={rightText}
            onChange={setRightText}
            placeholder="粘贴第二个 JSON 对象..."
            rows={12}
          />
        </ToolCard>
      </div>

      <ToolCard className="mt-[20px]">
        <div className="mb-[12px] flex flex-wrap items-center justify-between gap-[12px]">
          <ToolLabel>差异结果</ToolLabel>
          {error ? null : (
            <div className="flex gap-[16px] text-[13px]">
              <span className="text-[#1A8243]">新增 {stats.added}</span>
              <span className="text-[#E5484D]">删除 {stats.removed}</span>
              <span className="text-[#B54708]">修改 {stats.changed}</span>
            </div>
          )}
        </div>
        {error ? (
          <div className="rounded-[8px] bg-[#FEECEC] px-[16px] py-[12px] text-[14px] text-[#E5484D]">
            {error}
          </div>
        ) : diffs.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center rounded-[8px] border border-dashed border-[#E5E7EB] text-[14px] text-[#1A8243]">
            两个 JSON 完全相同，没有差异。
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {diffs.map((d, i) => {
              const meta = OP_META[d.op];
              return (
                <div
                  key={i}
                  className="rounded-[8px] border border-[#F6F7FA] px-[14px] py-[10px]"
                  style={{ backgroundColor: meta.bg }}
                >
                  <div className="mb-[6px] flex items-center gap-[10px]">
                    <span
                      className="rounded-[4px] px-[6px] py-[2px] text-[12px] font-medium"
                      style={{ color: meta.color, backgroundColor: "#ffffff" }}
                    >
                      {meta.label}
                    </span>
                    <span className="break-all font-mono text-[14px] text-[#242424]">
                      {d.path || "(root)"}
                    </span>
                  </div>
                  {d.op === "added" ? (
                    <p className="break-all font-mono text-[13px] text-[#1A8243]">
                      + {formatValue(d.right)}
                    </p>
                  ) : d.op === "removed" ? (
                    <p className="break-all font-mono text-[13px] text-[#E5484D]">
                      - {formatValue(d.left)}
                    </p>
                  ) : (
                    <div className="font-mono text-[13px]">
                      <p className="break-all text-[#E5484D]">- {formatValue(d.left)}</p>
                      <p className="break-all text-[#1A8243]">+ {formatValue(d.right)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
