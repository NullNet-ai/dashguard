/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
console.table({
  REDIS_CACHE_ENDPOINT: process.env.REDIS_CACHE_ENDPOINT,
  REDIS_CACHE_PORT: process.env.REDIS_CACHE_PORT,
  STORE_URL: process.env.STORE_URL,
  NODE_ENV: process.env.NODE_ENV,
  DEBUG: process.env.DEBUG,
  MOCK_DATABASE: process.env.MOCK_DATABASE,
});

/** @type {import("next").NextConfig} */
const config = {
  env: {
    NEXT_NODE_ENV: process.env.NODE_ENV,
  },
  reactStrictMode: false,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tailwindui.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "files.gorentals.dnamicro.net",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default config;
