import { getSocket } from "../ws/wsHandler.js";
import Myapp from "../helper/appInstance.js";

export default function usePlayerMovement(currentPlayer) {
  const socket = getSocket();
  const [activeDirection, setActiveDirection] = Myapp.useState(null);

  let intervalId = null;

  function startMoving(direction) {
    if (activeDirection()) return;

    setActiveDirection(direction);

    intervalId = setInterval(() => {
      if (!currentPlayer) return;

      const speed = currentPlayer.speed || 1;

      let dx = 0;
      let dy = 0;

      if (direction === "up") dy = -speed;
      else if (direction === "down") dy = speed;
      else if (direction === "left") dx = -speed;
      else if (direction === "right") dx = speed;

      socket.emit("move", { dx, dy });
    }, 100);
  }

  function stopMoving() {
    setActiveDirection(null);
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function handleKeyDown(e) {
    if (activeDirection()) return;

    let dir = null;
    if (e.key === "ArrowUp" || e.key === "w") dir = "up";
    else if (e.key === "ArrowDown" || e.key === "s") dir = "down";
    else if (e.key === "ArrowLeft" || e.key === "a") dir = "left";
    else if (e.key === "ArrowRight" || e.key === "d") dir = "right";

    if (dir) {
      e.preventDefault();
      startMoving(dir);
    }
  }

  function handleKeyUp() {
    stopMoving();
  }

  // Remove old listeners first
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
}