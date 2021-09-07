import { Kafka } from 'kafkajs';

const kafkaTopics = {
  SEAT_TOPIC: 'seat-topic',
};

export let kafkaConsumer;

export async function runKafkaConsumer() {
  const kafkaBrokers = [
    process.env.NODE_ENV === 'production'
      ? process.env.KAFKA_HOST
      : '127.0.0.1:9092',
  ];

  kafkaConsumer = new Kafka({
    brokers: kafkaBrokers,
  }).consumer({ groupId: 'seat-group' });

  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({ topic: kafkaTopics.SEAT_TOPIC });
}
