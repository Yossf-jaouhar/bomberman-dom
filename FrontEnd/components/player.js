import { E } from "../frameWork/DOM.js";

export default function PlayerDivs(players, tileSize) {
  return players.map((player) =>
    E("div", {
      class: `player player-${player.name} ${player.avatar}`,
      key :  `player ${player.avatar}`,
      style: `
        width: ${tileSize}px;
        height: ${tileSize}px;
        position: absolute;
        left: ${player.pixelX}px;    // <-- CHANGED
        top: ${player.pixelY}px;     // <-- CHANGED
        background-image: url('./images/${player.avatar}.png');
        background-size: contain;
        background-repeat: no-repeat;
      `,
    })
    
  );
}
