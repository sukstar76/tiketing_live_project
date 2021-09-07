import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export let redisClient;

export function initializeRedis() {
  redisClient = redis.createClient({
    port: process.env.NODE_ENV === 'production' ? process.env.REDIS_PORT : 6379,
    host:
      process.env.NODE_ENV === 'production'
        ? process.env.REDIS_HOST
        : '127.0.0.1',
  });
}
