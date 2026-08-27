"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LeftNav, LeftNavPlaceholder } from "./LeftNav";
import { FloatingNav } from "./FloatingNav";
import { Footer } from "./Footer";

// Shared shell for every tool page: fixed sidebar + content area + footer + floating nav.
// Mirrors the portal layout so tool pages feel like the original site.
// 1140px content is centered within the remaining viewport (sidebar takes 240px),
// matching the source site's `margin: 0 auto` on `<main>`.
export function ToolPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex bg-white">
      <LeftNav activeHref="/" />
      <LeftNavPlaceholder />
      <FloatingNav />
      <main className="relative w-full min-w-[1140px] flex-1">
        <div className="mx-auto w-[1140px] px-0 py-[30px]">
          {/* breadcrumb / back */}
          <div className="mb-[20px] flex items-center gap-2 text-[14px] text-[#8F8F8F]">
            <Link href="/" className="text-[#136CE9] no-underline hover:underline">
              FoxHelper
            </Link>
            <span>/</span>
            <span className="text-[#242424]">{title}</span>
          </div>
          <h1 className="mb-[8px] text-[24px] font-semibold text-[#242424]">
            {title}
          </h1>
          {description ? (
            <p className="mb-[24px] max-w-[900px] text-[14px] leading-[22px] text-[#8F8F8F]">
              {description}
            </p>
          ) : null}
          <div className="min-h-[400px]">{children}</div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

// Small reusable styled building blocks used across tool pages.
export function ToolCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[10px] border border-[#F6F7FA] bg-white p-[24px] shadow-[0_0_10px_0_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function ToolButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[8px] px-[20px] text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-[#136CE9] text-white hover:bg-[#0f5fc4]"
      : "bg-[#F6F7FA] text-[#242424] hover:bg-[#ebedf2]";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function ToolTextarea({
  value,
  onChange,
  placeholder,
  rows = 8,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full resize-y rounded-[8px] border border-[#E5E7EB] bg-white p-[12px] font-mono text-[14px] leading-[22px] text-[#242424] outline-none focus:border-[#136CE9] ${className}`}
    />
  );
}

export function ToolInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] text-[#242424] outline-none focus:border-[#136CE9] ${className}`}
    />
  );
}

export function ToolLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-[6px] block text-[14px] font-medium text-[#242424]">
      {children}
    </label>
  );
}

export function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  return (
    <ToolButton
      variant="ghost"
      onClick={() => {
        if (text) void navigator.clipboard?.writeText(text);
      }}
    >
      {label}
    </ToolButton>
  );
}
