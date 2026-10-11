import type { NextConfig } from "next";

const cssModule = /\.module\.css$/;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Run every stylesheet through Tailwind, but keep *.module.css files as CSS modules;
      // a single `as: "*.css"` rule would turn them into global CSS with no class names.
      "*.css": [
        {
          condition: { path: cssModule },
          loaders: ["@tailwindcss/turbopack"],
          as: "*.module.css",
        },
        {
          condition: { not: { path: cssModule } },
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      ],
    },
  },
};

export default nextConfig;
