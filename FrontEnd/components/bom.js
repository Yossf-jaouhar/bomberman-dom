import { E } from "../frameWork/DOM.js";

export default function BombDivs(bombs = [], explosions = []) {
  const safeBombs = Array.isArray(bombs) ? bombs : [];
  const safeExplosions = Array.isArray(explosions) ? explosions : [];

  const bombDivs = safeBombs.map((bomb, i) =>
    E("div", {
      key: `bomb-${bomb.owner}-${bomb.x}-${bomb.y}-${i}`,
      class: `bomb owner-${bomb.owner}`,
      style: `
        width: 40px;
        height: 40px;
        position: absolute;
        transform: translate(${bomb.x * 40}px, ${bomb.y * 40}px);
        background: url('../images/bom.png') center/contain no-repeat;
        z-index: 5;
      `,
    })
  );

  const explosionDivs = safeExplosions.map((explosion, i) =>
    E("div", {
      key: `explosion-${explosion.owner}-${explosion.x}-${explosion.y}-${i}`,
      class: `explosion owner-${explosion.owner}`,
      style: `
        width: 40px;
        height: 40px;
        position: absolute;
        transform: translate(${explosion.x * 40}px, ${explosion.y * 40}px);
        background: url('${i === 0 ? '../images/Preview.gif': '../images/explosion.png' }') center/contain no-repeat;
        z-index: 6;
      `,
    })
  );

  return [...bombDivs, ...explosionDivs];
}
