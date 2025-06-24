const { Server } = require("socket.io");
const { game } = require("../Game/game");
const { default: JoinRoom } = require("../Game/players");

function setupSocketIO(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {

    // New Player
    JoinRoom(socket, socket.request);

    // Receive messages
    socket.on("message", (message) => {
      console.log(`[${name}]: ${message}`);
      // Echo or broadcast to room
      socket.emit("message", `Server received: ${message}`);
    });

    // When client disconnects
    socket.on("disconnect", () => {
      room.removePlayer(name);
      console.log(
        `Client disconnected: ${name} left the room. Remaining players: ${room.players.length}`
      );
    });
  });
}

module.exports = setupSocketIO;
