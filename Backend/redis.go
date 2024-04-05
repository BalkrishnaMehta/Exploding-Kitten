package main

import (
    "encoding/json"
    "fmt"
    "github.com/joho/godotenv"
    "github.com/go-redis/redis"
    "os"
)

var redisClient *redis.Client

func initRedis() {
	err := godotenv.Load("../.env")
    if err != nil {
        panic("Error loading .env file")
    }

    redisEndpoint := os.Getenv("REDIS_ENDPOINT")

    opt, err := redis.ParseURL(redisEndpoint)
    if err != nil {
        panic(err)
    }

    redisClient = redis.NewClient(opt)
}


func saveUser(user User) error {
    userJSON, err := json.Marshal(user)
    if err != nil {
        return err
    }
    err = redisClient.Set(fmt.Sprintf("user:%s", user.Username), userJSON, 0).Err()
    if err != nil {
        fmt.Printf("Error saving user %+v to Redis: %v\n", user, err)
        return err
    }
    fmt.Printf("Saved user %+v to Redis\n", user)
    return nil
}

func getUser(username string) (User, error) {
    val, err := redisClient.Get(fmt.Sprintf("user:%s", username)).Bytes()
    if err != nil {
        fmt.Printf("Error getting user %s from Redis: %v\n", username, err)
        return User{}, err
    }
    var user User
    fmt.Printf("Got user %s from Redis\n", username)
    err = json.Unmarshal(val, &user)
    return user, err
}

func saveGame(game Game) error {
    gameJSON, err := json.Marshal(game)
    if err != nil {
        fmt.Printf("Error saving game %+v to Redis: %v\n", game, err)
        return err
    }
    fmt.Printf("Saving game %+v to Redis\n", game)
    return redisClient.Set(fmt.Sprintf("game:%s", game.UserID), gameJSON, 0).Err()
}

func getGame(userID string) (Game, error) {
    val, err := redisClient.Get(fmt.Sprintf("game:%s", userID)).Bytes()
    if err != nil {
        return Game{}, err
    }
    var game Game
    err = json.Unmarshal(val, &game)
    return game, err
}

