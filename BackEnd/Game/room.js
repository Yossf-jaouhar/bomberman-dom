const Player = require('./player');

class Room {
  constructor() {
    this.RoomState = null; // "solo", "waiting", "preparing", "started"
    this.players = {};
    this.Counter = null;
    this.timeInt = null;
    this.chatMessages = [];
  }

  hasPlayer(name) {
    return this.players.hasOwnProperty(name);
  }

  addPlayer(name, socket) {
    const player = new Player(name, socket);
    this.players[name] = player;

    const playerCount = Object.keys(this.players).length;

    if (playerCount === 1) {
      this.RoomState = "solo";
    }
    if (playerCount === 2) {
      this.startWaiting();
    }
    if (playerCount === 4) {
      this.startPreparing();
    }
  }

  removePlayer(name) {
    delete this.players[name];
  }

  broadcast(event, data) {
    for (const player of Object.values(this.players)) {
      if (!player.socket || typeof player.socket.emit !== "function") {
        console.warn(`Invalid socket for ${player.name}, skipping...`);
        continue;
      }
      player.socket.emit(event, data);
    }
  }

  startWaiting() {
    this.RoomState = "waiting";
    this.Counter = 20;

    this.broadcast("waiting", { counter: this.Counter }); 

    if (this.timeInt) return;

    this.timeInt = setInterval(() => {
      this.Counter--;
      if (this.Counter <= 0) {
        clearInterval(this.timeInt);
        this.timeInt = null;
        console.log("waiting finished !");
        this.startPreparing();
      }
    }, 1000);
  }

  startPreparing() {
    this.RoomState = "preparing";
    this.Counter = 10;

    this.broadcast("preparing", { counter: this.Counter }); 

    if (this.timeInt) return;

    this.timeInt = setInterval(() => {
      this.Counter--;
      if (this.Counter <= 0) {
        clearInterval(this.timeInt);
        this.timeInt = null;
        console.log("Preparing finished");
        // 👉 Here you can call this.startGame() if needed
      }
    }, 1000);
  }
}

module.exports = Room;