const roomId = prompt("Enter Room ID");
const roomRef = db.ref("rooms/" + roomId);

let mySymbol = "X";
let currentTurn = "X";

roomRef.once("value").then(snapshot => {
  if (!snapshot.exists()) {
    roomRef.set({
      board: ["","","","","","","","",""],
      turn: "X",
      winner: ""
    });
  } else {
    mySymbol = "O";
  }
});

roomRef.on("value", snapshot => {
  const data = snapshot.val();
  if (!data) return;

  const cells = document.querySelectorAll(".cell");
  data.board.forEach((v, i) => cells[i].innerText = v);

  currentTurn = data.turn;
  document.getElementById("status").innerText =
    data.winner ? data.winner + " WON!" : "Turn: " + currentTurn;
});

function makeMove(i) {
  if (currentTurn !== mySymbol) return;

  roomRef.once("value").then(snap => {
    const d = snap.val();
    if (d.board[i] !== "" || d.winner) return;

    d.board[i] = mySymbol;
    d.turn = mySymbol === "X" ? "O" : "X";
    d.winner = checkWinner(d.board);

    roomRef.set(d);
  });
}

function checkWinner(b) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b1,c] of wins) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return b[a];
    }
  }
  return "";
}