import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "connection-first";
const pagesBasePath = isStaticExport ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath,
  trailingSlash: isStaticExport,
  images: { unoptimized: isStaticExport },
  typescript: {
    tsconfigPath: isStaticExport ? "tsconfig.pages.json" : "tsconfig.json",
  },
};

export default nextConfig;
