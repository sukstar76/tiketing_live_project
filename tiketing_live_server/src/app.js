import WebSocket from 'ws';
import { redisSubClient } from './lib/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { kafkaProducer, KAFKA_LIVE_TOPIC } from './lib/kafka.js';

export default class App {
  app;
  options;
  socketMap;

  constructor() {
    this.options = {
      port: process.env.PORT | 5000,
    };
    this.socketMap = new Map();
    this.app = new WebSocket.Server(this.options);
    this.onSocket();
    this.onSubscribe();
  }

  onSocket() {
    this.app.on('connection', (socket) => {
      socket.id = uuidv4();

      socket.on('message', (data) => {
        data = JSON.parse(data);

        if (data.message === 'subscription') {
          const itemId = data.itemId.toString();

          if (!this.socketMap.has(itemId)) {
            this.socketMap.set(itemId, new Map());
          }

          socket.subscriptionId = itemId;
          this.socketMap.get(itemId).set(socket.id, socket);

          kafkaProducer.send({
            topic: KAFKA_LIVE_TOPIC,
            messages: [
              {
                key: 'subscription',
                value: JSON.stringify({
                  itemId,
                  size: this.socketMap.get(itemId).size,
                }),
              },
            ],
          });
        }
      });

      socket.on('close', (socket) => {
        if (this.socketMap.has(socket.subscriptionId)) {
          this.socketMap.get(socket.subscriptionId).delete(socket.id);

          if (this.socketMap.get(socket.subscriptionId).size === 0) {
            this.socketMap.delete(socket.subscriptionId);
          }
        }
      });
    });
  }

  onSubscribe() {
    redisSubClient.on('pmessage', (pattern, channel, message) => {
      if (pattern.startsWith('channel:')) {
        const subscriptionId = channel.substring(8);
        const sockets = this.socketMap.get(subscriptionId);

        kafkaProducer.send({
          topic: KAFKA_LIVE_TOPIC,
          messages: [
            {
              key: 'send',
              value: JSON.stringify({
                itemId: subscriptionId,
                size: sockets.size,
                message: message,
              }),
            },
          ],
        });

        if (sockets) {
          for (const socket of sockets.values()) {
            socket.send(message);
          }
        }
      }
    });
  }
}
