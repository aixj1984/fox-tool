"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  ToolPageShell,
  ToolCard,
  ToolButton,
  ToolInput,
  ToolLabel,
  CopyButton,
} from "@/components/sites/tool-browser-qq-com/shared/ToolPageShell";

const DESCRIPTION =
  "二维码名片工具可以帮助您将个人或企业的名片信息生成二维码，便于快速分享和扫描。";

interface VCard {
  name: string;
  title: string;
  org: string;
  tel: string;
  email: string;
  url: string;
  address: string;
}

function buildVCard(v: VCard): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  if (v.name) lines.push(`FN:${v.name}`);
  // N: family;given;additional;prefix;suffix — best-effort split on first space.
  if (v.name) {
    const idx = v.name.trim().indexOf(" ");
    if (idx > 0) {
      lines.push(
        `N:${v.name.slice(idx + 1)};${v.name.slice(0, idx)};;;`,
      );
    } else {
      lines.push(`N:${v.name};;;;`);
    }
  }
  if (v.title) lines.push(`TITLE:${v.title}`);
  if (v.org) lines.push(`ORG:${v.org}`);
  if (v.tel) lines.push(`TEL;TYPE=CELL:${v.tel}`);
  if (v.email) lines.push(`EMAIL:${v.email}`);
  if (v.url) lines.push(`URL:${v.url}`);
  if (v.address) lines.push(`ADR:;;${v.address};;;;`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export default function Page() {
  const [card, setCard] = useState<VCard>({
    name: "张三",
    title: "产品经理",
    org: "示例科技有限公司",
    tel: "13800138000",
    email: "zhangsan@example.com",
    url: "https://example.com",
    address: "北京市朝阳区示例路1号",
  });
  const [dataUrl, setDataUrl] = useState("");
  const [err, setErr] = useState("");

  const vcard = buildVCard(card);

  useEffect(() => {
    if (!card.name && !card.tel && !card.email) {
      setDataUrl("");
      setErr("");
      return;
    }
    QRCode.toDataURL(vcard, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then((url) => {
        setDataUrl(url);
        setErr("");
      })
      .catch((e: unknown) => {
        setErr(e instanceof Error ? e.message : String(e));
        setDataUrl("");
      });
  }, [vcard, card.name, card.tel, card.email]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "vcard-qrcode.png";
    a.click();
  };

  const update = (key: keyof VCard) => (v: string) =>
    setCard((c) => ({ ...c, [key]: v }));

  return (
    <ToolPageShell title="二维码名片" description={DESCRIPTION}>
      <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        <ToolCard>
          <ToolLabel>名片信息</ToolLabel>
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
            <Field label="姓名" value={card.name} onChange={update("name")} />
            <Field label="职位" value={card.title} onChange={update("title")} />
            <Field label="公司" value={card.org} onChange={update("org")} />
            <Field label="电话" value={card.tel} onChange={update("tel")} />
            <Field label="邮箱" value={card.email} onChange={update("email")} />
            <Field label="网址" value={card.url} onChange={update("url")} />
            <div className="sm:col-span-2">
              <ToolLabel>地址</ToolLabel>
              <ToolInput
                value={card.address}
                onChange={update("address")}
                placeholder="街道地址"
                className="w-full"
              />
            </div>
          </div>
        </ToolCard>

        <ToolCard>
          <ToolLabel>二维码预览</ToolLabel>
          <div className="flex flex-col items-center gap-[16px]">
            <div className="rounded-[8px] border border-[#E5E7EB] p-[12px]">
              {dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dataUrl} alt="vCard QR" width={280} height={280} />
              ) : (
                <div className="flex h-[280px] w-[280px] items-center justify-center text-[14px] text-[#8F8F8F]">
                  {err ? "生成失败" : "请填写名片信息"}
                </div>
              )}
            </div>
            <ToolButton onClick={download} disabled={!dataUrl}>
              下载 PNG
            </ToolButton>
          </div>

          <div className="mt-[20px]">
            <div className="mb-[6px] flex items-center justify-between">
              <ToolLabel>vCard 文本</ToolLabel>
              <CopyButton text={vcard} label="复制 vCard" />
            </div>
            <pre className="max-h-[180px] overflow-auto whitespace-pre-wrap rounded-[8px] bg-[#F6F7FA] p-[12px] font-mono text-[12px] leading-[18px] text-[#242424]">
              {vcard}
            </pre>
          </div>
        </ToolCard>
      </div>
    </ToolPageShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <ToolLabel>{label}</ToolLabel>
      <ToolInput value={value} onChange={onChange} />
    </div>
  );
}
