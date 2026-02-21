import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* 🔥 Firebase config (mee console nundi copy cheyyali) */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "tic-tac-toe-online",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let roomRef;
let mySymbol = "";
let myTurn = false;

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

/* JOIN ROOM */
window.joinRoom = async function () {
  const roomId = document.getElementById("roomId").value;
  if (!roomId) return alert("Enter Room ID");

  roomRef = doc(db, "rooms", roomId);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) {
    // First player
    await setDoc(roomRef, {
      board: ["", "", "", "", "", "", "", "", ""],
      turn: "X",
      players: 1,
      winner: ""
    });
    mySymbol = "X";
    myTurn = true;
  } else {
    // Second player
    mySymbol = "O";
    myTurn = false;
    await updateDoc(roomRef, {
      players: 2
    });
  }

  statusText.innerText = `You are ${mySymbol}`;
  listenGame();
};

/* REAL-TIME LISTENER */
function listenGame() {
  onSnapshot(roomRef, (doc) => {
    const data = doc.data();
    updateBoard(data.board);
    myTurn = data.turn === mySymbol;
    statusText.innerText = data.winner
      ? `Winner: ${data.winner}`
      : myTurn
      ? "Your Turn"
      : "Opponent Turn";
  });
}

/* PLAY MOVE */
window.play = async function (index) {
  if (!myTurn) return;

  const snap = await getDoc(roomRef);
  const data = snap.data();

  if (data.board[index] !== "" || data.winner) return;

  data.board[index] = mySymbol;
  data.turn = mySymbol === "X" ? "O" : "X";

  const winner = checkWinner(data.board);
  if (winner) data.winner = winner;

  await updateDoc(roomRef, data);
};

/* UPDATE UI */
function updateBoard(board) {
  board.forEach((val, i) => {
    cells[i].innerText = val;
  });
}

/* WIN LOGIC */
function checkWinner(b) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let w of wins) {
    if (b[w[0]] && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]) {
      return b[w[0]];
    }
  }
  return "";
}