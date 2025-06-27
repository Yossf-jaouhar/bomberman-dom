import { E } from "../frameWork/DOM.js";

export function renderMap(mapData) {
  const { rows, columns, tileSize, tiles } = mapData;

  const container = E("div", {
    id: "map-container",
    style: `position: relative; width: ${columns * tileSize} px; height: ${rows * tileSize} px;`
  });

  for (let i = 0; i < tiles.length; i++) {
    const type = tiles[i];
    const x = i % columns;
    const y = Math.floor(i / columns);

    let color = type === 0 ? "gray" : type === 1 ? "brown" : "green";

    const tile = E("div", {
      class: "tile",
      style: `
        width: ${tileSize} px;
        height: ${tileSize} px;
        background: ${color};
        position: absolute;
        left: ${x * tileSize} px;
        top: ${y * tileSize} px;
      `
    });

    container.children.push(tile);
  }

  return container;
}


// export function extractPlayersFromMap(map) {
//   const players = [];
//   for (let y = 0; y < map.tiles.length; y++) {
//     for (let x = 0; x < map.tiles[y].length; x++) {
//       if (map.tiles[y][x] === 2) {
//         players.push({
//           id: `player${players.length + 1}`,
//           x,
//           y,
//           color: players.length === 0 ? "red" : "blue"
//         });
//         map.tiles[y][x] = 1; // replace with floor
//       }
//     }
//   }
//   return players;
// }
