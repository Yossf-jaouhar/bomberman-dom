import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { getSocket } from "../ws/wsHandler.js";
import PlayerDivs from "./player.js";
import MapTiles from "./mapTiles.js";
import GameHeader from "./header.js";
import usePlayerMovement, {
  cleanupPlayerMovement,
} from "../helper/movement.js";
import BombDivs from "./bom.js";
import registerWSListeners from "../ws/wsListeners.js";
import { pendingState } from "../helper/wsData.js";

import {
  applyGameStart,
  applyUpdatePlayers,
  handlePlayerDied,
  handleWin,
  handleBombsPlaced,
  handleBombsExploded,
  handleExplosionsFullUpdate,
  handleMapChange,
  handleLifeUpdate,
  handlePowerUps,
  handlePowerUpPicked,
  handleRemovePowerUp,
} from "../helper/stateUpdaters.js";
let isR =  false
export default function Game() {
  let socket = getSocket();
  if (!socket) {
    Myapp.navigate("/");
    return;
  }

  const tileSize = 40;

  const [mapTiles, setMapTiles] = Myapp.useState([]);
  const [players, setPlayers] = Myapp.useState([]);
  const [playerName, setPlayerName] = Myapp.useState("");
  const [playerLives, setPlayerLives] = Myapp.useState(3);
  const [gameOver, setGameOver] = Myapp.useState(false);
  const [gameWin, setGameWin] = Myapp.useState(false);
  const [bombs, setBombs] = Myapp.useState([]);
  const [explosions, setExplosions] = Myapp.useState([]);
  const [speed, setSpeed] = Myapp.useState(3);
  const [maxBombs, setMaxBoms] = Myapp.useState(3);
  const [explosionRange, setExplosionRange] = Myapp.useState(3);
  const [powerUps, setPowerUps] = Myapp.useState([]);

  registerWSListeners();
  usePlayerMovement();

  function gameRenderLoop() {
    console.log("raf working ...");

    if (Object.keys(pendingState.playerDied).length > 0) {
      handlePlayerDied(
        pendingState,
        playerName,
        setPlayers,
        setGameOver,
        setBombs,
        setExplosions,
        cleanupPlayerMovement
      );
    }

    if (Object.keys(pendingState.win).length > 0) {
      handleWin(
        pendingState,
        setPlayers,
        cleanupPlayerMovement,
        setGameWin
      );
    }

    if (pendingState.bombsPlaced.length > 0) {
      handleBombsPlaced(pendingState, setBombs);
    }

    handleBombsExploded(pendingState, setBombs, setExplosions);

    if (pendingState.explosionsFullUpdate) {
      handleExplosionsFullUpdate(pendingState, setExplosions);
    }

    if (pendingState.gameStart) {
      applyGameStart(
        pendingState.gameStart,
        setMapTiles,
        setPlayers,
        tileSize
      );
      pendingState.gameStart = null;
    }

    if (pendingState.playerData) {
      setPlayerName(pendingState.playerData.name);
      setPlayerLives(pendingState.playerData.lives);
      setSpeed(pendingState.playerData.speed);
      setMaxBoms(pendingState.playerData.maxBombs);
      setExplosionRange(pendingState.playerData.explosionRange);
      pendingState.playerData = null;
    }

    if (pendingState.updatePlayers) {
      applyUpdatePlayers(pendingState.updatePlayers, setPlayers);
      pendingState.updatePlayers = null;
    }

    if (pendingState.mapChange) {
      handleMapChange(pendingState, setMapTiles);
    }

    if (pendingState.lifeUpdate) {
      handleLifeUpdate(pendingState, setPlayerLives);
    }

    if (Object.keys(pendingState.powerUps).length !== 0) {
      handlePowerUps(pendingState, setPowerUps);
    }

    if (pendingState.powerUpPicked) {
      handlePowerUpPicked(
        pendingState,
        setPowerUps,
        setSpeed,
        setMaxBoms,
        setExplosionRange
      );
    }

    if (pendingState.removePowerUp) {
      handleRemovePowerUp(pendingState, setPowerUps);
    }
    if (gameOver() || gameWin()) {
      console.log("cleaning the movement ...");
      setPowerUps([])
      cleanupPlayerMovement()
      console.log("Game over — stopping animation loop.");
      return;
    }
    requestAnimationFrame(gameRenderLoop);
  }
  function PowerUpDivs(powerUps, tileSize) {
    return powerUps.map((p, index) =>
      E("div", {
        class: `power-up ${p.type}`,
        style: `
          transform: translate(${p.x * tileSize + 8}px, ${p.y * tileSize + 8}px);
          position: absolute;
        `,
        key: `powerup-${p.x}-${p.y}-${index}`,
      })
    );
  }
  if (!isR) {
    isR =  true
    requestAnimationFrame(gameRenderLoop);
  }
  return E("div", { class: "game-screen" }).childs(
    GameHeader(
      playerName(),
      playerLives(),
      speed(),
      maxBombs(),
      explosionRange()
    ),
    E("div", {
      class: "map-grid",
    }).childs(
      ...MapTiles(mapTiles() || []),
      ...PlayerDivs(players() || [], tileSize),
      ...BombDivs(bombs(), explosions()),
      ...PowerUpDivs(powerUps() || [], tileSize)
    ),
    gameOver()
      ? E("div", {
        class: "game-over-popup",
      }).childs(
        "Game Over",
        E("div", { class: "childtxt" }).childs(
          "Press any key to return to start"
        ),
        E("button", {
          class: "Mybtn",
          $click: () => {
            Myapp.setGlobalState("name", null);
            setGameOver(false);
            setGameWin(false);
            socket.close();
          },
        }).childs("restart")
      )
      : null,
    gameWin()
      ? E("div", {
        class: "game-over-popup",
      }).childs(
        "🎉 You Win! 🎉",
        E("div", { class: "childtxt" }).childs("Great job, champ!"),
        E("button", {
          class: "Mybtn",
          $click: () => {
            Myapp.setGlobalState("name", null);
            setGameOver(false);
            setGameWin(false);
            socket.close();
          },
        }).childs("Play Again")
      )
      : null
  );
}
