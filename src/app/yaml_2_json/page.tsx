"use client";

import { useMemo, useState } from "react";
import { load as yamlLoad, dump as yamlDump } from "js-yaml";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

type Mode = "yaml2json" | "json2yaml";

function convertYamlToJson(raw: string): { ok: true; out: string } | { ok: false; err: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, err: "请输入 YAML 文本。" };
  try {
    const parsed = yamlLoad(raw);
    return { ok: true, out: JSON.stringify(parsed, null, 2) };
  } catch (e) {
    return { ok: false, err: e instanceof Error ? e.message : String(e) };
  }
}

function convertJsonToYaml(raw: string): { ok: true; out: string } | { ok: false; err: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, err: "请输入 JSON 文本。" };
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return { ok: true, out: yamlDump(parsed, { indent: 2, lineWidth: 120 }) };
  } catch (e) {
    return { ok: false, err: e instanceof Error ? e.message : String(e) };
  }
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("yaml2json");
  const [input, setInput] = useState("name: FoxHelper\nversion: 1\ntools:\n  - md5\n  - json\n  - yaml\nauthor:\n  name: Tencent\n");
  const [output, setOutput] = useState("");

  const { result, error } = useMemo(() => {
    if (input.trim() === "") return { result: "", error: "" };
    const res = mode === "yaml2json" ? convertYamlToJson(input) : convertJsonToYaml(input);
    if (res.ok) return { result: res.out, error: "" };
    return { result: "", error: res.err };
  }, [input, mode]);

  const handleSwap = () => {
    const newMode: Mode = mode === "yaml2json" ? "json2yaml" : "yaml2json";
    setMode(newMode);
    // Carry the output back into the input when there's a valid conversion.
    if (result) {
      setInput(result);
      setOutput("");
    }
  };

  const inputLabel = mode === "yaml2json" ? "YAML 输入" : "JSON 输入";
  const outputLabel = mode === "yaml2json" ? "JSON 输出" : "YAML 输出";
  const inputPlaceholder = mode === "yaml2json" ? "key: value\nlist:\n  - a\n  - b" : '{"key": "value", "list": ["a", "b"]}';
  const shown = output || result;

  return (
    <ToolPageShell
      title="YAML/JSON互相转换"
      description="YAML/JSON互相转换是一款易于使用的在线工具，将YAML格式的文件转换为JSON格式...可以轻松实现JSON与YAML数据转化"
    >
      <div className="mb-[16px] flex flex-wrap items-center gap-[10px]">
        <button
          type="button"
          onClick={() => {
            setMode("yaml2json");
            setOutput("");
          }}
          className={`rounded-[8px] px-[18px] py-[8px] text-[14px] font-medium ${
            mode === "yaml2json"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          YAML → JSON
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("json2yaml");
            setOutput("");
          }}
          className={`rounded-[8px] px-[18px] py-[8px] text-[14px] font-medium ${
            mode === "json2yaml"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          JSON → YAML
        </button>
        <ToolButton variant="ghost" onClick={handleSwap}>
          交换输入/输出
        </ToolButton>
      </div>

      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>{inputLabel}</ToolLabel>
          <ToolTextarea
            value={input}
            onChange={(v) => {
              setInput(v);
              setOutput("");
            }}
            placeholder={inputPlaceholder}
            rows={14}
          />
          {error ? (
            <p className="mt-[10px] text-[14px] text-[#E5484D]">{error}</p>
          ) : (
            <p className="mt-[10px] text-[14px] text-[#8F8F8F]">
              {mode === "yaml2json"
                ? "输入 YAML，实时转换为格式化 JSON。"
                : "输入 JSON，实时转换为 YAML。"}
            </p>
          )}
        </ToolCard>

        <ToolCard>
          <div className="mb-[6px] flex items-center justify-between">
            <ToolLabel>{outputLabel}</ToolLabel>
            <CopyButton text={shown} label="复制结果" />
          </div>
          <ToolTextarea
            value={shown}
            onChange={() => undefined}
            placeholder={`${outputLabel}将显示在这里...`}
            rows={14}
            className="bg-[#F9FAFB]"
          />
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
