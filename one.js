// ================= SIMPLE MULTIPLAYER TIC TAC TOE =================

// ---- GAME STATE ----
let board = Array(9).fill("");
let currentPlayer = "X";

// ---- JOIN ROOM ----
function joinRoom() {
  document.getElementById("status").innerText = "Connected";
}

// ---- CELL CLICK ----
function cellClick(index) {
  if (board[index] !== "") return;

  board[index] = currentPlayer;
  document.getElementById("cell" + index).innerText = currentPlayer;

  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

// ---- EXPOSE TO HTML ----
window.joinRoom = joinRoom;
window.cellClick = cellClick;