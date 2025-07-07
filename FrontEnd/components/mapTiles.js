import { E } from "../frameWork/DOM.js";

export default function MapTiles(tilesArray) {

  if (!Array.isArray(tilesArray)) {
    return []
  }
  
  return tilesArray.map((tile, i) => {
    let tileClass = "";
    if (tile === 0) tileClass = "wall";
    else if (tile === 1) tileClass = "block";
    else tileClass = "empty";

    return E("div", {
      class: `tile ${tileClass}`,
      key: i
    });
  });
}