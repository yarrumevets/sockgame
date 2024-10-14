const express = require("express");
const WebSocket = require("ws");

const { rectRectCollisionCheck, rectfromGameObject } = require("./collision");

// Servers.
const app = express();
const port = 4323;
const websocketServer = new WebSocket.Server({ port: 5997 });
const sockets = [];
let guestCount = 0;

const GAME_INTERVAL = 30; // 30 is optimal
const PADDLE_SPEED = 200;

// Webserver for static files.
app.use("/", express.static(__dirname + "/public"));
app.listen(port, () => {
  console.log("Webserver on port ", port);
});

const ball = {
  x: 400 - 32,
  y: 200 - 32,
  width: 64,
  height: 64,
  dx: 1,
  dy: 1,
  speed: 280,
}; // speed in pixels per second
const players = {
  player1: {
    score: 0,
    x: 0,
    y: 10,
    width: 32,
    height: 128,
    speed: PADDLE_SPEED,
    keysDown: [],
  },
  player2: {
    score: 0,
    x: 800 - 32,
    y: 10,
    width: 32,
    height: 128,
    speed: PADDLE_SPEED,
    keysDown: [],
  },
};

// Get the up (-1) or down (1) or neutral (0) direction multiplier for a player.
const getPlayerMoveDirFromKeys = (p) => {
  let direction = 0;
  if (p.keysDown.length) {
    p.keysDown.forEach((key) => {
      if (key === "ArrowUp") {
        direction -= 1;
      } else if (key === "ArrowDown") {
        direction += 1;
      }
    });
  }
  return direction;
};

let ballGoingOut = false; // If true, don't keep checking collisions. Just let the ball go out.

let lastUpdateTime = Date.now();
function updateBallPosition() {
  const now = Date.now();
  const deltaTime = (now - lastUpdateTime) / 1000; // convert ms to seconds

  gameHasPlayers = players.player1.userId && players.player2.userId;

  // Update position based on velocity and deltaTime
  ball.x += ball.dx * ball.speed * deltaTime;
  ball.y += ball.dy * ball.speed * deltaTime;

  // Check paddle collision (2-D paddles)
  // const paddleCollision =
  //   rectRectCollisionCheck(
  //     rectfromGameObject(players.player1),
  //     rectfromGameObject(ball)
  //   ) ||
  //   rectRectCollisionCheck(
  //     rectfromGameObject(players.player2),
  //     rectfromGameObject(ball)
  //   );

  // Check paddle collisions (Inner-edge only)
  if (!ballGoingOut) {
    let paddleCollision = false;
    if (ball.x < 32) {
      if (ball.y < players.player1.y + 128 && ball.y > players.player1.y)
        paddleCollision = true;
      else if (
        ball.y + 64 < players.player1.y + 128 &&
        ball.y + 64 > players.player1.y
      )
        paddleCollision = true;
      else ballGoingOut = true;
    } else if (ball.x + 64 > 800 - 32) {
      if (ball.y < players.player2.y + 128 && ball.y > players.player2.y)
        paddleCollision = true;
      else if (
        ball.y + 64 < players.player2.y + 128 &&
        ball.y + 64 > players.player2.y
      )
        paddleCollision = true;
      else ballGoingOut = true;
    }
    if (paddleCollision) {
      // for Inner-edge-only type.
      ball.dx *= -1;
    }
  }

  // Check for boundary collision and reverse direction
  if (ball.x < -64) {
    // ball off-screeen left
    ball.x = 400 - 32; // center the ball
    ball.y = 200 - 32;
    ball.dx = 1; // send the ball towards the scoring player (right)
    gameHasPlayers && players.player2.score++;
    ballGoingOut = false;
  }
  if (ball.x > 864) {
    // ball off-screen right
    ball.x = 400 - 32; // center the ball
    ball.y = 200 - 32;
    ball.dx = -1; // send the ball towards the scoring player (left)
    gameHasPlayers && players.player1.score++;
    ballGoingOut = false;
  }
  if (ball.y < 0) {
    ball.dy *= -1;
    ball.y = 0;
  } else if (ball.y > 336) {
    ball.dy *= -1;
    ball.y = 336;
  }

  const p1Dir = getPlayerMoveDirFromKeys(players.player1);
  const p2Dir = getPlayerMoveDirFromKeys(players.player2);

  if (p1Dir) {
    players.player1.y += p1Dir * players.player1.speed * deltaTime;
    if (players.player1.y < 0) players.player1.y = 0;
    if (players.player1.y > 672) players.player1.y = 672;
    players.player1.keysDown = [];
  }
  if (p2Dir) {
    players.player2.y += p2Dir * players.player2.speed * deltaTime;
    if (players.player2.y < 0) players.player2.y = 0;
    if (players.player2.y > 672) players.player2.y = 672;
    players.player2.keysDown = [];
  }

  lastUpdateTime = now; // update the last update time
}

// Send updated position to all connected clients
setInterval(() => {
  updateBallPosition();
  websocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          ball,
          players,
        })
      );
    }
  });
}, GAME_INTERVAL); // send updates at 10 fps

const getUniqueId = () => {
  const id = Math.random().toString(36).substring(2, 10);
  console.log("New ID: ", id);
  return id;
};

websocketServer.on("connection", (ws) => {
  ws.id = getUniqueId();

  // Receive player input
  ws.on("message", (message) => {
    userInput = JSON.parse(message);
    if (players.player1.userId === ws.id) {
      // it's player 1.
      players.player1.keysDown = userInput;
    } else if (players.player2.userId === ws.id) {
      // it's player 2
      players.player2.keysDown = userInput;
    }
  });

  // Apply user ID
  if (!players.player1.userId) {
    players.player1.userId = ws.id;
  } else if (!players.player2.userId) {
    players.player2.userId = ws.id;
  } // otherwise, any newer users will be spectators. @TODO: update this to queue them?

  ws.on("close", () => {
    console.log(`Connection ${ws.id} closed.`);
    // Remove user ID from player to free up slot for new connections.
    if (players.player1.userId === ws.id) {
      delete players.player1.userId;
    } else if (players.player2.userId === ws.id) {
      delete players.player2.userId;
    }
  });
});
