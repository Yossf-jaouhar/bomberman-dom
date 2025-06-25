import { E } from "../frameWork/DOM.js";
import Myapp from "../helper/appInstance.js";
import { getSocket } from "../ws/wsHandler.js";
import chat from "./chat.js";
export default function Lobby() {
    let name = Myapp.getGlobalState('name');
    if (!name) {
        Myapp.navigate('/');
        return
    }
    const socket = getSocket()
    let [nOfPlayers, setNoOfPlayers] = Myapp.useState(1);
    let [counter, setCounter] = Myapp.useState(5);
    let [roomState, setRoomState] = Myapp.useState("solo")
    let intervalId = null;

    socket.on("joined", (data) => {
        setNoOfPlayers(data.nofPlayers)
        setCounter(data.Counter)
        setRoomState(data.RoomState)
        if (data.RoomState === "waiting" || data.RoomState === "preparing") {
            if (intervalId) {
                clearInterval(intervalId);
            }
            intervalId = setInterval(() => {
                let current = counter();
                if (current > 1) {
                    setCounter(current - 1);
                } else {
                    setCounter(0);
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }, 1000);
        } else {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
    });
    return E('div', { class: 'LobbyPage df fc gp16 center' }).childs(

        //lobby State
        E('div', { class: 'LobbyState df center gp24' }).childs(
            E('div', { class: 'df fc gp8 center' }).childs(
                E('h1', {}).childs(`${nOfPlayers()}/4`),
                E('p', {}).childs(`players`)
            ),
            E('div', { class: 'df fc gp8 center' }).childs(
                E('h1', {}).childs(`${counter()} s `),
                E('p', {}).childs(`${roomState()}`),
            )
        ),

        //chat
        chat
    )
}