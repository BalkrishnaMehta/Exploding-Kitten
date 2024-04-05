package main

import (
    "fmt"
    "net/http"
    "github.com/gorilla/websocket"
    "github.com/rs/cors"
)

var upgrader = websocket.Upgrader{}

func main() {
    initRedis()

    http.HandleFunc("/register", registerUser)
    http.HandleFunc("/start", startGame)
    http.HandleFunc("/game", getSavedGame)
    http.HandleFunc("/draw", drawCard)
    http.HandleFunc("/increasePoints", increasePoints)
    http.HandleFunc("/ws", handleWebSocket)

    c := cors.Default().Handler(http.DefaultServeMux)

    fmt.Println("Server listening on :8080")
    http.ListenAndServe(":8080", c)
}
