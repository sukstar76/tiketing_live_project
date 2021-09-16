package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
)

func main() {

	data, _ := os.Create("log.txt")
	log.SetOutput(data)

	hubs := make([]*Hub, 4)
	for i:=0; i<4; i++ {
		hubs[i] = newHub()
		go hubs[i].run()
		go hubs[i].sub()
	}

	redis := connectRedis(hubs)
	go redis.run()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hubs[rand.Intn(4)], w, r)
	})

	err := http.ListenAndServe("0.0.0.0:7070", nil)

	if err != nil {
		log.Fatal("listen and serve")
	}
}