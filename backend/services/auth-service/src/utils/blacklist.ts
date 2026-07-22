import { redisClient } from '../config/redis'

const BLACKLIST_PREFIX = 'blacklist:'

export async function blacklistToken(token: string, expirySeconds: number): Promise<void> {
  await redisClient.set(`${BLACKLIST_PREFIX}${token}`, '1', 'EX', expirySeconds)
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const result = await redisClient.get(`${BLACKLIST_PREFIX}${token}`)
  return result !== null
}
