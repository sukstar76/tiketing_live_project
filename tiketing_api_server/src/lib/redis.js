import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

export let redisClient;

export async function initializeRedis() {
  const redisPort =
    process.env.NODE_ENV === 'production' ? process.env.REDIS_PORT : 6379;

  const redisHost =
    process.env.NODE_ENV === 'production'
      ? process.env.REDIS_HOST
      : '127.0.0.1';

  redisClient = new IORedis({
    port: redisPort,
    host: redisHost,
  });
}
