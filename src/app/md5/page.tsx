"use client";

import { useMemo, useState } from "react";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolTextarea,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

// MD5 implementation (RFC 1321), adapted from blueimp/JavaScript-MD5 (MIT).
// Operates on UTF-8 bytes and returns a 32-char lowercase hex digest.

const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const MD5_K = [
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
  0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
  0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
  0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
  0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
  0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
  0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
  0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
  0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
];

function safeAdd(x: number, y: number): number {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

function bitRol(num: number, cnt: number): number {
  return (num << cnt) | (num >>> (32 - cnt));
}

function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const len = bytes.length * 8;

  // Compute padded length (multiple of 64 bytes, with 0x80 + zeros + 8-byte length).
  let paddedLen = bytes.length + 1;
  while (paddedLen % 64 !== 56) paddedLen++;
  paddedLen += 8;

  const x: number[] = new Array(paddedLen / 4).fill(0);
  for (let i = 0; i < bytes.length; i++) {
    x[i >> 2] |= (bytes[i] & 0xff) << ((i % 4) * 8);
  }
  x[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  // Low 32 bits of bit length at word 14 of the last block (little-endian).
  x[paddedLen / 4 - 2] = len;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;

    for (let j = 0; j < 64; j++) {
      let f: number;
      let g: number;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }
      const tmp = d;
      d = c;
      c = b;
      b = safeAdd(
        b,
        bitRol(safeAdd(safeAdd(safeAdd(a, f), MD5_K[j]), x[i + g]), MD5_S[j]),
      );
      a = tmp;
    }

    a = safeAdd(a, oa);
    b = safeAdd(b, ob);
    c = safeAdd(c, oc);
    d = safeAdd(d, od);
  }

  const toHex = (n: number): string => {
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return s;
  };
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

const DESCRIPTION =
  "MD5加密工具是一款安全高效的密码强度评估工具，可以方便地用于各种在线活动和应用程序中。它基于流行的 MD5 算法，是一款安全、可靠、易用的密码强度评估工具，可帮助用户有效地保护敏感信息和隐私。";

export default function Page() {
  const [input, setInput] = useState("");

  const output = useMemo(() => (input ? md5(input) : ""), [input]);

  return (
    <ToolPageShell title="md5加密" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>输入文本</ToolLabel>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="请输入需要 MD5 加密的文本"
            rows={10}
          />
          <button
            type="button"
            onClick={() => setInput("")}
            className="mt-[10px] inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[8px] bg-[#F6F7FA] px-[16px] text-[13px] font-medium text-[#242424] hover:bg-[#ebedf2]"
          >
            清空
          </button>
        </ToolCard>

        <ToolCard>
          <div className="mb-[6px] flex items-center justify-between">
            <ToolLabel>MD5 结果（32位小写）</ToolLabel>
            <CopyButton text={output} label="复制结果" />
          </div>
          <ToolTextarea
            value={output}
            onChange={() => undefined}
            placeholder="MD5 哈希值将显示在这里"
            rows={10}
            className="bg-[#F9FAFB]"
          />
          {output ? (
            <p className="mt-[10px] break-all text-[13px] text-[#8F8F8F]">
              {output}
            </p>
          ) : (
            <p className="mt-[10px] text-[13px] text-[#8F8F8F]">
              输入文本后将实时计算 MD5 哈希值。
            </p>
          )}
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}
