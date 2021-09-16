import { parentPort } from 'worker_threads';
import { redisSubClient, initializeRedis } from './redis.js';

initializeRedis();

redisSubClient.on('pmessage', (pattern, channel, message) => {
  if (pattern.startsWith('channel:')) {
    const subscriptionId = channel.substring(8);
    parentPort.postMessage({ subscriptionId, message });
  }
});
