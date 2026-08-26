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
  "通过这款工具，您可以轻松修改PDF文件的作者、主题、关键词、内容创作者等信息。无论是为了整理文档、提高搜索效率，还是为了保护隐私，修改PDF元数据工具都能满足您的需求。";

type Meta = {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
};

const EMPTY: Meta = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
  creationDate: "",
  modificationDate: "",
};

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<Meta>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [originName, setOriginName] = useState("metadata");

  const onFile = useCallback(async (f: File) => {
    setErr("");
    setDone(false);
    setFile(f);
    setOriginName(f.name.replace(/\.pdf$/i, "") || "metadata");
    try {
      const buf = await readFileAsArrayBuffer(f);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      const toISO = (d: Date | undefined) => (d ? d.toISOString() : "");
      setMeta({
        title: pdf.getTitle() || "",
        author: pdf.getAuthor() || "",
        subject: pdf.getSubject() || "",
        keywords: pdf.getKeywords() || "",
        creator: pdf.getCreator() || "",
        producer: pdf.getProducer() || "",
        creationDate: toISO(pdf.getCreationDate()),
        modificationDate: toISO(pdf.getModificationDate()),
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "解析失败");
    }
  }, []);

  const update = (k: keyof Meta, v: string) =>
    setMeta((m) => ({ ...m, [k]: v }));

  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setBusy(true);
    setDone(false);
    try {
      const buf = await readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      pdf.setTitle(meta.title);
      pdf.setAuthor(meta.author);
      pdf.setSubject(meta.subject);
      pdf.setKeywords(
        meta.keywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
      pdf.setCreator(meta.creator);
      pdf.setProducer(meta.producer);
      if (meta.creationDate) {
        const d = new Date(meta.creationDate);
        if (!Number.isNaN(d.getTime())) pdf.setCreationDate(d);
      }
      if (meta.modificationDate) {
        const d = new Date(meta.modificationDate);
        if (!Number.isNaN(d.getTime())) pdf.setModificationDate(d);
      }
      const bytes = await pdf.save();
      downloadBytes(bytes, `${originName}_元数据.pdf`);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "修改失败");
    } finally {
      setBusy(false);
    }
  }, [file, meta, originName]);

  const clearAll = useCallback(() => {
    setMeta({ ...EMPTY });
  }, []);

  const fields: { k: keyof Meta; label: string }[] = [
    { k: "title", label: "标题" },
    { k: "author", label: "作者" },
    { k: "subject", label: "主题" },
    { k: "keywords", label: "关键词（逗号分隔）" },
    { k: "creator", label: "创建者" },
    { k: "producer", label: "生成器" },
    { k: "creationDate", label: "创建时间 (ISO)" },
    { k: "modificationDate", label: "修改时间 (ISO)" },
  ];

  return (
    <ToolPageShell title="修改PDF元数据" description={DESCRIPTION}>
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
        {file && (
          <div className="mt-[20px] grid gap-[16px] md:grid-cols-2">
            {fields.map((f) => (
              <div key={f.k}>
                <ToolLabel>{f.label}</ToolLabel>
                <ToolInput
                  value={meta[f.k]}
                  onChange={(v) => update(f.k, v)}
                  placeholder={f.label}
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-[24px] flex gap-[10px]">
          <ToolButton onClick={run} disabled={!file || busy}>
            {busy ? "处理中…" : "保存并下载"}
          </ToolButton>
          <ToolButton variant="ghost" onClick={clearAll} disabled={!file}>
            清除元数据
          </ToolButton>
        </div>
        {err && <div className="mt-[12px] text-[13px] text-[#E5484D]">{err}</div>}
        {done && (
          <div className="mt-[12px] text-[13px] text-[#1B8A3F]">
            已更新元数据并开始下载。
          </div>
        )}
      </ToolCard>
    </ToolPageShell>
  );
}
