import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { getSocket, isSocketConnected } from "../ws/wsHandler.js";
import chat from "./chat.js";
let listeningOn = false;
let isStart = false;
export default function Lobby() {
  if (!isSocketConnected()) {
    Myapp.navigate("/");
    return;
  }
  const socket = getSocket();

  let [nOfPlayers, setNoOfPlayers] = Myapp.useState(1);
  let [counter, setCounter] = Myapp.useState(null);
  let [roomState, setRoomState] = Myapp.useState("solo");

  if (!listeningOn) {
    socket.on("waiting", (data) => {
      
      setRoomState("waiting");
      setCounter(data.Counter);
      setNoOfPlayers(data.nofplayers);
    });

    socket.on("preparing", (data) => {
      console.log("hi-->",data);  
      setRoomState("preparing");
      setCounter(data.counter);
      setNoOfPlayers(data.nofplayers);

    });

    socket.on("playerJoined", (data) => {});

    if (!isStart) {
      socket.on("Start", () => {
        Myapp.navigate("/game");
      });
      isStart = true;
    }
    listeningOn = true;
  }

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
