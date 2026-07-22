import Redis from 'ioredis'
import { config } from './index'

export const redisClient = new Redis(config.redis.url, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

export async function connectRedis(): Promise<void> {
  await redisClient.connect()
  console.log('[auth-service] Redis connected')
}
