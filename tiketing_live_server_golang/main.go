package main

import (
	"log"
	"net/http"
	"os"
)

func main() {

	data, _ := os.Create("log.txt")
	log.SetOutput(data)

	hub := newHub()
	go hub.run()
	go hub.sub()
	redis := connectRedis(hub)
	go redis.run()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	err := http.ListenAndServe("0.0.0.0:7070", nil)

	if err != nil {
		log.Fatal("listen and serve")
	}
}