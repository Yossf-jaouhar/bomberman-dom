import { E } from "../frameWork/DOM.js";

export default function GameHeader(name, lives) {
  return E("div", { class: "game-header" }).childs(
    E("div", { class: "player-name" }).childs(`${name}`),
    //power ups here
    E("div", { class: "player-lives" }).childs(`Lives: ${lives}`)
  );
}