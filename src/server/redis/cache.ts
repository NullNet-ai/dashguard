import { redisClient } from "~/lib/redis";
const inMemoryCache: Record<string, { data: any; expiry: number }> = {};
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

// Fallback in-memory Redis client
const cacheData = async (key: string, data: any, ttl = 900000) => {
  if (redisClient) {
    await redisClient.setex(key, ttl, JSON.stringify(data));
  } else {
    // Store in memory if Redis is not connected
    inMemoryCache[key] = {
      data,
      expiry: Date.now() + ttl * 1000, // Store expiry timestamp
    };
    console.info(
      `${colors.yellow}[CACHING][Stored in Memory] ${key}${colors.reset}`,
    );
  }
};

const getCachedData = async (key: string) => {
  if (redisClient) {
    const res = await redisClient.get(key);
    return JSON.parse(res || "0");
  } else {
    // Retrieve from memory if Redis is not connected
    const cacheEntry = inMemoryCache[key];
    if (cacheEntry && cacheEntry.expiry > Date.now()) {
      return JSON.stringify(cacheEntry.data); // Return cached data
    }
    return null; // Cache miss
  }
};

export default {
  cacheData,
  getCachedData,
};
