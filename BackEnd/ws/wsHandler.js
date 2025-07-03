const { Server } = require("socket.io");
const { game } = require("../Game/game");
const Mutex = require("./mutex");

function setupSocketIO(server) {
  console.log("Setting up Socket.IO...");

  const io = new Server(server);

  io.on("connection", async(socket) => {


    // Join the game
    const name = socket.handshake.query.name;
    if (!name) {
      console.error("Name parameter is required.");
      socket.disconnect();
      return;
    }
    const room = game.join(name, socket);

    if (!room.mutex) {
      room.mutex = new Mutex(); 
    }
    

    //for testing with single PLayer 
    // room.startGame()

    const unlock = await room.mutex.lock();
    try {
      room.broadcast("joined", {
        RoomState: room.RoomState,
        nofPlayers: Object.keys(room.players).length,
        Counter: room.Counter,
      });
    
      room.broadcast("MessageHistory", {
        Messages: room.chatMessages,
      });
    } finally {
      unlock();
    }
    


    //receive Messages
    socket.on("chatMessage", async (data) => {
      const unlock = await room.mutex.lock(); 

      try {
        room.chatMessages.push({ from: name, text: data.text });
        room.broadcast("chatMessage", {
          from: name,
          text: data.text,
        });

      } finally {
        unlock()
      }
    });

    socket.on("placeBomb", async () => {
      const unlock = await room.mutex.lock();
      try {
        room.placeBomb(name);
      } finally {
        unlock()
      }
    });

    socket.on("pickupPowerUp", async (data) => {
      const unlock = await room.mutex.lock()
      try {
        room.pickupPowerUp(name, data.x, data.y);
      } finally {
        unlock()
      }
    });

    

    socket.on("startMoving", async(data) => {
      const unlock = await room.mutex.lock(); 
      try {
        room.setPlayerDirection(name, data.direction);
      } finally {
        unlock()
      }
    });


    socket.on("stopMoving", async() => {
      const unlock = await room.mutex.lock(); 
      try  {
        room.setPlayerDirection(name, null);
      } finally {
        unlock()
      }
    });

    socket.on("move", async (data) => {
      console.log("move requested", data);
      const unlock = await room.mutex.lock(); 
      try {
        room.movePlayerPixel(name, data.dx, data.dy);
      } finally {
        unlock(); 
      }
    });
    

    // Handle messages
    socket.on("message", async (message) => {
      const unlock = await room.mutex.lock(); 
      try {
        console.log(`[${name}]: ${message}`);
      } finally {
        unlock()
      }
    });



    // Handle disconnection
    socket.on("disconnect", async() => {
      const unlock = await room.mutex.lock(); 
      try {
        room.removePlayer(name);
      } finally {
        unlock()
      }
      console.log(`👋 Client disconnected: ${name} left room ${room.id}. Remaining players: ${room.players.length}`);
    });


  });
}

module.exports = setupSocketIO;