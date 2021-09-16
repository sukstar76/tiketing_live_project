import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Worker } from 'worker_threads';
import { kafkaProducer, KAFKA_LIVE_TOPIC } from './lib/kafka.js';

export default class App {
  app;
  options;
  socketMap;
  worker;

  constructor() {
    this.options = {
      port: process.env.PORT | 5000,
    };
    this.app = new WebSocket.Server(this.options);
    this.socketMap = new Map();
    this.worker = new Worker('./dist/lib/worker.js');

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

          if (!this.socketMap.get(itemId)) {
            this.socketMap.set(itemId, new Map());
          }

          socket.subscriptionId = itemId;
          this.socketMap.get(itemId).set(socket.id, socket);
          // 소켓들을 Map 으로 모아둔다

          // kafkaProducer.send({
          //   topic: KAFKA_LIVE_TOPIC,
          //   messages: [
          //     {
          //       key: 'subscription',
          //       value: JSON.stringify({
          //         itemId,
          //         size: this.socketMap.get(itemId).size,
          //       }),
          //     },
          //   ],
          // }); // log 용
        }
      });

      socket.on('close', (code) => {
        if (this.socketMap.get(socket.subscriptionId)) {
          // socket 연결 끊기면 Map 에서 delete
          this.socketMap.get(socket.subscriptionId).delete(socket.id);

          if (this.socketMap.get(socket.subscriptionId).size === 0) {
            this.socketMap.delete(socket.subscriptionId);
          }
        }
      });
    });
  }

  onSubscribe() {
    this.worker.on('message', (data) => {
      this.sendMessage(data);
    });
    // redis sub
  }

  sendMessage({ message, subscriptionId }) {
    setImmediate(() => {
      const sockets = this.socketMap.get(subscriptionId);

      if (sockets) {
        sockets.forEach((socket, socketId, mapObj) => {
          socket.send(message);
        });
      }
    });
  }
}
