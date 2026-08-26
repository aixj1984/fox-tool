// Prefix a public-folder image path with the configured basePath.
//
// Next.js 16 docs: "When using the next/image component with basePath, you must
// manually include the basePath in the src attribute."
// We read basePath from NEXT_PUBLIC_BASE_PATH, which next.config.ts sets from
// GITHUB_REPOSITORY (set automatically by GitHub Actions). In local `next dev`,
// the env var is empty and paths pass through unchanged.
//
// Use this for any <Image> whose src points into /public (e.g. "/sites/...").
// Don't use it for <Link href> — next/link handles basePath on its own.

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function imgSrc(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${basePath}${path}`;
}
