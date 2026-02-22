// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 🔴 PUT YOUR REAL FIREBASE DETAILS HERE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= GAME STATE =================
let roomRef;
let mySymbol = "X";

// ================= JOIN ROOM =================
async function joinRoom() {
  const roomId = document.getElementById("roomId").value.trim();
  if (!roomId) {
    alert("Enter Room ID");
    return;
  }

  roomRef = doc(db, "rooms", roomId);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) {
    await setDoc(roomRef, {
      board: Array(9).fill(""),
      turn: "X"
    });
    mySymbol = "X";
  } else {
    mySymbol = "O";
  }

  document.getElementById("status").innerText =
    "Connected as " + mySymbol;

  listenRoom();
}

// ================= LISTEN =================
function listenRoom() {
  onSnapshot(roomRef, (snap) => {
    const data = snap.data();
    drawBoard(data.board, data.turn);
  });
}

// ================= DRAW BOARD =================
function drawBoard(board, turn) {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.innerText = board[i];
    cell.onclick = () => makeMove(i, board, turn);
  });
}

// ================= MAKE MOVE =================
async function makeMove(index, board, turn) {
  if (board[index] !== "") return;
  if (turn !== mySymbol) return;

  board[index] = mySymbol;

  await updateDoc(roomRef, {
    board: board,
    turn: mySymbol === "X" ? "O" : "X"
  });
}

// ================= EXPOSE =================
window.joinRoom = joinRoom;