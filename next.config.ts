import type { NextConfig } from "next";

// For GitHub Pages deployment under https://<user>.github.io/<repo>/
// we need: output: 'export' (static HTML), an assetPrefix/basePath that points
// to the repo subpath, and images.unoptimized (since Pages has no image optimizer).
// The basePath is read from GITHUB_REPOSITORY (set automatically by GitHub Actions).
// We also expose it as NEXT_PUBLIC_BASE_PATH so client/runtime code (e.g. the
// imgSrc helper in src/lib/img-path.ts) can prefix image URLs the same way.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath = repo ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
