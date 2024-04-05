package main

import (
	"fmt"
    "net/http"
	"strings"
    "github.com/gorilla/websocket"
    "time"
    "encoding/json"
)

func registerUser(w http.ResponseWriter, r *http.Request) {
    var user User
    err := json.NewDecoder(r.Body).Decode(&user)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    existingUser, err := getUser(user.Username)
    if err == nil && existingUser.Username == user.Username {
        fmt.Println("User already exists, skipping update")
        w.WriteHeader(http.StatusOK)
        return
    }

    fmt.Printf("Received user: %+v\n", user) 

    err = saveUser(user)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusOK)
}

func startGame(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")
    user, err := getUser(username)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    game, err := getGame(user.Username)
    if err != nil && err.Error() == "redis: nil" {
        game = Game{
            UserID:    user.Username,
            Deck:      newDeck(),
            Defuses:   0,
            IsRunning: true,
        }
        err = saveGame(game)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    } else if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if len(game.Deck) == 0 {
        game.Deck = newDeck()
        game.Defuses = 0
        game.IsRunning = true
        err = saveGame(game)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    }

    gameJSON, err := json.Marshal(game)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(gameJSON)
}

func drawCard(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")
    user, err := getUser(username)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    game, err := getGame(user.Username)
    if err != nil && err.Error() == "redis: nil" {
        game = Game{
            UserID:    user.Username,
            Deck:      newDeck(),
            Defuses:   0,
            IsRunning: true,
        }
        err = saveGame(game)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
    } else if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if !game.IsRunning || len(game.Deck) == 0 {
        game.Defuses = 0
        game.Deck = newDeck()
        game.IsRunning = true
        err = saveGame(game)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        fmt.Printf("Game is not running or deck is empty, resetting the game\n")
        http.Error(w, "Game is not running or deck is empty", http.StatusBadRequest)
        return
    }

    card := game.Deck[0]
    game.Deck = game.Deck[1:]
    if card == "explodingkitten" {
        if game.Defuses > 0 {
            game.Defuses--
        } else {
            game.Deck = newDeck()
        }
    } else if card == "defuse" {
        game.Defuses++
    } else if card == "shuffle" {
        game.Deck = newDeck()
    }

    err = saveGame(game)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(card))
}

func getSavedGame(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")
    user, err := getUser(username)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    game, err := getGame(user.Username)
    if err != nil && err.Error() == "redis: nil" {
        http.Error(w, "No saved game found", http.StatusNotFound)
        return
    } else if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    gameJSON, err := json.Marshal(game)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.Write(gameJSON)
}


func increasePoints(w http.ResponseWriter, r *http.Request) {
    fmt.Println("Increase points")
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	user, err := getUser(username)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get user '%s' from Redis", username), http.StatusInternalServerError)
		return
	}
	user.Points++
    fmt.Printf("User %s points increased to %d\n", user.Username, user.Points)
	err = saveUser(user)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to save user '%s' data to Redis", username), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User's points increased successfully"))
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        fmt.Println("Error upgrading to WebSocket:", err)
        return
    }
    defer conn.Close()
    for {
        leaderboard, err := getLeaderboardFromRedis()
        if err != nil {
            fmt.Println("Error fetching leaderboard:", err)
            return
        }
        leaderboardJSON, err := json.Marshal(leaderboard)
        if err != nil {
            fmt.Println("Error marshaling leaderboard to JSON:", err)
            return
        }
        err = conn.WriteMessage(websocket.TextMessage, leaderboardJSON)
        if err != nil {
            fmt.Println("Error writing message to WebSocket connection:", err)
            return
        }
        time.Sleep(10 * time.Second)
    }
}

func init() {
    upgrader.CheckOrigin = func(r *http.Request) bool {
        return true
    }
}


func getLeaderboardFromRedis() (map[string]int, error) {
    leaderboard := make(map[string]int)
    keys, err := redisClient.Keys("user:*").Result()
    fmt.Printf("Keys: %v\n", keys)
    if err != nil {
        return nil, err
    }

    for _, key := range keys {
        val, err := redisClient.Get(key).Bytes()
        if err != nil {
            fmt.Printf("Error getting value for key %s from Redis: %v\n", key, err)
            return nil, err
        }

        var user User
        err = json.Unmarshal(val, &user)
        if err != nil {
            fmt.Printf("Error unmarshaling value for key %s: %v\n", key, err)
            return nil, err
        }

        username := strings.TrimPrefix(key, "user:")
        leaderboard[username] = user.Points
    }
    fmt.Printf("Leaderboard: %+v\n", leaderboard)
    return leaderboard, nil
}