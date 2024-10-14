import { generateKeyCapture } from "./keyboard.js";

const keyboard = generateKeyCapture();
keyboard.initKeyboard();

const speed = 200; // 200 pixels per second.
let lastTimestamp = 0;

const statusText = document.getElementById("status");
const statusText2 = document.getElementById("status2");

const paddleImageA = document.getElementById("paddle-a");
const paddleImageB = document.getElementById("paddle-b");
const ballImage = document.getElementById("ball");

const player1ScoreText = document.getElementById("scoreP1");
const player2ScoreText = document.getElementById("scoreP2");

const canvas = document.getElementById("game");
const gameWidth = 800;
const gameHeight = 400;
canvas.width = gameWidth;
canvas.height = gameHeight;

const ctx = canvas.getContext("2d");

const paddleUser = {
  image: paddleImageA,
  x: 0,
  y: 0,
  width: 32,
  height: 128,
};

const paddleOpponent = {
  image: paddleImageB,
  x: gameWidth - 32,
  y: gameHeight - 128,
  width: 32,
  height: 128,
};

const wBall = {
  image: ballImage,
  x: 0, // from server
  y: 0, // from server
  xDir: 1, // from server
  yDir: 1, // from server
  width: 64,
  height: 64,
};

let fpsStart = performance.now();
let fpsFrames = 0;
let averageFrameRate = 0;

// ------- LOGIC -------- //

// Connect to server.
const host = window.location.hostname;
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const websocketUrl = `${protocol}://${host}/sockgamesock`;
console.log("websocket url: ", websocketUrl);
const connection = new WebSocket(websocketUrl); // wss://localhost/sockchatsock
// const connection = new WebSocket("ws://localhost:5997");

connection.onopen = () => {
  console.log("Connected to server...");
  // Keep alive.
  const keepAliveInterval = setInterval(() => {
    console.log("ping");
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({ type: "ping" }));
    }
  }, 50000);
  // Cleanup.
  connection.onclose = (e) => {
    clearInterval(keepAliveInterval);
    console.log("websocket closed");
  };
};

// Draw Game Object:
const drawGameObject = (gameObject) => {
  ctx.drawImage(
    gameObject.image,
    gameObject.x,
    gameObject.y,
    gameObject.width,
    gameObject.height
  );
};

const maxFpsCount = 120;
let fpsCount = 0; // for stats. counts to maxFpsCount then resets.
let fpsSum = 0; // to get the average after adding up maxFpsCount FPSs.

// Main animation loop
const update = (timestamp) => {
  const deltaTime = (timestamp - lastTimestamp) / 1000; // In seconds.
  const distance = speed * deltaTime;
  const fps = 1 / deltaTime;
  fpsFrames++;
  const fpsElapsedTime = performance.now() - fpsStart;
  if (fpsElapsedTime > 1000) {
    fpsStart = performance.now();
    averageFrameRate = (fpsFrames / fpsElapsedTime) * 1000;
    fpsFrames = 0;
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  //  ctx.strokeWidth = 3;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  // Draw sprites
  drawGameObject(paddleOpponent);
  drawGameObject(paddleUser);
  drawGameObject(wBall);

  // Check keyboard input for movement
  const keysPressed = [];

  if (keyboard.getKeys().ArrowUp) {
    keysPressed.push("ArrowUp");
  }
  if (keyboard.getKeys().ArrowDown) {
    keysPressed.push("ArrowDown");
  }
  // Send keypresses
  if (keysPressed.length) connection.send(JSON.stringify(keysPressed));

  // Display FPS averages
  fpsSum += fps;
  fpsCount++;
  if (fpsCount >= maxFpsCount) {
    statusText2.innerHTML = " FPS: " + (fpsSum / fpsCount).toFixed(1);
    fpsCount = 0;
    fpsSum = 0;
  }

  // Update the last timestamp
  lastTimestamp = timestamp;

  // Continue if ESC was not pressed...
  if (!keyboard.getKeys().Escape) {
    requestAnimationFrame(update);
  }
};

// Main menu
const showMainMenu = () => {
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#ffffff";
  //  ctx.strokeWidth = 3;
  ctx.fillRect(0, 0, gameWidth, gameHeight);
  ctx.strokeWidth = 2;
  ctx.strokeRect(10, 10, gameWidth - 20, gameHeight - 20);
  ctx.strokeWidth = 1;
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.font = "30px Arial";
  ctx.fillText("Multiplayer Game", gameWidth / 2, 200);
  ctx.font = "15px Arial";
  ctx.fillText("Press Enter to join the game...", gameWidth / 2, 350);
  document.addEventListener("keydown", startGame);
};
const startGame = (event) => {
  if (event.key === "Enter") {
    console.log("Start Game!");
    document.removeEventListener("keydown", startGame);
    requestAnimationFrame(update);
  }
};

showMainMenu();

// Receive update from server.
connection.onmessage = (message) => {
  // console.log("message: ", message.data);
  const gameUpdate = JSON.parse(message.data);
  // statusText.innerHTML = "x: " + gameUpdate.ball.x + " y: " + gameUpdate.ball.y;

  wBall.x = gameUpdate.ball.x;
  wBall.y = gameUpdate.ball.y;
  paddleUser.y = gameUpdate.players.player1.y;
  paddleOpponent.y = gameUpdate.players.player2.y;

  player1ScoreText.innerHTML = gameUpdate.players.player1.score;
  player2ScoreText.innerHTML = gameUpdate.players.player2.score;
};
