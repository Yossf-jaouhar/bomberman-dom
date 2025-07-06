import { E } from "../frameWork/DOM.js";

export default function MapTiles(tilesArray, tileSize, cols) {
  const TILE_WALL = 0;
  const TILE_BLOCK = 1;
  const TILE_EMPTY = 2;

  if (!Array.isArray(tilesArray)) {
    return []
  }

  return tilesArray.map((tile, i) => {
    let tileClass = "";
    if (tile === TILE_WALL) tileClass = "wall";
    else if (tile === TILE_BLOCK) tileClass = "block";
    else tileClass = "empty";

    return E("div", {
      class: `tile ${tileClass}`,
      key: i
    });
  });
}