import Myapp from "../helper/appInstance.js";

let socket;
export function connectWebSocket(nickname) {

  return new Promise((resolve, reject) => {
    socket = io(`http://${window.location.hostname}:3000`, {
      query: { name: nickname },
    });

    socket.on("connect", () => {
      const channel = new BroadcastChannel('bomberman');

      channel.postMessage("playerConnected");

      channel.onmessage = (event) => {
        if (event.data === "playerConnected") {
          socket.close()
          Myapp.navigate('/')
        }
      };

      console.log("Socket.IO connected as:", nickname);
      resolve(true);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection failed:", err);
      resolve(false);
    });

    socket.on("message", (data) => {
      console.log("Received:", data);
    });

    socket.on("disconnect", () => {
      Myapp.setGlobalState("name", "");
      socket.close();
      socket = null;
      location.reload()
    });
  });
}

export function isSocketConnected() {
  return !!(socket && socket.connected);
}
export function getSocket() {
  return socket;
}