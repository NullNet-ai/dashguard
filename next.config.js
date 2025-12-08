/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

console.log('PORTAL CONFIGURATION')
console.table({
  NODE_ENV: process.env.NODE_ENV,
  REDIS_URL: process.env.REDIS_URL,
});

console.log('API CONFIGURATION')
console.table({
  TIMELINE_API_URL: process.env.TIMELINE_API_URL,
  PLACES_API_URL: process.env.PLACES_API_URL,
  SOCKET_API_URL: process.env.SOCKET_API_URL,
})

console.log('STORE CONFIGURATION')
console.table({
  STORE_URL: process.env.STORE_URL,
  OPERATION_TIMEOUT: process.env.OPERATION_TIMEOUT,
  ENABLE_TRANSFORMER: process.env.ENABLE_TRANSFORMER,
  DEBUG: process.env.DEBUG,
})


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
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallback for Node.js modules that can't run in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        http: false,
        https: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        querystring: false,
        worker_threads: false,
        util: false,
        url: false,
        buffer: false,
        events: false,
        assert: false,
        constants: false,
        module: false,
        punycode: false,
        zlib: false,
      };
    }
    return config;
  },
};

export default config;
