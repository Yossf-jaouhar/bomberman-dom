import { renderMap } from "../components/map.js";
import Myapp from "../helper/appInstance.js";

let socket;

export function connectWebSocket(nickname) {
  socket = io("http://localhost:3000", {
    query: { name: nickname },
  });

  socket.on("connect", () => {
    console.log("Socket.IO connected as:", nickname);
    socket.emit("requestMap")
  });

  socket.on("message", (data) => {
    console.log("Received:", data);
  });

  socket.on('mapData', (mapData) => {
    console.log('helooo');

    console.log('map li wslat', mapData);
    let mapComponent = renderMap(mapData)

    Myapp.root.appendChild(mapComponent)

  })

  socket.on("disconnect", () => {
    console.log("Socket.IO disconnected");
  });

  return socket;
}

export function getSocket() {
  return socket;
}