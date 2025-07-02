// usePlayerMovement.js
import { getSocket } from "../ws/wsHandler.js";

let listenersInitialized = false;

// Keep pressedKeys as a module-level variable
let pressedKeys = [];

export default function usePlayerMovement() {
  const socket = getSocket();

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

  if (!listenersInitialized) {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    listenersInitialized = true;
  }
}