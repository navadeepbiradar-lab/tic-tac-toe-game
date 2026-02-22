// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ================= YOUR FIREBASE CONFIG =================
// ⚠️ Replace with YOUR Firebase project keys
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

// ================= INIT FIREBASE =================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= GAME VARIABLES =================
let roomRef = null;
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
    // First player creates room
    await setDoc(roomRef, {
      board: Array(9).fill(""),
      turn: "X"
    });
    mySymbol = "X";
  } else {
    // Second player joins
    mySymbol = "O";
  }

  document.getElementById("status").innerText =
    "Connected as " + mySymbol;

  listenRoom();
}

// ================= REALTIME LISTENER =================
function listenRoom() {
  onSnapshot(roomRef, (docSnap) => {
    const data = docSnap.data();
    renderBoard(data.board, data.turn);
  });
}

// ================= RENDER BOARD =================
function renderBoard(board, turn) {
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

// ================= EXPOSE FUNCTION TO HTML =================
window.joinRoom = joinRoom;