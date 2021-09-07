import { SeatController } from './api/seats/seat-controller.js';
import App from './app.js';
import { initializeDatabase } from './lib/database.js';
import { runKafkaProducer } from './lib/kafka.js';
import { initializeRedis } from './lib/redis.js';
import http, { Agent } from 'http';

async function runServer() {
  //await initializeDatabase(':memory:');
  await runKafkaProducer();
  await initializeRedis();

  const controllers = [new SeatController()];
  const app = new App(controllers);
  const agentOptions = {
    keepAlive: true,
  };
  http.globalAgent = new Agent(agentOptions);

  app.listen();
}

runServer();
