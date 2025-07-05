import { Server } from "socket.io";
import { game } from './../Game/game.js';
import { Mutex } from "./mutex.js";

export function setupSocketIO(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    // Join the game
    const name = (socket.handshake.query.name || "").trim()
    if (!name) {
      console.error("Name parameter is required.");
      socket.disconnect();
      return;
    }
    const room = game.join(name, socket);

    if (!room) {
      socket.disconnect();
      return;
    }


    if (!room.mutex) {
      room.mutex = new Mutex();
    }


  

    room.broadcast("joined", {
      RoomState: room.RoomState,
      nofPlayers: Object.keys(room.players).length,
      Counter: room.Counter,
    });

    room.broadcast("MessageHistory", {
      Messages: room.chatMessages,
    });


    console.log("playerJoined room ", Object.keys(game.rooms).length);



    //receive Messagesimport { game } from '../Game/game.js';

    socket.on("chatMessage", (data) => {

      room.chatMessages.push({ from: name, text: data.text });
      room.broadcast("chatMessage", {
        from: name,
        text: data.text,
      });


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



    socket.on("startMoving",  (data) => {
      
        room.setPlayerDirection(name, data.direction);
    });


    socket.on("stopMoving",  () => {
        room.setPlayerDirection(name, null);
      
    });

    socket.on("move", async (data) => {
      console.log("move requested", data);

      if (process.env.DEBUG === "true") {
        console.log("move requested", data);
      }

      const unlock = await room.mutex.lock();
      try {
        room.movePlayerPixel(name, data.dx, data.dy);
      } finally {
        unlock();
      }
    });


    // Handle disconnection
    socket.on("disconnect", async () => {
      const unlock = await room.mutex.lock();
      try {
        room.removePlayer(name);
      } finally {
        unlock()
      }
      console.log(
        `👋 Client disconnected: ${name} left room ${room.id}. Remaining players: ${Object.keys(room.players).length}`
      );
    });


  });
}
