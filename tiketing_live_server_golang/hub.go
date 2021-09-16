package main

import (
	"sync"
)

var rwMutex = new(sync.RWMutex)

type Hub struct {
	clients    map[string]map[*Client]bool
	mutexs     map[string]*sync.RWMutex
	register   chan *ClientMessage
	unregister chan *ClientMessage
	subscriber chan *RedisMessage
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		mutexs:     make(map[string]*sync.RWMutex),
		register:   make(chan *ClientMessage),
		unregister: make(chan *ClientMessage),
		subscriber: make(chan *RedisMessage, 1024 * 10),
	}
}

func (h *Hub) run() {
	for {
		select {
		case r := <-h.register:
			_, exists := h.mutexs[r.subscriptionId]
			if !exists {
				h.mutexs[r.subscriptionId] = new(sync.RWMutex)
			}

			h.mutexs[r.subscriptionId].Lock()
			_, exists = h.clients[r.subscriptionId]
			if !exists {
				h.clients[r.subscriptionId] = make(map[*Client]bool)
			}

			h.clients[r.subscriptionId][r.client] = true

			h.mutexs[r.subscriptionId].Unlock()

		case r := <-h.unregister:
			h.mutexs[r.subscriptionId].Lock()
			delete(h.clients[r.subscriptionId], r.client)
			h.mutexs[r.subscriptionId].Unlock()
		}
	}
}

func (h *Hub) sub() {
	for {
		select {
		case rm := <-h.subscriber:

			h.mutexs[rm.subscriptionId].RLock()
			for client := range h.clients[rm.subscriptionId] {
				if client.conn != nil {
					client.send <- rm.message
				}
			}
			h.mutexs[rm.subscriptionId].RUnlock()

		}
	}

}
