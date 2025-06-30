import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { getSocket } from "../ws/wsHandler.js";

export default function BombDivs() {
  const [bombs, setBombs] = Myapp.useState([]);
  const [explosions, setExplosions] = Myapp.useState([]);

  const socket = getSocket();

  socket.on("bombPlaced", (data) => {
    console.log("Bomb placed:", data);
    setBombs((prev) => [
      ...prev,
      {
        x: data.x,
        y: data.y,
        owner: data.owner,
      },
    ]);
  });

  socket.on("bombExploded", (data) => {
    console.log("Bomb exploded:", data);

    const { bomb } = data;

    // Remove this bomb from the bombs array
    setBombs((prev) =>
      prev.filter(
        (b) => !(b.x === bomb.x && b.y === bomb.y && b.owner === bomb.owner)
      )
    );

    // Add an explosion div
    setExplosions((prev) => [
      ...prev,
      {
        x: bomb.x,
        y: bomb.y,
        owner: bomb.owner,
      },
    ]);

    // Clear the explosion after 100ms
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
  });

  console.log("before render", bombs());

  // Render bombs
  const bombDivs = bombs().map((bomb, i) =>
    E("div", {
      key: `bomb-${bomb.owner}-${bomb.x}-${bomb.y}-${i}`,
      class: `bomb owner-${bomb.owner}`,
      style: `
        width: 40px;
        height: 40px;
        position: absolute;
        top: ${bomb.y * 40}px;
        left: ${bomb.x * 40}px;
        background: url('../images/bom.png') center/contain no-repeat;
        z-index: 5;
      `,
    })
  );

  // Render explosions
  const explosionDivs = explosions().map((explosion, i) =>
    E("div", {
      key: `explosion-${explosion.owner}-${explosion.x}-${explosion.y}-${i}`,
      class: `explosion owner-${explosion.owner}`,
      style: `
        width: 40px;
        height: 40px;
        position: absolute;
        top: ${explosion.y * 40}px;
        left: ${explosion.x * 40}px;
        background: url('../images/explosion.png') center/contain no-repeat;
        z-index: 6;
      `,
    })
  );

  return [...bombDivs, ...explosionDivs];
}