import App from './app.js';
import { runKafkaProducer } from './lib/kafka.js';
import { initializeRedis } from './lib/redis.js';

async function runServer() {
  await initializeRedis();
  await runKafkaProducer();
  const app = new App();
}

runServer();
