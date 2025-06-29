import { E } from "../frameWork/DOM.js";

export default function BombDivs(bombs, tileSize) {
  return bombs.map(bomb =>
    E("div", {
      class: `bomb owner-${bomb.owner}`,
      style: `
        width: ${tileSize}px;
        height: ${tileSize}px;
        position: absolute;
        top: ${bomb.y * tileSize}px;
        left: ${bomb.x * tileSize}px;
        background: url('../images/bom.png') center/contain no-repeat;
        z-index: 5;
      `
    })
  );
}
