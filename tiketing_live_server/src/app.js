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
      //socket 고유 id 생성

      socket.on('message', (data) => {
        data = JSON.parse(data);

        if (data.message === 'subscription') {
          const itemId = data.itemId.toString(); // 사용자가 구독할 id

          if (!this.socketMap.has(itemId)) {
            this.socketMap.set(itemId, new Map());
          }

          socket.subscriptionId = itemId;
          this.socketMap.get(itemId).set(socket.id, socket);
          // 소켓들을 Map 으로 모아둔다

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
          }); // log 용
        }
      });

      socket.on('close', (socket) => {
        if (this.socketMap.has(socket.subscriptionId)) {
          // socket 연결 끊기면 map 에서 delete
          this.socketMap.get(socket.subscriptionId).delete(socket.id);

          if (this.socketMap.get(socket.subscriptionId).size === 0) {
            this.socketMap.delete(socket.subscriptionId);
          }
        }
      });
    });
  }

  onSubscribe() {
    // redis sub
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
        }); // log 용

        if (sockets) {
          for (const socket of sockets.values()) {
            // 구독한 모든 소켓에게 메세지 보내기
            socket.send(message);
          }
        }
      }
    });
  }
}
