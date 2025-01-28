/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { dnaClient } from "../dnaOrm";
import redisClient from "~/server/redis/cache";

import { cookies } from "next/headers";
import { TokenData } from "./types";
import { ulid } from "ulid";
import { colors } from "../utils/choychoy";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  token?: string;
}) => {
  const storeCookies = cookies();
  return {
    redisClient,
    dnaClient,
    transaction_id: ulid(),
    storeCookies,
    ...opts,
  };
};

/**
 *
 * @param timing
 * @returns
 */
function legend(timing: number): string {
  if (timing >= 10000) {
    return `${colors.red}${timing}ms${colors.reset}`;
  } else if (timing >= 3000) {
    return `${colors.yellow}${timing}ms${colors.reset}`;
  } else {
    return `${colors.green}${timing}ms${colors.reset}`;
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  // if (t._config.isDev) {
  //   // artificial delay in dev
  //   const waitMs = Math.floor(Math.random() * 400) + 100;
  //   await new Promise((resolve) => setTimeout(resolve, waitMs));
  // }

  const result = await next();

  const end = Date.now();
  const timing = end - start;
  console.info(
    `[${new Date().toISOString()}]-[TRPC] ${path} took ${legend(timing)} to execute`,
  );

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  const cookiesStore = cookies();
  const token = cookiesStore.get("token");

  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      ...ctx,
      token,
    },
  });
});
const verificationMiddleware = t.middleware(async ({ ctx, next, path }) => {
  const storeCookies = cookies();
  const token = storeCookies.get("token");

  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  /**
   *
   * @Verify Token
   *
   */
  const startTime = Date.now();
  const cachedSessionClient = ctx.redisClient;

  const cachedSession = await cachedSessionClient.getCachedData(token.value);
  const endTimeInit = Date.now();
  const timingInit = endTimeInit - startTime;
  console.info(
    `[${new Date().toISOString()}]-` + "[CacheSession Get]: ",
    legend(timingInit),
    "path: " + path,
  );
  if (cachedSession) {
    const endTime = Date.now();
    const timing = endTime - startTime;
    console.info(
      `[${new Date().toISOString()}]-` + "[TOKEN-CACHE-HIT]: ",
      legend(timing),
      "path: " + path,
    );
    return next({
      ctx: {
        ...ctx,
        token,
        session: cachedSession as TokenData,
      },
    });
  }

  const session = await ctx.dnaClient
    .verifyToken(token.value)
    .execute()
    .then((res) => {
      return res.data?.[0] as TokenData;
    })
    .catch(() => null);
  const endTime = Date.now();
  const timing = endTime - startTime;
  console.info(
    `[${new Date().toISOString()}]-` + "[TOKEN-CACHE-MISS]: ",
    legend(timing),
  );
  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  cachedSessionClient.cacheData(token.value, session, 50000);
  return next({
    ctx: {
      ...ctx,
      token,
      session,
    },
  });
});

/**
 * Private (authenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It guarantees
 * that a user querying is authorized and authenticated.
 */
export const privateProcedure = t.procedure
  .use(timingMiddleware)
  .use(verificationMiddleware);
