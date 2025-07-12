import Myapp from "../helper/appInstance.js";
import { pendingState } from "../helper/wsData.js";
import { getSocket } from "../ws/wsHandler.js";

let listenersRegistered = false;

export default function registerWSListeners() {
  if (listenersRegistered) {
    return;
  }

  const socket = getSocket();
  if (!socket) return;

  // only register once
  listenersRegistered = true;

  socket.on("bombPlaced", (data) => {
    pendingState.bombsPlaced.push(data);
  });

  socket.on("bombExploded", (data) => {
    console.log("[bombExploded]", data);
    pendingState.bombsExploded.push(data);
  });

  socket.on("gameStart", (data) => {    
    pendingState.gameStart = data;
    Myapp.navigate("/game")
  });
  
  socket.on("playerData", (data) => {
        pendingState.playerData = data;
  });

  socket.on("updatePlayers", (data) => {
    pendingState.updatePlayers = data;
  });

  socket.on("mapChange", (data) => {
    pendingState.mapChange = data;
  });

  socket.on("lifeUpdate", (data) => {
    pendingState.lifeUpdate = data;
  });

  socket.on("playerDied", (data) => {
    pendingState.playerDied = data;
  });

  socket.on("powerUpSpawned", (data) => {    
    pendingState.powerUps = data;
  });

  socket.on("powerUpPicked", (data) => {
    pendingState.powerUpPicked = data;
  });

  socket.on("removePowerUp", (data) => {
    pendingState.removePowerUp = data;
  });
  socket.on("playerWon", (data) => {
    pendingState.win = data;
  });

}