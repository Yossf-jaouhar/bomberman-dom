import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { connectWebSocket, getSocket } from "../ws/wsHandler.js";
import PlayerDivs from "./player.js";
import MapTiles from "./mapTiles.js";
import GameHeader from "./header.js";
import usePlayerMovement, { cleanupPlayerMovement } from "../helper/movement.js";
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
  const [bombs, setBombs] = Myapp.useState([]);
  const [explosions, setExplosions] = Myapp.useState([]);

  const [powerUps, setPowerUps] = Myapp.useState([]);


  usePlayerMovement();




  const pendingState = {
    gameStart: null,
    playerData: null,
    updatePlayers: null,
    mapChange: null,
    lifeUpdate: null,
    playerDied: null,
    powerUps: null,
    bombsPlaced: [],
    bombsExploded: [],
    explosionsFullUpdate: null,
    powerUpPicked: null,
  };


  socket.off("gameStart");
  socket.off("playerData");
  socket.off("updatePlayers");
  socket.off("bombPlaced");
  socket.off("bombExploded");
  socket.off("mapChange");
  socket.off("playerDied");
  socket.off("lifeUpdate");
  socket.off("explosionsUpdate");
  socket.off("powerUpPicked");
  socket.off("powerUpSpawned");


  socket.on("bombPlaced", (data) => {
    pendingState.bombsPlaced.push(data);
  });

  socket.on("bombExploded", (data) => {
    pendingState.bombsExploded.push(data);
  });

  socket.on("explosionsUpdate", (data) => {
    pendingState.explosionsFullUpdate = data;
  });

  socket.on("gameStart", (data) => {
    pendingState.gameStart = data;
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

  socket.on('powerUpSpawned', (data) => {
    pendingState.powerUps = data
  })

  socket.on("powerUpPicked", (data) => {
    pendingState.powerUpPicked = data;
  });





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

    if (pendingState.bombsExploded.length > 0) {
      for (const data of pendingState.bombsExploded) {
        const bomb = data.bomb;

        // remove bomb
        setBombs((prev) =>
          prev.filter(
            (b) =>
              !(
                b.x === bomb.x &&
                b.y === bomb.y &&
                b.owner === bomb.owner
              )
          )
        );

        // add explosion
        setExplosions((prev) => [
          ...prev,
          {
            x: bomb.x,
            y: bomb.y,
            owner: bomb.owner,
          },
        ]);

        // clear explosion after 100ms
        setTimeout(() => {
          setExplosions((prev) =>
            prev.filter(
              (e) =>
                !(
                  e.x === bomb.x &&
                  e.y === bomb.y &&
                  e.owner === bomb.owner
                )
            )
          );
        }, 100);
      }
      pendingState.bombsExploded = [];
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
    if (pendingState.powerUps) {
      console.log("powers", pendingState.powerUps);

      applyPowerUps(pendingState.powerUps);
      pendingState.powerUps = null;
    }

    if (pendingState.powerUpPicked) {
      const { x, y } = pendingState.powerUpPicked;
      setPowerUps((prev) =>
        prev.filter((p) => !(p.x === x && p.y === y))
      );
      pendingState.powerUpPicked = null;
    }




    requestAnimationFrame(gameRenderLoop);
  }


  requestAnimationFrame(gameRenderLoop);



  function applyPowerUps(data) {
    console.log("powerUpSpawned", data);
    setPowerUps((prev) => {
      const existing = prev.filter((p) => !(p.x === data.x && p.y === data.y));
      return [...existing, data];
    });
  }

  function PowerUpDivs(powerUps, tileSize) {
    return powerUps.map((p, index) =>
      E("div", {
        class: `power-up ${p.type}`, //power-up-bomb, power-up-speed
        style: `
        position: absolute;
        left: ${p.x * tileSize}px;
        top: ${p.y * tileSize}px;
        width: ${tileSize}px;
        height: ${tileSize}px;
      `,
        key: `powerup-${p.x}-${p.y}-${index}`,
      })
    );
  }

  function pickPowerUps() {

  }



  function applyGameStart(data) {
    console.log("gameStart", data);


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
    console.log("playerData", data);


    setPlayerName(data.name);
    setPlayerLives(data.lives);
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
    console.log("updatePlayers", data);


    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        const updatedPos = data.playersPositions[player.name];
        if (updatedPos) {
          return {
            ...player,
            pixelX: updatedPos.pixelX,
            pixelY: updatedPos.pixelY,
            tileX: updatedPos.tileX,
            tileY: updatedPos.tileY,
          };
        }
        return player;
      })
    );


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
  }


  function applyPlayerDied(data) {
    console.log("playerDied", data);
    setPlayers((prevPlayers) =>
      prevPlayers.filter((p) => p.name !== data.name)
    );
    if (data.name === playerName()) {
      socket.close();
      setGameOver(true);
    }
  }





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
      ...BombDivs(bombs(), explosions()),
      ...PowerUpDivs(powerUps(), tileSize)
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
          cleanupPlayerMovement()
          Myapp.navigate("/");
        },
      }).childs("restart")
    )
  );
}

