import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
dotenv.config();

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

export function generateKafkaMessage({ key, value }) {
  return {
    key: key.toString(),
    value: JSON.stringify(value),
  };
}

export const KAFKA_SEAT_TOPIC = 'seat-topic';
