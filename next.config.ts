import type { NextConfig } from "next";

const repoName = process.env.REPO_NAME;

const nextConfig: NextConfig = {
  output: "export",
  basePath: repoName ? `/${repoName}` : undefined,
  assetPrefix: repoName ? `/${repoName}/` : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
