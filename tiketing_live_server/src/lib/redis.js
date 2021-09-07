import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export let redisSubClient;

export async function initializeRedis() {
  redisSubClient = redis.createClient({
    port: process.env.NODE_ENV === 'production' ? process.env.REDIS_PORT : 6379,
    host:
      process.env.NODE_ENV === 'production'
        ? process.env.REDIS_HOST
        : '127.0.0.1',
  });

  redisSubClient.on('error', (err) => console.log(err));
  redisSubClient.psubscribe('channel:*');
}
