FROM golang:1.17-alpine

WORKDIR /app

RUN apk add --no-cache git make bash

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o ./golang-live-server

EXPOSE 7070

CMD ["./golang-live-server"]