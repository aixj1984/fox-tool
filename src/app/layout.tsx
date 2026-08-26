import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoxHelper 在线工具箱平台",
  description:
    "FoxHelper 是一个在线工具箱平台，提供图片工具、PDF转换工具、数据换算工具、生活娱乐工具、教育工具、文本工具、开发工具、视频工具等众多免费在线工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="antialiased">
      <body className="flex flex-col">{children}</body>
    </html>
  );
}
