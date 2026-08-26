import type { NextConfig } from "next";

// For GitHub Pages deployment under https://<user>.github.io/<repo>/
// we need: output: 'export' (static HTML), an assetPrefix/basePath that points
// to the repo subpath, and images.unoptimized (since Pages has no image optimizer).
// The basePath is read from a env var so local `next dev` isn't affected.
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
};

export default nextConfig;
