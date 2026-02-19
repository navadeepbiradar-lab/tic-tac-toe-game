/***********************
  ELEMENTS
************************/
const cells = document.querySelectorAll("#one");
const resetBtn = document.getElementById("button");
const resetScoreBtn = document.getElementById("resetScore");
const modeBtn = document.getElementById("modeBtn");

const easyBtn = document.getElementById("easyBtn");
const hardBtn = document.getElementById("hardBtn");
const impossibleBtn = document.getElementById("impossibleBtn");

const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const highScoreEl = document.getElementById("highScoreValue");

const aiThinkingEl = document.getElementById("aiThinking");

/***********************
  SOUNDS
************************/
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");
const resetSound = document.getElementById("resetSound");

function playSound(sound) {
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

/***********************
  GAME STATE
************************/
let currentPlayer = "X";
let gameOver = false;
let gameMode = "AI";               // AI or PVP
let difficulty = "IMPOSSIBLE";     // EASY | HARD | IMPOSSIBLE

let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;

xScoreEl.textContent = xScore;
oScoreEl.textContent = oScore;
highScoreEl.textContent = highScore;

/***********************
  WIN PATTERNS
************************/
const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/***********************
  AI THINKING UI
************************/
function showThinking() {
  aiThinkingEl.style.display = "block";
  cells.forEach(c => c.disabled = true);
}

function hideThinking() {
  aiThinkingEl.style.display = "none";
  cells.forEach(c => {
    if (c.value === "") c.disabled = false;
  });
}

/***********************
  DIFFICULTY BUTTONS
************************/
easyBtn.onclick = () => {
  difficulty = "EASY";
  resetBoard();
};

hardBtn.onclick = () => {
  difficulty = "HARD";
  resetBoard();
};

impossibleBtn.onclick = () => {
  difficulty = "IMPOSSIBLE";
  resetBoard();
};

/***********************
  MODE BUTTON
************************/
modeBtn.onclick = () => {
  gameMode = gameMode === "AI" ? "PVP" : "AI";
  modeBtn.textContent =
    gameMode === "AI" ? "PLAY VS AI" : "TWO PLAYERS";
  resetBoard();
};

/***********************
  PLAYER MOVE
************************/
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (cell.value || gameOver) return;

    cell.value = currentPlayer;
    cell.disabled = true;
    playSound(clickSound);

    checkWinner();
    if (gameOver) return;

    if (gameMode === "AI" && currentPlayer === "X") {
      currentPlayer = "O";
      showThinking();
      setTimeout(() => {
        aiMove();
        hideThinking();
      }, 700);
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
  });
});

/***********************
  AI CONTROLLER
************************/
function aiMove() {
  if (gameOver) return;

  if (difficulty === "EASY") easyAI();
  else if (difficulty === "HARD") hardAI();
  else impossibleAI();
}

/***********************
  EASY AI (Random)
************************/
function easyAI() {
  const empty = [...cells]
    .map((c, i) => c.value === "" ? i : null)
    .filter(i => i !== null);

  makeMove(empty[Math.floor(Math.random() * empty.length)], "O");
}

/***********************
  HARD AI (Win / Block)
************************/
function hardAI() {
  const board = getBoard();

  for (let [a,b,c] of winPatterns)
    if (board[a]==="O" && board[b]==="O" && board[c]==="")
      return makeMove(c,"O");

  for (let [a,b,c] of winPatterns)
    if (board[a]==="X" && board[b]==="X" && board[c]==="")
      return makeMove(c,"O");

  easyAI();
}

/***********************
  IMPOSSIBLE AI (MINIMAX)
************************/
const scores = { O: 10, X: -10, draw: 0 };

function impossibleAI() {
  let bestScore = -Infinity;
  let move;
  const board = getBoard();

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  makeMove(move, "O");
}

function minimax(board, depth, isMax) {
  let result = checkResult(board);
  if (result) return scores[result];

  if (isMax) {
    let best = -Infinity;
    for (let i=0;i<9;i++) {
      if (board[i]==="") {
        board[i]="O";
        best = Math.max(best, minimax(board, depth+1, false));
        board[i]="";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i=0;i<9;i++) {
      if (board[i]==="") {
        board[i]="X";
        best = Math.min(best, minimax(board, depth+1, true));
        board[i]="";
      }
    }
    return best;
  }
}

/***********************
  HELPERS
************************/
function getBoard() {
  return [...cells].map(c => c.value);
}

function checkResult(board) {
  for (let [a,b,c] of winPatterns)
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];

  if (board.every(v => v !== "")) return "draw";
  return null;
}

function makeMove(index, player) {
  cells[index].value = player;
  cells[index].disabled = true;
  playSound(clickSound);
  checkWinner();
  if (!gameOver) currentPlayer = "X";
}

/***********************
  WIN / DRAW
************************/
function checkWinner() {
  const board = getBoard();

  for (let [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameOver = true;
      playSound(winSound);

      if (board[a] === "X") xScore++;
      else oScore++;

      xScoreEl.textContent = xScore;
      oScoreEl.textContent = oScore;

      localStorage.setItem("xScore", xScore);
      localStorage.setItem("oScore", oScore);

      updateHighScore();
      alert(`${board[a]} Wins 🎉`);
      return;
    }
  }

  if (board.every(v => v !== "")) {
    gameOver = true;
    playSound(drawSound);
    alert("Game Draw 🤝");
  }
}

/***********************
  HIGH SCORE
************************/
function updateHighScore() {
  const max = Math.max(xScore, oScore);
  if (max > highScore) {
    highScore = max;
    highScoreEl.textContent = highScore;
    localStorage.setItem("highScore", highScore);
  }
}

/***********************
  RESET
************************/
function resetBoard() {
  playSound(resetSound);
  cells.forEach(c => {
    c.value = "";
    c.disabled = false;
  });
  currentPlayer = "X";
  gameOver = false;
  hideThinking();
}

resetBtn.onclick = resetBoard;

resetScoreBtn.onclick = () => {
  xScore = 0;
  oScore = 0;
  xScoreEl.textContent = 0;
  oScoreEl.textContent = 0;
  localStorage.setItem("xScore", 0);
  localStorage.setItem("oScore", 0);
};
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = [];

io.on("connection", socket => {
  console.log("Player connected:", socket.id);

  players.push(socket.id);

  if (players.length === 2) {
    io.to(players[0]).emit("playerRole", "X");
    io.to(players[1]).emit("playerRole", "O");
  }

  socket.on("makeMove", data => {
    socket.broadcast.emit("movePlayed", data);
  });

  socket.on("disconnect", () => {
    players = players.filter(id => id !== socket.id);
    io.emit("playerLeft");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
const socket = io();

let mySymbol = null;
let isMyTurn = false;

socket.on("playerRole", role => {
  mySymbol = role;
  currentPlayer = role;
  isMyTurn = role === "X";
  alert(`You are Player ${role}`);
});

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!isMyTurn || cell.value || gameOver) return;

    makeMove(index, mySymbol);

    socket.emit("makeMove", {
      index,
      player: mySymbol
    });

    isMyTurn = false;
  });
});

socket.on("movePlayed", data => {
  makeMove(data.index, data.player);
  isMyTurn = true;
});

socket.on("playerLeft", () => {
  alert("Opponent left the game 😢");
  resetBoard();
});
document.getElementById("onlineBtn").onclick = () => {
  gameMode = "ONLINE";
  resetBoard();
};