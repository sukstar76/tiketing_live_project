import { Kafka } from 'kafkajs';

export let kafkaProducer;

export async function runKafkaProducer() {
  const kafakHost =
    process.env.NODE_ENV === 'production'
      ? process.env.KAFKA_HOST
      : 'localhost:9093';
  const kafkaBrokers = [kafakHost];

  kafkaProducer = new Kafka({
    brokers: kafkaBrokers,
  }).producer();

  await kafkaProducer.connect();
}

export const KAFKA_LIVE_TOPIC = 'live-topic';
