// usePlayerMovement.js
import { getSocket } from "../ws/wsHandler.js";
import Myapp from "./appInstance.js";

let  listenersInitialized  =false
export default function usePlayerMovement(currentPlayer, setPlayers, gameOver) {
  const socket = getSocket();

  const [keysHeld, setKeysHeld] = Myapp.useState({
    up: false,
    down: false,
    left: false,
    right: false
  });

  function handleKeyDown(e) {
    let changed = false;

    if (e.key === "ArrowUp" || e.key === "w") {
      keysHeld().up = true;
      changed = true;
    } else if (e.key === "ArrowDown" || e.key === "s") {
      keysHeld().down = true;
      changed = true;
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      keysHeld().left = true;
      changed = true;
    } else if (e.key === "ArrowRight" || e.key === "d") {
      keysHeld().right = true;
      changed = true;
    } else if (e.code === "Space") {
      socket.emit("placeBomb");
    }

    if (changed) {
      e.preventDefault();
      setKeysHeld({ ...keysHeld() });
    }
  }

  function handleKeyUp(e) {
    let changed = false;

    if (e.key === "ArrowUp" || e.key === "w") {
      keysHeld().up = false;
      changed = true;
    } else if (e.key === "ArrowDown" || e.key === "s") {
      keysHeld().down = false;
      changed = true;
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      keysHeld().left = false;
      changed = true;
    } else if (e.key === "ArrowRight" || e.key === "d") {
      keysHeld().right = false;
      changed = true;
    }

    if (changed) {
      e.preventDefault();
      setKeysHeld({ ...keysHeld() });
    }
  }

  if (!listenersInitialized) {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    listenersInitialized = true;
  }

  // Movement loop
  requestAnimationFrame(function tick() {
    if (gameOver && gameOver()) return;

    let dx = 0;
    let dy = 0;

    const speed =  4;

    if (keysHeld().up) dy -= speed;
    if (keysHeld().down) dy += speed;
    if (keysHeld().left) dx -= speed;
    if (keysHeld().right) dx += speed;

    if (dx !== 0 || dy !== 0) {
      socket.emit("move", { dx, dy });
    }

    requestAnimationFrame(tick);
  });
}
