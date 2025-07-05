import { Room } from "./room.js";

export class Game {
  constructor() {
    this.rooms = {};
    this.roomCounter = 0;
  }

  createRoom() {
    const roomId = this.roomCounter;
    this.rooms[roomId] = new Room(this);
    console.log(
      `Created room with id ${roomId}. Total rooms: ${
        Object.keys(this.rooms).length
      }`
    );
    this.roomCounter++
    return this.rooms[roomId];
  }

  join(playerName, socket) {
    for (const id in this.rooms) {
      const room = this.rooms[id];

      console.log("hi yosf-------------->", room.RoomState);
      if ((room.RoomState === "preparing")) {
              console.log("hi yosf-------------->", room.RoomState);

        continue
      }

      if (room.RoomState === "started") {
        console.log("hi yosf-------------->", room.RoomState);
        continue
      }

      if (Object.keys(room.players).length < 4) {
        if (!room.hasPlayer(playerName)) {
          room.addPlayer(playerName, socket);
          return room;
        }
      }
    }
    const newRoom = this.createRoom();
 
    newRoom.addPlayer(playerName, socket);
    return newRoom;
  }

  removeRoom(room) {
    for (const id in this.rooms) {
      if (this.rooms[id] === room) {
        delete this.rooms[id];
        console.log(`Room ${id} removed from game.`);
        break;
      }
    }
  }
}

export const game = new Game();
