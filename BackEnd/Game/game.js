// game.js
const Room = require('./room.js');

class Game {
    constructor() {
        this.rooms = {};
    }

    createRoom() {
        const roomId = Object.keys(this.rooms).length;
        this.rooms[roomId] = new Room();
        return this.rooms[roomId];
    }

    join(playerName) {
        for (const id in this.rooms) {
            if (!this.rooms[id].hasPlayer(playerName)) {
                this.rooms[id].addPlayer(playerName);
                return this.rooms[id];
            }
        }
        const rom = this.createRoom();
        rom.addPlayer(playerName);
        return rom;
    }
}

const game = new Game();

module.exports = {
    Game,
    game,
};