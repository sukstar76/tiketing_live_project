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
	conn *redis.PubSubConn
	hubs []*Hub
}

func connectRedis(hubs []*Hub) *Redis {
	c, err := redis.Dial("tcp","redis:6380")
	if err != nil {
		log.Println(err)
	}

	conn := redis.PubSubConn{Conn:c}
	conn.PSubscribe("channel:*")

	return &Redis {
		conn: &conn,
		hubs: hubs,
	}
}

func (r * Redis) run() {
	for {
		switch t := r.conn.Receive().(type) {
		case redis.Message:
			//log.Println(string(t.Data[:]) + "redis")
			for i:=0; i<len(r.hubs); i++ {
				r.hubs[i].subscriber <- &RedisMessage{
					subscriptionId: t.Channel[8:],
					message:        t.Data,
				}
			}
		}
	}
}