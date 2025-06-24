class Room {
  constructor() {
    this.players = [];
  }
  hasPlayer(name) {
    return this.players.includes(name);
  }
  addPlayer(name) {
    this.players.push(name);
  }
  removePlayer(name) {
    const index = this.players.indexOf(name);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }
}
module.exports = Room;
