"use client";

import { useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const PBKDF2_ITER = 100000;
const SALT_LEN = 16;
const IV_LEN = 12;

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64.replace(/\s+/g, ""));
  const buf = new ArrayBuffer(bin.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: BufferSource): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITER,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function doEncrypt(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext),
  );
  // Pack salt || iv || ciphertext into one base64 blob.
  const ctBytes = new Uint8Array(ct);
  const blob = new Uint8Array(salt.length + iv.length + ctBytes.length);
  blob.set(salt, 0);
  blob.set(iv, salt.length);
  blob.set(ctBytes, salt.length + iv.length);
  return bufToBase64(blob.buffer as ArrayBuffer);
}

async function doDecrypt(b64: string, passphrase: string): Promise<string> {
  const blob = base64ToBuf(b64);
  if (blob.length < SALT_LEN + IV_LEN + 1) {
    throw new Error("密文长度不足，可能已损坏");
  }
  const salt = blob.slice(0, SALT_LEN);
  const iv = blob.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const ct = blob.slice(SALT_LEN + IV_LEN);
  const key = await deriveKey(passphrase, salt);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}

const DESCRIPTION =
  "在线加解密是一款免费的、功能丰富的信息安全工具。在线加解密基于最新的加密和解密技术研制而成，支持目前市场上大多数主流密码算法。";

export default function Page() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [text, setText] = useState("");
  const [pass, setPass] = useState("");
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setErr("");
    setOutput("");
    if (!pass) {
      setErr("请输入密钥（口令）。");
      return;
    }
    if (!text) {
      setErr(mode === "encrypt" ? "请输入需要加密的文本。" : "请输入需要解密的密文。");
      return;
    }
    setBusy(true);
    try {
      if (mode === "encrypt") {
        setOutput(await doEncrypt(text, pass));
      } else {
        setOutput(await doDecrypt(text, pass));
      }
    } catch (e) {
      setErr((mode === "encrypt" ? "加密失败：" : "解密失败：") + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPageShell title="在线加解密" description={DESCRIPTION}>
      <div className="mb-[16px] flex flex-wrap items-center gap-[10px]">
        <button
          type="button"
          onClick={() => {
            setMode("encrypt");
            setOutput("");
            setErr("");
          }}
          className={`h-[40px] cursor-pointer rounded-[8px] px-[20px] text-[14px] font-medium transition-colors ${
            mode === "encrypt"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          加密
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("decrypt");
            setOutput("");
            setErr("");
          }}
          className={`h-[40px] cursor-pointer rounded-[8px] px-[20px] text-[14px] font-medium transition-colors ${
            mode === "decrypt"
              ? "bg-[#136CE9] text-white"
              : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]"
          }`}
        >
          解密
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <div className="mb-[16px]">
            <ToolLabel>密钥（口令）</ToolLabel>
            <ToolInput
              value={pass}
              onChange={setPass}
              type="password"
              placeholder="请输入加密 / 解密使用的密钥"
              className="w-full"
            />
          </div>
          <ToolLabel>
            {mode === "encrypt" ? "明文" : "密文（Base64）"}
          </ToolLabel>
          <ToolTextarea
            value={text}
            onChange={setText}
            placeholder={
              mode === "encrypt"
                ? "请输入需要加密的文本"
                : "请粘贴需要解密的 Base64 密文"
            }
            rows={10}
          />
          <div className="mt-[12px] flex gap-[10px]">
            <ToolButton onClick={run} disabled={busy}>
              {busy ? "处理中…" : mode === "encrypt" ? "加密" : "解密"}
            </ToolButton>
            <ToolButton
              variant="ghost"
              onClick={() => {
                setText("");
                setOutput("");
                setErr("");
              }}
            >
              清空
            </ToolButton>
          </div>
          <p className="mt-[10px] text-[13px] text-[#8F8F8F]">
            使用 AES-256-GCM 算法，通过 PBKDF2(SHA-256, 10万次) 从口令派生密钥，IV 随机生成并内嵌于密文。
          </p>
        </ToolCard>

        <ToolCard>
          <div className="mb-[6px] flex items-center justify-between">
            <ToolLabel>
              {mode === "encrypt" ? "密文（Base64）" : "解密结果"}
            </ToolLabel>
            <CopyButton text={output} label="复制结果" />
          </div>
          <ToolTextarea
            value={output}
            onChange={() => undefined}
            placeholder="结果将显示在这里"
            rows={10}
            className="bg-[#F9FAFB]"
          />
          {err ? (
            <p className="mt-[10px] text-[13px] text-[#E5484D]">{err}</p>
          ) : null}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
