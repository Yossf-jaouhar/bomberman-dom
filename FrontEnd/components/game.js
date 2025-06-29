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
  const [bombs, setBombs] = Myapp.useState([]);
  const [explosions, setExplosions] = Myapp.useState([]);

  // Plug in the movement hook
  usePlayerMovement(currentPlayer, setPlayers);

  socket.off("gameStart");
  socket.off("playerData");
  socket.off("updatePlayers");
  socket.off("bombPlaced");
  socket.off("bombExploded");


  socket.on("gameStart", (data) => {
    console.log("gameStart", data);
    setMapTiles(data.map);

    const playersArray = Object.entries(data.players).map(([name, info]) => ({
      name,
      x: info.x,
      y: info.y,
      avatar: info.avatar?.replace(".png", "") || "",
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
      position: data.position,
    });
  });

  socket.on("updatePlayers", (data) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        const updatedPos = data.playersPositions[player.name];
        if (updatedPos) {
          return {
            ...player,
            x: updatedPos.x,
            y: updatedPos.y,
          };
        }
        return player;
      })
    );
  });
  socket.on("bombPlaced", (data) => {
    console.log("Bomb placed:", data);
    setBombs((prev) => [...prev, {
      x: data.x,
      y: data.y,
      owner: data.owner
    }]);
  });

  socket.on("bombExploded", (data) => {
    console.log("Bomb exploded:", data);

    const { bomb, updatedMap } = data;

    // Remove the exploded bomb
    setBombs([]);

    // Set explosion tiles
    setExplosions((prev) => [
      ...prev,
      { x: bomb.x, y: bomb.y }
    ]);
    
    
    setTimeout(() => {
      setExplosions([]);
      console.log(explosions());
    }, 100);

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
      ...BombDivs(bombs(), tileSize),
      ...explosions().map(exp =>
        E("div", {
          class: "explosion",
          style: `
      width: ${tileSize}px;
      height: ${tileSize}px;
      position: absolute;
      top: ${exp.y * tileSize}px;
      left: ${exp.x * tileSize}px;
      background: url('../images/explosion.png');
      opacity: 0.8;
      z-index: 6;
    `
        }))
      )
    );
}
