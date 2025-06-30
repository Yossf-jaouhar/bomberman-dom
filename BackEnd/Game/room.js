const GameMap = require('./map');
const Player = require('./player');
const POWERUPS = ["Bomb", "Flame", "Speed"];

class Room {
  constructor() {
    this.RoomState = null;
    this.players = {};
    this.Counter = null;
    this.timeInt = null;
    this.chatMessages = [];
    this.map = null;
    this.bombs = [];
    this.powerUps = [];
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
        console.log("waiting finished!");
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
        this.startGame();
      }
    }, 1000);
  }

  startGame() {
    this.RoomState = "started";

    this.map = new GameMap(13, 15, 40);
    this.map.generateMap();

    const startPositions = [
      { x: 1, y: 1 },
      { x: this.map.columns - 2, y: 1 },
      { x: 1, y: this.map.rows - 2 },
      { x: this.map.columns - 2, y: this.map.rows - 2 }
    ];

    let i = 0;
    for (const player of Object.values(this.players)) {
      const pos = startPositions[i];
      player.resetPosition(pos.x, pos.y);

      if (!player.avatar) {
        const avatarList = ["bilal.png", "l9r3.png", "lbnita.png", "ndadr.png"];
        player.avatar = avatarList[Math.floor(Math.random() * avatarList.length)];
      }
      i++;
    }

    const publicPlayersData = {};
    for (const player of Object.values(this.players)) {
      publicPlayersData[player.name] = {
        x: player.position.x,
        y: player.position.y,
        avatar: player.avatar
      };
    }

    this.broadcast("gameStart", {
      map: this.map.tiles,
      players: publicPlayersData
    });

    for (const player of Object.values(this.players)) {
      player.socket.emit("playerData", {
        name: player.name,
        lives: player.lives,
        maxBombs: player.maxBombs,
        explosionRange: player.explosionRange,
        speed: player.speed,
        avatar: player.avatar,
        position: {
          x: player.position.x,
          y: player.position.y
        },
        pixelPosition: {
          x: player.pixelPosition.x,
          y: player.pixelPosition.y
        }
      });
    }
  }

  movePlayerPixel(name, dx, dy) {
    const player = this.players[name];
    if (!player || !player.isAlive()) return;

    const oldX = player.pixelPosition.x;
    const oldY = player.pixelPosition.y;

    let newX = oldX + dx;
    let newY = oldY + dy;

    const newTileX = Math.floor(newX / 40);
    const newTileY = Math.floor(newY / 40);

    if (
      newTileX < 0 ||
      newTileX >= this.map.columns ||
      newTileY < 0 ||
      newTileY >= this.map.rows
    ) {
      return;
    }

    const tile = this.map.getTile(newTileY, newTileX);
    if (tile === this.map.TILE_WALL || tile === this.map.TILE_BLOCK) {
      return;
    }

    player.pixelPosition.x = newX;
    player.pixelPosition.y = newY;

    if (
      newTileX !== player.position.x ||
      newTileY !== player.position.y
    ) {
      player.position.x = newTileX;
      player.position.y = newTileY;
      // Check power-ups here if desired
    }

    const playersPositions = {};
    for (const p of Object.values(this.players)) {
      playersPositions[p.name] = {
        pixelX: p.pixelPosition.x,
        pixelY: p.pixelPosition.y,
        tileX: p.position.x,
        tileY: p.position.y,
        avatar: p.avatar
      };
    }

    this.broadcast("updatePlayers", { playersPositions });
  }

  placeBomb(name) {
    const player = this.players[name];
    if (!player || !player.isAlive()) return;

    const { x, y } = player.position;

    const bombsByPlayer = this.bombs.filter(b => b.owner === name);
    if (bombsByPlayer.length >= player.maxBombs) {
      console.log(`${name} has no bombs left`);
      return;
    }

    const bomb = {
      x,
      y,
      owner: name,
      range: player.explosionRange
    };
    this.bombs.push(bomb);

    this.broadcast("bombPlaced", {
      x,
      y,
      owner: name
    });

    setTimeout(() => {
      this.explodeBomb(bomb);
    }, 2000);
  }

  explodeBomb(bomb) {
    console.log(`Bomb at ${bomb.x},${bomb.y} exploding`);
    let mapChanged = false;
    this.bombs = this.bombs.filter(b => b !== bomb);

    const blastTiles = [];
    blastTiles.push({ x: bomb.x, y: bomb.y });

    const directions = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 }
    ];

    for (const dir of directions) {
      for (let i = 1; i <= bomb.range; i++) {
        const checkX = bomb.x + dir.dx * i;
        const checkY = bomb.y + dir.dy * i;

        if (
          checkX < 0 || checkX >= this.map.columns ||
          checkY < 0 || checkY >= this.map.rows
        ) {
          break;
        }

        const tile = this.map.getTile(checkY, checkX);
        if (tile === this.map.TILE_WALL) {
          break;
        }

        blastTiles.push({ x: checkX, y: checkY });

        if (tile === this.map.TILE_BLOCK) {
          this.map.setTile(checkY, checkX, this.map.TILE_EMPTY);
          mapChanged = true;

          if (Math.random() < 0.3) {
            const type = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
            this.powerUps.push({
              x: checkX,
              y: checkY,
              type
            });

            this.broadcast("powerUpSpawned", {
              x: checkX,
              y: checkY,
              type
            });
          }
          break;
        }
      }
    }

    for (const player of Object.values(this.players)) {
      for (const t of blastTiles) {
        if (player.position.x === t.x && player.position.y === t.y) {
          const alive = player.loseLife();
          console.log(`${player.name} hit by explosion! Lives left: ${player.lives}`);
          if (!alive) {
            this.broadcast("playerDied", {
              name: player.name
            });
          }
        }
      }
    }

    this.broadcast("bombExploded", {
      bomb: { x: bomb.x, y: bomb.y, owner: bomb.owner }
    });

    if (mapChanged) {
      this.broadcast("mapChange", {
        map: this.map.tiles
      });
    }
  }

  pickupPowerUp(name, x, y) {
    const powerUpIndex = this.powerUps.findIndex(p => p.x === x && p.y === y);
    if (powerUpIndex === -1) {
      console.log(`No power-up at ${x},${y}`);
      return;
    }

    const powerUp = this.powerUps[powerUpIndex];
    const player = this.players[name];
    if (!player || !player.isAlive()) return;

    player.addPowerUp(powerUp.type);
    this.powerUps.splice(powerUpIndex, 1);

    this.broadcast("powerUpPicked", {
      name,
      type: powerUp.type,
      x,
      y
    });

    console.log(`${name} picked up ${powerUp.type}`);
  }
}

module.exports = Room;
