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
    this.players[name] = socket;

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
    for (const socket of Object.values(this.players)) {
      if (!socket || typeof socket.emit !== "function") {
        console.warn(`Invalid socket, skipping broadcast...`);
        continue;
      }
      socket.emit(event, data);
    }
  }

  startWaiting() {
    this.RoomState = "waiting";
    this.Counter = 20;

    // 👉 Broadcast only ONCE at the START
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

    // 👉 Broadcast only ONCE at the START
    this.broadcast("preparing", { counter: this.Counter }); 

    if (this.timeInt) return;

    this.timeInt = setInterval(() => {
      this.Counter--;
      if (this.Counter <= 0) {
        clearInterval(this.timeInt);
        this.timeInt = null;
        console.log("Preparing finished");
      }
    }, 1000);
  }
}

module.exports = Room;