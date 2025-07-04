import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { connectWebSocket, getSocket } from "../ws/wsHandler.js";
import PlayerDivs from "./player.js";
import MapTiles from "./mapTiles.js";
import GameHeader from "./header.js";
import usePlayerMovement, { cleanupPlayerMovement } from "../helper/movement.js";
import BombDivs from "./bom.js";
import registerWSListeners from "../ws/wsListeners.js";
import { pendingState } from "../helper/wsData.js";


export default function Game() {
  let socket = getSocket();
  if (!socket) {
    // connectWebSocket("chakir");
    // socket = getSocket();
    Myapp.navigate("/")
    return
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
  const [bombs, setBombs] = Myapp.useState([]);
  const [explosions, setExplosions] = Myapp.useState([]);
  const [speed, setSpeed] = Myapp.useState(2);
  const [maxBombs, setMaxBoms] = Myapp.useState(3);
  const [explosionRange, setExplosionRange] = Myapp.useState(4);
  const [powerUps, setPowerUps] = Myapp.useState([]);
  console.log("inside powerups ", powerUps());

  usePlayerMovement();





  registerWSListeners()

  function gameRenderLoop() {
    if (pendingState.bombsPlaced.length > 0) {
      setBombs((prev) => [
        ...prev,
        ...pendingState.bombsPlaced.map((data) => ({
          x: data.x,
          y: data.y,
          owner: data.owner,
        })),
      ]);
      pendingState.bombsPlaced = [];
    }

    while (pendingState.bombsExploded.length > 0) {
      const data = pendingState.bombsExploded.shift();
      const bomb = data.bomb;

      // remove bomb
      setBombs((prev) =>
        prev.filter(
          (b) => !(b.x === bomb.x && b.y === bomb.y && b.owner === bomb.owner)
        )
      );

      // add explosion
      setExplosions((prev) => {
        const destroyed = data.destroyedBlocks.map((block) => ({
          x: block.x,
          y: block.y,
          owner: bomb.owner
        }));
        return [
          ...prev,
          { x: bomb.x, y: bomb.y, owner: bomb.owner },
          ...destroyed
        ];
      });

      // clear explosion after 100ms
      setTimeout(() => {
        setExplosions((prev) =>
          prev.filter(
            (e) =>
              !(
                e.x === bomb.x &&
                e.y === bomb.y &&
                e.owner === bomb.owner
              ) &&
              !data.destroyedBlocks.some((dt) => dt.x === e.x && dt.y === e.y)
          )
        );
      }, 100);
    }


    if (pendingState.explosionsFullUpdate) {
      setExplosions(pendingState.explosionsFullUpdate.explosions);
      pendingState.explosionsFullUpdate = null;
    }

    if (pendingState.gameStart) {
      applyGameStart(pendingState.gameStart);
      pendingState.gameStart = null;
    }


    if (pendingState.playerData) {
      applyPlayerData(pendingState.playerData);
      pendingState.playerData = null;
    }


    if (pendingState.updatePlayers) {
      applyUpdatePlayers(pendingState.updatePlayers);
      pendingState.updatePlayers = null;
    }


    if (pendingState.mapChange) {
      setMapTiles(pendingState.mapChange.map);
      pendingState.mapChange = null;
    }


    if (pendingState.lifeUpdate) {
      setPlayerLives(pendingState.lifeUpdate.lives);
      pendingState.lifeUpdate = null;
    }


    if (pendingState.playerDied) {
      applyPlayerDied(pendingState.playerDied);
      pendingState.playerDied = null;
    }

    //powerUps
    if (Object.keys(pendingState.powerUps).length != 0) {
      setPowerUps((prev) => [...prev, pendingState.powerUps]);
      pendingState.powerUps = {};
    }

    if (pendingState.powerUpPicked) {
      const { x, y, type, newValue } = pendingState.powerUpPicked;

      setPowerUps((prev) =>
        prev.filter((p) => !(p.x === x && p.y === y))
      );

      switch (type) {
        case "Speed":
          setSpeed(newValue);
          break;

        case "Bomb":
          setMaxBoms(newValue);
          break;

        case "Flame":
          setExplosionRange(newValue);
          break;

        default:
          console.warn(`Unknown power-up type: ${type}`);
          break;
      }

      pendingState.powerUpPicked = null;
    }





    requestAnimationFrame(gameRenderLoop);
  }


  requestAnimationFrame(gameRenderLoop);





  function PowerUpDivs(powerUps, tileSize) {
    return powerUps.map((p, index) =>
      E("div", {
        class: `power-up ${p.type}`,
        style: `
        left: ${p.x * tileSize + 8}px;
        top: ${p.y * tileSize + 8}px;
      `,
        key: `powerup-${p.x}-${p.y}-${index}`,
      })
    );
  }



  function applyGameStart(data) {
    setMapTiles(data.map);

    const playersArray = Object.entries(data.players).map(([name, info]) => ({
      name,
      pixelX: info.x * tileSize,
      pixelY: info.y * tileSize,
      tileX: info.x,
      tileY: info.y,
      avatar: info.avatar?.replace(".png", "") || "",
    }));


    setPlayers(playersArray);
  }


  function applyPlayerData(data) {

    setPlayerName(data.name);
    setPlayerLives(data.lives);
    setSpeed(data.speed)
    setMaxBoms(data.maxBombs)
    setExplosionRange(data.explosionRange)
    setCurrentPlayer({
      name: data.name,
      lives: data.lives,
      maxBombs: data.maxBombs,
      explosionRange: data.explosionRange,
      speed: data.speed,
      avatar: data.avatar,
      pixelX: data.position.x * tileSize,
      pixelY: data.position.y * tileSize,
      tileX: data.position.x,
      tileY: data.position.y,
    });
  }


  function applyUpdatePlayers(data) {
    setPlayers((prevPlayers = []) => {
      const updatedPlayers = [];

      const incomingNames = Object.keys(data.playersPositions);

      const playerMap = new Map(prevPlayers.map(p => [p.name, p]));

      for (const name of incomingNames) {
        const pos = data.playersPositions[name];
        const existing = playerMap.get(name);

        if (existing) {
          updatedPlayers.push({
            ...existing,
            pixelX: pos.pixelX,
            pixelY: pos.pixelY,
            tileX: pos.tileX,
            tileY: pos.tileY,
          });
        } else {
          updatedPlayers.push({
            name,
            pixelX: pos.pixelX,
            pixelY: pos.pixelY,
            tileX: pos.tileX,
            tileY: pos.tileY,
          });
        }
      }

      return updatedPlayers;
    });

    const pos = data.playersPositions[playerName()];
    if (pos) {
      setCurrentPlayer((prev) => ({
        ...prev,
        pixelX: pos.pixelX,
        pixelY: pos.pixelY,
        tileX: pos.tileX,
        tileY: pos.tileY,
      }));
    }
  }



  function applyPlayerDied(data) {
    setPlayers((prevPlayers) =>
      prevPlayers.filter((p) => p.name !== data.name)
    );
    if (data.name === playerName()) {
      socket.close();
      setGameOver(true);
    }
  }





  return E("div", { class: "game-screen" }).childs(
    GameHeader(playerName(), playerLives(), speed(), maxBombs(), explosionRange()),
    E("div", {
      class: "map-grid",
    }).childs(
      ...MapTiles(mapTiles() || [], tileSize, cols),
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
            cleanupPlayerMovement();
            Myapp.navigate("/");
          },
        }).childs("restart")
      )
      : null
  );

}

