package main

import (
	"bytes"
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

var (
	newline = []byte{'\n'}
	space = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize: 0,
	WriteBufferSize: 0,
	CheckOrigin: func(r *http.Request) bool {
		return  true
	},
}

type Client struct {
	conn *websocket.Conn
	send chan []byte
	hub *Hub
	subscriptionId string
}

type IncomingMessage struct {
	Message string
	SubscriptionId string
}

type ClientMessage struct {
	subscriptionId string
	client *Client
}

func (c * Client) readPump() {
	defer func() {
		c.hub.unregister <- &ClientMessage{
			client: c,
			subscriptionId: c.subscriptionId,
		}
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))

		//log.Println(string(message[:]))
		var im IncomingMessage
		json.Unmarshal(message, &im)

		//log.Println(im.Message)
		//log.Println(im.SubscriptionId)

		if im.Message == "subscription" {
			c.subscriptionId = im.SubscriptionId
			c.hub.register <- &ClientMessage{
				subscriptionId: im.SubscriptionId,
				client: c,
			}
		}
	}
}

func (c *Client) writePump() {
	defer func() {
		c.hub.unregister <- &ClientMessage{
			client: c,
			subscriptionId: c.subscriptionId,
		}
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			//log.Println(string(message[:]) + "socket")
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}

			w.Write(message)
			w.Write(newline)

			//log.Println(string(message[:]))
			if err := w.Close(); err != nil {
				return
			}
		}
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 1024 * 10)}
	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}

