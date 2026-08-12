'use server'

import redisClient from '~/server/redis/cache'

export const getCachedData = async (key: string) => {
  return await redisClient.getCachedData(key)
}

export const setCacheData = async (key: string, data: any, ttl?: number) => {
  return await redisClient.cacheData(key, data, ttl)
}
