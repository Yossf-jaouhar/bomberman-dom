import { Server } from "socket.io";
import { game } from "./../Game/game.js";

export function setupSocketIO(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    // Join the game
    const name = (socket.handshake.query.name || "").trim();
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

 
    socket.on("getMessageHistory", () => {
      socket.emit("MessageHistory", {
        Messages: room.chatMessages,
      });
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

    socket.on("placeBomb", () => {
      room.placeBomb(name);
    });

    socket.on("startMoving", (data) => {
      room.setPlayerDirection(name, data.direction);
    });

    socket.on("stopMoving", () => {
      room.setPlayerDirection(name, null);
    });


    // Handle disconnection
    socket.on("disconnect", () => {
      room.removePlayer(name);
      if (room.RoomState === "started" ) {
        game.removeRoom(room)
      }
      console.log(
        `👋 Client disconnected: ${name} left room ${room.id
        }. Remaining players: ${Object.keys(room.players).length}`
      );
    });
  });
}
