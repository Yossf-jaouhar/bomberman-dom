class Room {
  constructor() {
    this.RoomState = null; // "solo", "waiting", "preparing", "started"
    this.players = [];
    this.Counter = null;
    this.timeInt = null;
    this.chatMessages = [];
  }

  hasPlayer(name) {
    return this.players.includes(name);
  }

  addPlayer(name) {
    this.players.push(name);
    if (this.players.length === 1) {
      this.RoomState = "solo";
    }
    if (this.players.length === 2) {
      this.startWaiting();
    }
    if (this.players.length === 4) {
      this.startPreparing();
    }
  }

  removePlayer(name) {
    const index = this.players.indexOf(name);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  // 20s countdown when 2nd player joins
  startWaiting() {
    this.RoomState = "waiting";
    if (this.timeInt) return;

    this.Counter = 20;

    this.timeInt = setInterval(() => {
      this.Counter--;
      if (this.Counter <= 0) {
        clearInterval(this.timeInt);
        this.timeInt = null;
        console.log("Waiting finished");
        this.startPreparing();
      }
    }, 1000);
  }

  // 10s countdown when 4th player joins or when waiting time ends
  startPreparing() {
    this.RoomState = "preparing";
    if (this.timeInt) return;

    this.Counter = 10;

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
