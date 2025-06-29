const GameMap = require('./map');
const Player = require('./player');
const POWERUPS = ["Bomb", "Flame", "Speed"];
class Room {
  constructor() {
    this.RoomState = null; // "solo", "waiting", "preparing", "started"
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
        this.startGame();
      }
    }, 1000);
  }

  startGame() {
    this.RoomState = "started";

    // Generate the map
    this.map = new GameMap(13, 15, 40);
    this.map.generateMap();

    const startPositions = [
      { x: 1, y: 1 },                                 // top-left
      { x: this.map.columns - 2, y: 1 },              // top-right
      { x: 1, y: this.map.rows - 2 },                 // bottom-left
      { x: this.map.columns - 2, y: this.map.rows - 2 } // bottom-right
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

    // Prepare public data
    const publicPlayersData = {};
    for (const player of Object.values(this.players)) {
      publicPlayersData[player.name] = {
        x: player.position.x,
        y: player.position.y,
        avatar: player.avatar
      };
    }

    // Broadcast safe data
    this.broadcast("gameStart", {
      map: this.map.tiles,
      players: publicPlayersData
    });

    // Send private data individually
    for (const player of Object.values(this.players)) {
      player.socket.emit("playerData", {
        name: player.name,
        lives: player.lives,
        maxBombs: player.maxBombs,
        explosionRange: player.explosionRange,
        speed: player.speed,
        avatar: player.avatar,
        position: player.position
      });
    }
  }

  movePlayer(name, direction) {
    const player = this.players[name];
    if (!player || !player.isAlive()) return;

    const { x, y } = player.position;
    let newX = x;
    let newY = y;

    if (direction === "up") newY -= 1;
    if (direction === "down") newY += 1;
    if (direction === "left") newX -= 1;
    if (direction === "right") newX += 1;

    // Check bounds
    if (newX < 0 || newX >= this.map.columns || newY < 0 || newY >= this.map.rows) {
      return;
    }

    // Check collision with map tiles
    const tile = this.map.getTile(newY, newX);
    if (tile === this.map.TILE_WALL || tile === this.map.TILE_BLOCK) {
      return;
    }

    // No collision → move the player
    player.resetPosition(newX, newY);

    // Broadcast new positions to all players
    const playersPositions = {};
    for (const p of Object.values(this.players)) {
      playersPositions[p.name] = {
        x: p.position.x,
        y: p.position.y
      };
    }

    this.broadcast("updatePlayers", {
      playersPositions
    });
  }

  placeBomb(name) {
    const player = this.players[name];
    if (!player || !player.isAlive()) return;

    const { x, y } = player.position;

    // Check if bomb already exists at that tile
    if (this.isBombAt(x, y)) {
      console.log(`Bomb already at ${x},${y}`);
      return;
    }

    // Check max bombs
    const bombsByPlayer = this.bombs.filter(b => b.owner === name);
    if (bombsByPlayer.length >= player.maxBombs) {
      console.log(`${name} has no bombs left`);
      return;
    }

    // Place bomb
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

    // Set timer to explode
    setTimeout(() => {
      this.explodeBomb(bomb);
    }, 2000);
  }
  explodeBomb(bomb) {
    console.log(`Bomb at ${bomb.x},${bomb.y} exploding`);

    // Remove bomb from bombs array
    this.bombs = this.bombs.filter(b => b !== bomb);

    // Determine blast tiles
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

          // Chance to drop a power-up
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

    // Damage players
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
      bomb: { x: bomb.x, y: bomb.y, owner: bomb.owner },
      updatedMap: this.map.tiles
    });
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