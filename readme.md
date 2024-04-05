
# 😸 Exploding Kitten 

This will be an online single-player card game that consists of 4 different types of cards

- Cat card 😼
- Defuse card 🙅‍♂️
- Shuffle card 🔀
- Exploding kitten card 💣

There will be a button to start the game. When the game is started there will be a deck of 5 cards ordered randomly. Each time user clicks on the deck a card is revealed and that card is removed from the deck. A player wins the game once he draws all 5 cards from the deck and there is no card left to draw. 

Rules:
- If the card drawn from the deck is a cat card, then the card is removed from the deck.
- If the card is exploding kitten (bomb) then the player loses the game.
- If the card is a defusing card, then the card is removed from the deck. This card can be used to defuse one bomb that may come in subsequent cards drawn from the deck.
- If the card is a shuffle card, then the game is restarted and the deck is filled with 5 cards again.
## Installation

Download Node and Go and set system variable path
```bash
C:\Program Files\nodejs\
C:\Program Files\Go\bin
```

Also Download RedisInsight software

Unzip tar.gz file

Go to Project directory 
```bash
cd explodding_kitten
```


Install dependencies

```bash
  npm install
```

Add Required external dependencies

```bash
npm install redux react-redux
npm install @reduxjs/toolkit
npm install -D tailwindcss
npm i -D daisyui@latest
npm install js-confetti
```

Go to Backend folder
```bash
cd Backend
```

Initialize go project

```bash
go mod init exploddingkitten.com/mygame
```

Add required modules

```bash
go get -u github.com/gin-gonic/gin
go get -u github.com/go-redis/redis/v8
go get -u github.com/gin-contrib/cors
```
## Run Locally

Start the server
```bash
npm start
```

```bash
cd Backend
go run main.go
```
