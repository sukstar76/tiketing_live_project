package main

import (
	"log"

	"github.com/gomodule/redigo/redis"
)

type RedisMessage struct {
	subscriptionId string
	message []byte
}

type Redis struct {
	pubsub *redis.PubSubConn
	hub *Hub
}

func connectRedis(h *Hub) *Redis {
	c, err := redis.Dial("tcp","redis:6380")
	if err != nil {
		log.Println(err)
	}

	conn := redis.PubSubConn{Conn:c}
	conn.PSubscribe("channel:*")

	return &Redis {
		pubsub: &redis.PubSubConn{Conn:c},
		hub: h,
	}
}

func (r * Redis) run() {
	for {
		switch t := r.pubsub.Receive().(type) {
		case redis.Message:
			//log.Println(string(t.Data[:]) + "redis")
			r.hub.subscriber <- &RedisMessage{
				subscriptionId: t.Channel[8:],
				message: t.Data,
			}
		}
	}
}