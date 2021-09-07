import { kafkaConsumer, runKafkaConsumer } from './lib/kafka.js';
import { initializeRedis, redisClient } from './lib/redis.js';

class App {
  async runApp() {
    initializeRedis();
    await runKafkaConsumer();
    this.runConsumer();
  }

  runConsumer() {
    kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const key = message.key.toString();
          const value = message.value.toString();
          const channel = `channel:${key}`;

          redisClient.publish(channel, value);
        } catch (e) {
          kafkaConsumer.pause([{ topic, partitions: [partition] }]);
          kafkaConsumer.resume([{ topic, partitions: [partition] }]);
        }
      },
    });
  }
}

new App().runApp();
