import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships WASM + data files; keep it out of the server bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  experimental: {
    // Logos now; site photos in Stage 3 are shrunk on the phone first, so 5MB is plenty.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
