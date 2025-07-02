import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { connectWebSocket, getSocket } from "../ws/wsHandler.js";
import PlayerDivs from "./player.js";
import MapTiles from "./mapTiles.js";
import GameHeader from "./header.js";
import usePlayerMovement from "../helper/movement.js";
import BombDivs from "./bom.js";

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
  const [currentPlayer, setCurrentPlayer] = Myapp.useState(null);
  const [gameOver, setGameOver] = Myapp.useState(false);

  // Plug in the movement hook
  usePlayerMovement();

  socket.off("gameStart");
  socket.off("playerData");
  socket.off("updatePlayers");
  socket.off("bombPlaced");
  socket.off("bombExploded");
  socket.off("mapChange");
  socket.off("playerDied");
  socket.off("lifeUpdate");

  socket.on("playerDied", (data) => {
    console.log("playerDied", data);
    setPlayers((prevPlayers) =>
      prevPlayers.filter((p) => p.name !== data.name)
    );
    if (data.name === playerName()) {
      socket.close();
      setGameOver(true);
    }
  });

  socket.on("gameStart", (data) => {
    console.log("gameStart", data);
    setMapTiles(data.map);

    const playersArray = Object.entries(data.players).map(([name, info]) => ({
      name,
      pixelX: info.x * tileSize,  // <-- CHANGED
      pixelY: info.y * tileSize,  // <-- CHANGED
      tileX: info.x,              // <-- CHANGED
      tileY: info.y,              // <-- CHANGED
      avatar: info.avatar?.replace(".png", "") || "",
    }));

    setPlayers(playersArray);
  });

  socket.on("playerData", (data) => {
    console.log("playerdata" , data);
    
    setPlayerName(data.name);
    setPlayerLives(data.lives);
    setCurrentPlayer({
      name: data.name,
      lives: data.lives,
      maxBombs: data.maxBombs,
      explosionRange: data.explosionRange,
      speed: data.speed,
      avatar: data.avatar,
      pixelX: data.position.x * tileSize, // <-- CHANGED
      pixelY: data.position.y * tileSize, // <-- CHANGED
      tileX: data.position.x,
      tileY: data.position.y,
    });
  });

  socket.on("updatePlayers", (data) => {
    console.log("updatePlayers", data);

    // Update ALL players
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        const updatedPos = data.playersPositions[player.name];
        if (updatedPos) {
          return {
            ...player,
            pixelX: updatedPos.pixelX,  // <-- CHANGED
            pixelY: updatedPos.pixelY,  // <-- CHANGED
            tileX: updatedPos.tileX,    // <-- CHANGED
            tileY: updatedPos.tileY,    // <-- CHANGED
          };
        }
        return player;
      })
    );

    // Also update the currentPlayer object if it’s you
    if (data.playersPositions[playerName()]) {
      const pos = data.playersPositions[playerName()];
      setCurrentPlayer((prev) => ({
        ...prev,
        pixelX: pos.pixelX,
        pixelY: pos.pixelY,
        tileX: pos.tileX,
        tileY: pos.tileY,
      }));
    }
  });

  socket.on("mapChange", (data) => {
    console.log("mapChange received", data);
    setMapTiles(data.map);
  });

  socket.on("lifeUpdate", (data) => {
    console.log("life Update", data);
    setPlayerLives(data.lives);
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
      `,
    }).childs(
      ...MapTiles(mapTiles(), tileSize, cols),
      ...PlayerDivs(players(), tileSize),
      BombDivs,
    ),
    gameOver() &&
      E("div", {
        class: "game-over-popup",
        style: `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 30px;
          border-radius: 10px;
          z-index: 9999;
          text-align: center;
          font-size: 24px;
        `,
      }).childs(
        "Game Over",
        E("div", { style: "margin-top: 10px; font-size: 16px;" }).childs(
          "Press any key to return to start"
        ),
        E("button", {
          class: "Mybtn",
          $click: () => {
            Myapp.setGlobalState("name", null);
            Myapp.navigate("/");
          },
        }).childs("restart")
      )
  );
}
