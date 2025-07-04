import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { getSocket, isSocketConnected } from "../ws/wsHandler.js";
import chat from "./chat.js";
let listeningOn = false
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

  function startCountdown(startValue) {
    setCounter(startValue);
    let currentValue = startValue;

    if (intervalId) {
      clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
      currentValue -= 1;
      if (currentValue > 0) {
        setCounter(currentValue);
      } else {
        setCounter(0);
        clearInterval(intervalId);
        intervalId = null;
      }
    }, 1000);
  }

  if (!listeningOn) {
    socket.on("joined", (data) => {
      console.log('waiting ' , data);
      setNoOfPlayers(data.nofPlayers);
      setCounter(data.Counter);
      setRoomState(data.RoomState);
      if (data.Counter != null) {
        startCountdown(data.Counter);
      }
    });

    socket.on("waiting", (data) => {
      console.log('waiting ' , data);
      setRoomState("waiting");
      setCounter(data.Counter);
      if (data.Counter != null) {
        startCountdown(data.Counter);
      }
    });

    socket.on("preparing", (data) => {
      console.log('Preparing ' , data);
      setRoomState("preparing");
      setCounter(data.counter);

      if (data.counter != null) {
        startCountdown(data.counter);
      }
    });
    listeningOn = true
  }

  return E("div", { class: "LobbyPage df fc gp16 center" }).childs(
    E("div", { class: "LobbyState df center gp24" }).childs(
      E("div", { class: "df fc gp8 center" }).childs(
        E("h1", {}).childs(`${nOfPlayers()}/4`),
        E("p", {}).childs(`players`)
      ),
      E("div", { class: "df fc gp8 center" }).childs(
        counter() != null
          ? E("h1", {}).childs(`${counter()} s`)
          : "",
        E("p", {}).childs(`${roomState()}`)
      )
    ),
    chat
  );
}