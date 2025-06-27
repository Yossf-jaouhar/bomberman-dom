import { Map } from "./map.js"

export function createGameMap() {
  let map = new Map(15, 15, 32)

  map.generateMap()
  return {
    rows: map.rows,
    columns: map.columns,
    tileSize: map.tileSize,
    tiles: map.tiles,
  }
}
