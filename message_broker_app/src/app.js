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
        // 메세지 당
        try {
          const key = message.key.toString();
          const value = message.value.toString();
          const channel = `channel:${key}`;

          redisClient.publish(channel, value);
          // 채널 구독자들에게 퍼블리시
          // 채널 구독자들은 live-server
        } catch (e) {
          kafkaConsumer.pause([{ topic, partitions: [partition] }]);
          kafkaConsumer.resume([{ topic, partitions: [partition] }]);
          // 에러일경우 메세지 버리기
        }
      },
    });
  }
}

new App().runApp();
