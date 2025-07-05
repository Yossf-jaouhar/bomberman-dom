import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { getSocket, isSocketConnected } from "../ws/wsHandler.js";
import chat from "./chat.js";
let listeningOn = false;
export default function Lobby() {
  if (!isSocketConnected()) {
    Myapp.navigate("/");
    return;
  }
  const socket = getSocket();

  let [nOfPlayers, setNoOfPlayers] = Myapp.useState(1);
  let [counter, setCounter] = Myapp.useState(null);
  let [roomState, setRoomState] = Myapp.useState("solo");

  let intervalId = null;

  if (!listeningOn) {

    socket.on("waiting", (data) => {
      setRoomState("waiting");
      setCounter(data.Counter);
      setNoOfPlayers(data.nofplayers);
    });

    socket.on("preparing", (data) => {
      setRoomState("preparing");
      setCounter(data.counter);
    });

    socket.on("playerJoined", (data) => {});

    socket.on("Start", () => {
      Myapp.navigate("/game");
    });

    return E("div", { class: "LobbyPage df fc gp16 center" }).childs(
      E("div", { class: "LobbyState df center gp24" }).childs(
        E("div", { class: "df fc gp8 center" }).childs(
          E("h1", {}).childs(`${nOfPlayers()}/4`),
          E("p", {}).childs(`players`)
        ),
        E("div", { class: "df fc gp8 center" }).childs(
          counter() != null ? E("h1", {}).childs(`${counter()} s`) : "",
          E("p", {}).childs(`${roomState()}`)
        )
      ),
      chat
    );
  }
}
