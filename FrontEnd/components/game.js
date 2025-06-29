import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { connectWebSocket, getSocket } from "../ws/wsHandler.js";
import PlayerDivs from "./player.js";
import MapTiles from "./mapTiles.js";
import GameHeader from "./header.js";
import usePlayerMovement from "../helper/movement.js";

export default function Game() {
  let socket = getSocket();
  if (!socket) {
    connectWebSocket("chakir");
    socket = getSocket();
  }

  const rows = 13;
  const cols = 15;
  const tileSize = 40;

  const [mapTiles, setMapTiles] = Myapp.useState([]);
  const [players, setPlayers] = Myapp.useState([]);
  const [playerName, setPlayerName] = Myapp.useState("");
  const [playerLives, setPlayerLives] = Myapp.useState(5);
  const [currentPlayer, setCurrentPlayer] = Myapp.useState(null);   // ✅ add this back!

  // allow movement
  usePlayerMovement(currentPlayer);

  socket.off("gameStart");
  socket.off("playerData");

  socket.on("gameStart", (data) => {
    console.log("gameStart", data);
    setMapTiles(data.map);

    const playersArray = Object.entries(data.players).map(([name, info]) => ({
      name,
      x: info.x,
      y: info.y,
      avatar: info.avatar?.replace(".png", "") || ""
    }));

    setPlayers(playersArray);
  });

  socket.on("playerData", (data) => {
    setPlayerName(data.name);
    setPlayerLives(data.lives);
    setCurrentPlayer({
      name: data.name,
      lives: data.lives,
      maxBombs: data.maxBombs,
      explosionRange: data.explosionRange,
      speed: data.speed,
      avatar: data.avatar?.replace(".png", ""),
      position: data.position
    });
  });

  return E("div", { class: "game-screen" }).childs(
    GameHeader(playerName(), playerLives()),
    E("div", {
      class: "map-grid",
      style: `
        display: grid;
        grid-template-columns: repeat(${cols}, ${tileSize}px);
        grid-template-rows: repeat(${rows}, ${tileSize}px);
        position: relative;
        width: ${cols * tileSize}px;
        height: ${rows * tileSize}px;
      `
    }).childs(
      ...MapTiles(mapTiles(), tileSize, cols),
      ...PlayerDivs(players(), tileSize)
    )
  );
}