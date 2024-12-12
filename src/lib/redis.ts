// lib/redis.ts
import Redis from "ioredis";

const {
  REDIS_CACHE_ENDPOINT = "localhost",
  REDIS_CACHE_INDEX = 1,
  REDIS_CACHE_PORT = 6379,
} = process.env;

// PACHOYCHOY
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

const globalForRedis = global as unknown as { redis: Redis };

// In-memory cache

export let redisClient: Redis | null = null;

redisClient =
  globalForRedis.redis ||
  new Redis({
    port: +REDIS_CACHE_PORT || 6379,
    host: REDIS_CACHE_ENDPOINT || "localhost",
    db: +(REDIS_CACHE_INDEX ?? "9"),
  });

if (redisClient) {
  redisClient.on("error", (e: Error) => {
    console.error("@Redis Error", e);

    if (!redisClient) {
      return;
    }
    // console.info(
    //   `${colors.red}[CACHING][Redis Client Disconnected] ${JSON.stringify(e)} ${colors.reset}`,
    // );
    redisClient = null;
  });

  redisClient.on("connect", () => {
    console.info(`${colors.green}[CACHING][Redis Connected] ${colors.reset}`);
    redisClient = redisClient;
  });
}

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redisClient;
