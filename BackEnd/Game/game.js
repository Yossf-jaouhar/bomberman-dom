import { Room } from './room.js';

export class Game {
  constructor() {
    this.rooms = {};
    this.roomCounter = 0;
  }

  createRoom() {
    const roomId = this.roomCounter;
    this.rooms[roomId] = new Room(this);
    console.log(`Created room with id ${roomId}. Total rooms: ${Object.keys(this.rooms).length}`);
    return this.rooms[roomId];
  }

  join(playerName, socket) {

    for (const id in this.rooms) {
      const room = this.rooms[id];
      
      if ( Object.keys(room.players).length < 4) {
        if  (!room.hasPlayer(playerName)) {
          room.addPlayer(playerName, socket);
          return room;
        }
      }
    }
    const newRoomId = this.roomCounter++;
    const newRoom = this.createRoom();
    this.rooms[newRoomId] = newRoom;
    console.log(`Created new room ${newRoomId} and adding player ${playerName}`);
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
