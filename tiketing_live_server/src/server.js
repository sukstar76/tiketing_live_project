import App from './app.js';
import { runKafkaProducer } from './lib/kafka.js';

async function runServer() {
  //await runKafkaProducer();
  const app = new App();
}

runServer();
