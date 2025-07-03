import { E } from "../frameWork/DOM.js";

export default function GameHeader(name, lives, speed, maxBombs, explosionRange) {
  return E("div", { class: "game-header" }).childs(
    E("div", { class: "player-name" }).childs(`${name}`),

    E("div", { class: "player-powerups" }).childs(
      powerUpIcon("../images/speedRapid.png", speed),
      powerUpIcon("../images/maxBomb.png", maxBombs),
      powerUpIcon("../images/flameRange.png", explosionRange)
    ),

    E("div", { class: "player-lives" }).childs(`Lives: ${lives}`)
  );
}

function powerUpIcon(imagePath, count) {
  return E("div", { class: "powerup-group" }).childs(
    E("div", {
      class: "powerup-icon",
      style: `
        width: 24px;
        height: 24px;
        background: url('${imagePath}') center/contain no-repeat;
        display: inline-block;
      `
    }),
    E("span", { class: "powerup-count" }).childs(`x ${count}`)
  );
}
