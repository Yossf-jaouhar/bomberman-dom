import Myapp from "../helper/appInstance.js";

let socket;
export function connectWebSocket(nickname) {
  
  return new Promise((resolve, reject) => {
    socket = io(`http://${window.location.hostname}:3000`, {
      query: { name: nickname },
    });

    socket.on("connect", () => {
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
      Myapp.navigate('/');
      console.log("Socket.IO disconnected");
    });
  });
}

export function isSocketConnected() {
  return !!(socket && socket.connected);
}
export function getSocket() {
  let help = false
  if ( !socket && !help ) {
    location.reload()
    help = true
  }
  return socket;
}