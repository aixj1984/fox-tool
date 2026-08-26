"use client";

import { useCallback, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";
import { downloadBytes, readFileAsArrayBuffer } from "../_pdf_lib/pdfClient";

const DESCRIPTION =
  "PDF加解密是一款功能强大的在线工具，专为为PDF文件添加或移除密码保护而设计。";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("decrypted");

  const onFile = useCallback((f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "decrypted");
  }, []);

  const decrypt = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      // pdf-lib cannot decrypt user-password-protected PDFs. With
      // ignoreEncryption it can open owner-password-restricted PDFs and
      // re-save them without the restriction.
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      const bytes = await pdf.save();
      downloadBytes(bytes, `${originName}_解密.pdf`);
      setDone(true);
    } catch (e) {
      setErr(
        e instanceof Error
          ? `处理失败：${e.message}（pdf-lib 无法解密需要打开密码的 PDF）`
          : "处理失败",
      );
    } finally {
      setBusy(false);
    }
  }, [file, originName]);

  return (
    <ToolPageShell title="PDF加解密" description={DESCRIPTION}>
      <ToolCard>
        <ToolLabel>选择 PDF 文件</ToolLabel>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
          className="block w-full text-[14px] text-[#242424] file:mr-[12px] file:h-[40px] file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[#136CE9] file:px-[16px] file:text-[14px] file:font-medium file:text-white hover:file:bg-[#0f5fc4]"
        />
        <div className="mt-[20px] max-w-[420px]">
          <ToolLabel>PDF 密码</ToolLabel>
          <ToolInput
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="输入当前 PDF 的密码"
          />
        </div>
        <div className="mt-[12px] rounded-[8px] bg-[#FFF8E6] p-[12px] text-[13px] leading-[20px] text-[#8A6D3B]">
          说明：纯前端环境下 pdf-lib 不支持写入加密 PDF，因此本工具仅提供
          <strong> 移除权限限制（解密）</strong>。对于仅有所有者密码（限制权限）的 PDF
          可直接去除限制并下载无限制版本；对于需要打开密码才能查看的 PDF，pdf-lib
          无法在前端解密，请先在本地移除打开密码后再使用。
        </div>
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={decrypt} disabled={!file || busy}>
            {busy ? "处理中…" : "移除限制并下载"}
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已移除密码保护并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
