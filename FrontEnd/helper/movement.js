import { getSocket } from "../ws/wsHandler.js";
import Myapp from "./appInstance.js";

let listenersInitialized = false;

export default function usePlayerMovement(currentPlayer, setPlayers) {
  const socket = getSocket();
  const [activeDirection, setActiveDirection] = Myapp.useState(null);

  function handleKeyDown(e) {
    if (activeDirection()) return;

    let dir = null;
    if (e.key === "ArrowUp" || e.key === "w") dir = "up";
    else if (e.key === "ArrowDown" || e.key === "s") dir = "down";
    else if (e.key === "ArrowLeft" || e.key === "a") dir = "left";
    else if (e.key === "ArrowRight" || e.key === "d") dir = "right";

    if (dir) {
      e.preventDefault();
      setActiveDirection(dir);

      socket.emit("move", dir);
    }
    if (e.code === "Space") {
      socket.emit("placeBomb");
    }
  }

  function handleKeyUp() {
    setActiveDirection(null);
  }

  if (!listenersInitialized) {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    listenersInitialized = true;
  }
}
