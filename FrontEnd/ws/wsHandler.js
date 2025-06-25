
let socket;

export function connectWebSocket(nickname) {
  socket = io("http://localhost:3000", {
    query: { name: nickname },
  });

  socket.on("connect", () => {
    console.log("Socket.IO connected as:", nickname);
  });

  socket.on("message", (data) => {
    console.log("Received:", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO disconnected");
  });

  return socket;
}

export function getSocket() {
  return socket;
}