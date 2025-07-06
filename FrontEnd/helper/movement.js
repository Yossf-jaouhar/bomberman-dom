import { getSocket } from "../ws/wsHandler.js";

let listenersInitialized = false;
let pressedKeys = [];

const keyToDirection = {
  ArrowUp: "up",
  w: "up",
  ArrowDown: "down",
  s: "down",
  ArrowLeft: "left",
  a: "left",
  ArrowRight: "right",
  d: "right"
};

function handleKeyDown(e) {
  const socket = getSocket();
  if (!socket) return;
  const direction = keyToDirection[e.key];

  if (direction) {
    e.preventDefault();

    if (!pressedKeys.includes(direction)) {
      pressedKeys.push(direction);
      const newDirection = pressedKeys[pressedKeys.length - 1];
      socket.emit("startMoving", { direction: newDirection });
    }
  } else if (e.code === "Space") {
    socket.emit("placeBomb");
  }
}

function handleKeyUp(e) {
  const socket = getSocket();
  if (!socket) return;

  const direction = keyToDirection[e.key];

  if (direction) {
    e.preventDefault();

    if (pressedKeys.includes(direction)) {
      pressedKeys = pressedKeys.filter(k => k !== direction);
      if (pressedKeys.length === 0) {
        socket.emit("stopMoving");
      } else {
        const newDirection = pressedKeys[pressedKeys.length - 1];
        socket.emit("startMoving", { direction: newDirection });
      }
    }
  }
}

export default function usePlayerMovement() {
  if (!listenersInitialized) {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    listenersInitialized = true;
  }
}

export  function cleanupPlayerMovement() {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  listenersInitialized = false;
  pressedKeys = [];
}
