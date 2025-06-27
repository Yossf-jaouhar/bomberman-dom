import { extractPlayersFromMap, renderMap } from "./map.js"
import { tileMap, mapData } from "./tileMap.js"


const mapInstance = new tileMap(mapData)
const players = extractPlayersFromMap(mapInstance)

export function GamePlay() {
  return renderMap(mapInstance, players)
}
