import { E } from "../frameWork/DOM.js";

export default function PlayerDivs(players, tileSize) {
  return players.map((p) => {
    const left = p.x * tileSize;
    const top = p.y * tileSize;

    return E("div", {
      class: `player ${p.avatar}`,
      style: `
        position: absolute;
        left: ${left}px;
        top: ${top}px;
        width: ${tileSize}px;
        height: ${tileSize}px;
      `,
      key: p.name
    });
  });
}