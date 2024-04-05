package main

import "math/rand"

type User struct {
    Username string `json:"username"`
    Points   int    `json:"points"`
}

type Game struct {
    UserID    string   `json:"userID"`
    Deck      []string `json:"deck"`
    Defuses   int      `json:"defuses"`
    IsRunning bool     `json:"isRunning"`
}

func newDeck() []string {
    deck := make([]string, 0, 4)
    cards := []string{"cat", "defuse"}
    for i := 0; i < 5; i++ { 
        card := cards[rand.Intn(len(cards))]
        deck = append(deck, card)
    }
    return deck
}
