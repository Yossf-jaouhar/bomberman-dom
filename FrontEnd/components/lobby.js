import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { getSocket } from "../ws/wsHandler.js";
import chat from "./chat.js";

export default function Lobby() {
    let name = Myapp.getGlobalState("name");
    if (!name) {
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
    socket.off("joined");
    socket.off("waiting");
    socket.off("preparing");

    // ---- Event Listeners ----
    socket.on("joined", (data) => {
        console.log(data);
        setNoOfPlayers(data.nofPlayers);
        setCounter(data.Counter);
        setRoomState(data.RoomState);

        if (data.RoomState === "waiting" || data.RoomState === "preparing") {
            startCountdown(data.Counter);
        }
    });

    socket.on("waiting", (data) => {
        console.log("waiting received" , data);
        setRoomState("waiting");
        setNoOfPlayers(2)
        startCountdown(data.Counter);
    });

    socket.on("preparing", (data) => {
        console.log("preparing received" , data);
        setRoomState("preparing");
        startCountdown(data.counter);
    });

    return E("div", { class: "LobbyPage df fc gp16 center" }).childs(
        E("div", { class: "LobbyState df center gp24" }).childs(
            E("div", { class: "df fc gp8 center" }).childs(
                E("h1", {}).childs(`${nOfPlayers()}/4`),
                E("p", {}).childs(`players`)
            ),
            E("div", { class: "df fc gp8 center" }).childs(
                E("h1", {}).childs(`${counter()} s`),
                E("p", {}).childs(`${roomState()}`)
            )
        ),
        chat
    );
}
