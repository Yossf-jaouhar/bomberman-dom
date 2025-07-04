import {Room} from './room.js'

export class Game {
    constructor() {
        this.rooms = {};
    }

    createRoom() {
        const roomId = Object.keys(this.rooms).length;
        this.rooms[roomId] = new Room(this);
        return this.rooms[roomId];
    }
    join(playerName, socket) {
        for (const id in this.rooms) {
            const room = this.rooms[id];
            if (!room.hasPlayer(playerName) && Object.keys(room.players).length < 4) {
                room.addPlayer(playerName, socket);
                return room;
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
