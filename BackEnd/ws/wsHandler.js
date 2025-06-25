const { Server } = require("socket.io");
const { game } = require("../Game/game");

function setupSocketIO(server) {
  console.log("Setting up Socket.IO...");

  const io = new Server(server);

  io.on("connection", (socket) => {



    // Join the game
    const name = socket.handshake.query.name;
    if (!name) {
      console.error("Name parameter is required.");
      socket.disconnect();
      return;
    }
    const room = game.join(name);
    console.log(`Client connected: ${name} joined room, ${room.players.length} player(s)`);
    socket.emit("joined", {
      RoomState: room.RoomState,
      nofPlayers: room.players.length,
      Counter: room.Counter,
      chatMessages: room.chatMessages
    });


    // Handle messages
    socket.on("message", (message) => {
      console.log(`[${name}]: ${message}`);
      socket.emit("message", `Server received: ${message}`);
    });



    // Handle disconnection
    socket.on("disconnect", () => {
      room.removePlayer(name);
      console.log(`👋 Client disconnected: ${name} left room ${room.id}. Remaining players: ${room.players.length}`);
    });

    
  });
}

module.exports = setupSocketIO;