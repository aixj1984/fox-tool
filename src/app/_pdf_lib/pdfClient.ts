// Shared client-side helpers for PDF tool pages.
// pdfjs-dist is ESM-only; load it dynamically inside event handlers/effects.
// We use the CDN worker URL string for reliable bundling in Next.js.

import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/types/src/display/api";

export type PdfjsLib = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let cachedLib: PdfjsLib | null = null;

export async function loadPdfjs(): Promise<PdfjsLib> {
  if (cachedLib) return cachedLib;
  const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Use the CDN worker URL string — reliable across bundlers.
  lib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs";
  cachedLib = lib;
  return lib;
}

export async function loadPdfDoc(
  data: ArrayBuffer,
): Promise<PDFDocumentProxy> {
  const lib = await loadPdfjs();
  // pdf.js requires a fresh copy of the bytes (it detaches the buffer).
  const bytes = new Uint8Array(data.slice(0));
  return lib.getDocument({ data: bytes }).promise;
}

export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale = 2,
): Promise<void> {
  const viewport = page.getViewport({ scale });
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  // Reset transform before rendering.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
}

export async function renderPageToDataURL(
  page: PDFPageProxy,
  scale = 2,
): Promise<string> {
  const canvas = document.createElement("canvas");
  await renderPageToCanvas(page, canvas, scale);
  return canvas.toDataURL("image/png");
}

export async function renderPageToBytes(
  page: PDFPageProxy,
  scale = 2,
): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  await renderPageToCanvas(page, canvas, scale);
  const url = canvas.toDataURL("image/png");
  const resp = await fetch(url);
  const ab = await resp.arrayBuffer();
  return new Uint8Array(ab);
}

export function downloadBytes(
  bytes: Uint8Array | ArrayBuffer,
  filename: string,
  mime = "application/pdf",
): void {
  const blob = new Blob([bytes as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

// Parse a page-range expression like "1-3, 5, 8-10" into 0-based indices.
// Returns null on invalid input.
export function parsePageRanges(
  expr: string,
  pageCount: number,
): number[] | null {
  if (!expr.trim()) return null;
  const out: number[] = [];
  const parts = expr.split(",");
  for (const part of parts) {
    const seg = part.trim();
    if (!seg) continue;
    if (seg.includes("-")) {
      const [aStr, bStr] = seg.split("-");
      if (!aStr || !bStr) return null;
      const a = parseInt(aStr, 10);
      const b = parseInt(bStr, 10);
      if (Number.isNaN(a) || Number.isNaN(b)) return null;
      if (a < 1 || b > pageCount || a > b) return null;
      for (let i = a; i <= b; i++) out.push(i - 1);
    } else {
      const n = parseInt(seg, 10);
      if (Number.isNaN(n)) return null;
      if (n < 1 || n > pageCount) return null;
      out.push(n - 1);
    }
  }
  if (out.length === 0) return null;
  // Deduplicate preserving order.
  return Array.from(new Set(out));
}

export type PageThumb = {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
};
