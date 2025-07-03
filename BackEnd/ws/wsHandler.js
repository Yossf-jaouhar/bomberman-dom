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
    const room = game.join(name, socket);
    console.log("joined", Object.keys(room.players).length);

    //for testing with single PLayer 
    room.startGame()

    room.broadcast("joined", {
      RoomState: room.RoomState,
      nofPlayers: Object.keys(room.players).length,
      Counter: room.Counter,
    });
    room.broadcast("MessageHistory", {
      Messages: room.chatMessages,
    });


    //receive Messages
    socket.on("chatMessage", (data) => {
      console.log(`[${name}]: ${data.text}`);
      room.chatMessages.push({ from: name, text: data.text });
      room.broadcast("chatMessage", {
        from: name,
        text: data.text,
      });
    });

    socket.on("placeBomb", () => {
      room.placeBomb(name);
    });

    socket.on("pickupPowerUp", (data) => {
      room.pickupPowerUp(name, data.x, data.y);
    });

    

    socket.on("startMoving", (data) => {
      console.log("move requested", data);
      room.setPlayerDirection(name, data.direction);
    });


    socket.on("stopMoving", () => {
      room.setPlayerDirection(name, null);
    });




    socket.on("move", (data) => {
      console.log("move requested", data);

      room.movePlayerPixel(name, data.dx, data.dy);
    });

    // Handle messages
    socket.on("message", (message) => {
      console.log(`[${name}]: ${message}`);
      // socket.emit("message", `Server received: ${message}`);
    });



    // Handle disconnection
    socket.on("disconnect", () => {
      room.removePlayer(name);
      console.log(`👋 Client disconnected: ${name} left room ${room.id}. Remaining players: ${room.players.length}`);
    });


  });
}

module.exports = setupSocketIO;