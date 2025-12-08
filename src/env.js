import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["local", "development", "test", "production"]),
    WG_SERVER_IP: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_ROOM: z.string().optional(),
    NEXT_PUBLIC_SOCKET_URL: z.string().optional(),
    NEXT_PUBLIC_SOCKET_USERNAME: z.string().optional(),
    NEXT_PUBLIC_SOCKET_PASSWORD: z.string().optional(),
    NEXT_PUBLIC_ORIGIN_WEBSITE_URL: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ROOM: process.env.NEXT_PUBLIC_ROOM,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_SOCKET_USERNAME: process.env.NEXT_PUBLIC_SOCKET_USERNAME,
    NEXT_PUBLIC_SOCKET_PASSWORD: process.env.NEXT_PUBLIC_SOCKET_PASSWORD,
    NEXT_PUBLIC_ORIGIN_WEBSITE_URL: process.env.NEXT_PUBLIC_ORIGIN_WEBSITE_URL,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
    WG_SERVER_IP: process.env.WG_SERVER_IP,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
