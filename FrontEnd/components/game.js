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


 usePlayerMovement();




 const pendingState = {
   gameStart: null,
   playerData: null,
   updatePlayers: null,
   mapChange: null,
   lifeUpdate: null,
   playerDied: null,
 };


 socket.off("gameStart");
 socket.off("playerData");
 socket.off("updatePlayers");
 socket.off("bombPlaced");
 socket.off("bombExploded");
 socket.off("mapChange");
 socket.off("playerDied");
 socket.off("lifeUpdate");


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




 function gameRenderLoop() {


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


   requestAnimationFrame(gameRenderLoop);
 }


 requestAnimationFrame(gameRenderLoop);




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
     BombDivs
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
