// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "tic-tac-toe-online",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const roomId = "demo-room";

const gameRef = doc(db, "rooms", roomId);

// Example write
setDoc(gameRef, {
  board: ["", "", "", "", "", "", "", "", ""],
  turn: "X"
});

// Example read (real-time)
onSnapshot(gameRef, (doc) => {
  console.log("Game data:", doc.data());
});