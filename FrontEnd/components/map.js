import { E } from "../frameWork/DOM.js";

export function renderMap(mapInstance, players) {
  const container = E("div", {
    id: "map-container",
    style: `position: relative; width: ${mapInstance.width * mapInstance.size}px; height: ${mapInstance.height * mapInstance.size}px;`
  });

  for (let y = 0; y < mapInstance.height; y++) {
    for (let x = 0; x < mapInstance.width; x++) {
      const type = mapInstance.tiles[y][x];
      let color = "";

      if (type === 0) color = "gray";   // wall
      if (type === 1) color = "green";  // floor
      if (type === 2) color = "green";  // spawn floor, still floor!

      const tile = E("div", {
        class: "tile",
        style: `
          width: ${mapInstance.size}px;
          height: ${mapInstance.size}px;
          background: ${color};
          position: absolute;
          left: ${x * mapInstance.size}px;
          top: ${y * mapInstance.size}px;
        `
      });

      container.children.push(tile);
    }
  }

  // players here
  for (const player of players) {
    const playerDiv = E("div", {
      class: "player",
      style: `
        width: ${mapInstance.size}px;
        height: ${mapInstance.size}px;
        background: ${player.color};
        position: absolute;
        left: ${player.x * mapInstance.size}px;
        top: ${player.y * mapInstance.size}px;
        border-radius: 10px;
        z-index: 1;
      `
    });

    container.children.push(playerDiv);
  }

  return container;
}

export function extractPlayersFromMap(map) {
  const players = [];
  for (let y = 0; y < map.tiles.length; y++) {
    for (let x = 0; x < map.tiles[y].length; x++) {
      if (map.tiles[y][x] === 2) {
        players.push({
          id: `player${players.length + 1}`,
          x,
          y,
          color: players.length === 0 ? "red" : "blue"
        });
        map.tiles[y][x] = 1; // replace with floor
      }
    }
  }
  return players;
}
