import { GameMap } from "./map.js";
import { Player } from "./player.js";
import { fisherYatesShuffle } from "./../utility/helpres.js";

const POWERUPS = ["Bomb", "Flame", "Speed"];

export class Room {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.RoomState = null;
    this.players = {};
    this.Counter = 20;
    this.counter = 10;
    this.timeIntw = null;
    this.timeIntp = null;
    this.chatMessages = [];
    this.map = null;
    this.bombs = [];
    this.powerUps = [];
  }
  addPlayer(name, socket) {
    const player = new Player(name, socket);
    this.players[name] = player;

    const playerCount = Object.keys(this.players).length;

    this.broadcast("playerJoined", {
      name,
      players: Object.keys(this.players),
    });

    if (playerCount === 1) {
      this.RoomState = "solo";
    }
    if (playerCount == 2 || playerCount == 3) {
      this.startWaiting();
    }
    if (playerCount === 4) {
      this.startPreparing();
    }
  }

  startWaiting() {
    if (this.RoomState == "waiting") return;
    this.RoomState = "waiting";

    if (this.timeIntw) return;

    this.timeIntw = setInterval(() => {
      const nofplayers = Object.keys(this.players).length;
      this.Counter--;
      if (this.RoomState === "preparing") {
        clearInterval(this.timeIntw);
        this.timeIntw = null;
        console.log("waiting finished!");
      }
      this.broadcast("waiting", { Counter: this.Counter, nofplayers });
      if (this.Counter <= 0) {
        clearInterval(this.timeIntw);
        this.timeIntw = null;
        console.log("waiting finished!");
        this.startPreparing();
      }
    }, 1000);
  }

  startPreparing() {
    if (this.RoomState == "preparing") return;
    this.RoomState = "preparing";

    if (this.timeIntp) return;

    this.timeIntp = setInterval(() => {
      const nofplayers = Object.keys(this.players).length;

      this.counter--;
      this.broadcast("preparing", { counter: this.counter, nofplayers });
      if (this.counter <= 0) {
        clearInterval(this.timeIntp);
        this.timeIntp = null;
        console.log("Preparing finished");
        this.startGame();
      }
    }, 1000);
  }

  startGame() {
    this.RoomState = "started";
    this.broadcast("Start");

    this.map = new GameMap(13, 15, 40);
    this.map.generateMap();

    const startPositions = [
      { x: 1, y: 1 },
      { x: this.map.columns - 2, y: 1 },
      { x: 1, y: this.map.rows - 2 },
      { x: this.map.columns - 2, y: this.map.rows - 2 },
    ];

    const avatarList = ["bilal.png", "l9r3.png", "lbnita.png", "ndadr.png"];
    const shuffledAvatars = fisherYatesShuffle(avatarList);

    let i = 0;
    for (const player of Object.values(this.players)) {
      const pos = startPositions[i];
      player.resetPosition(pos.x, pos.y);

      if (!player.avatar) {
        if (i < shuffledAvatars.length) {
          player.avatar = shuffledAvatars[i];
        } else {
          console.warn("More players than avatars (may repeat)");
          player.avatar =
            avatarList[Math.floor(Math.random() * avatarList.length)];
        }
      }
      i++;
    }

    const publicPlayersData = {};
    for (const player of Object.values(this.players)) {
      publicPlayersData[player.name] = {
        x: player.position.x,
        y: player.position.y,
        avatar: player.avatar,
      };
    }

    this.broadcast("gameStart", {
      map: this.map.tiles,
      players: publicPlayersData,
    });

    for (const player of Object.values(this.players)) {
      player.socket.emit("playerData", {
        name: player.name,
        lives: player.lives,
        maxBombs: player.maxBombs,
        explosionRange: player.explosionRange,
        speed: player.speed,
      });
    }

    setInterval(() => {
      this.update();
    }, 1000 / 60);
  }

  removePlayer(name) {
    delete this.players[name];

    const playerCount = Object.keys(this.players).length;

    this.broadcast("playerLeft", {
      name,
      players: Object.keys(this.players),
    });

    if (playerCount === 1) {
      if (this.timeIntw) {
        clearInterval(this.timeIntw);
        this.timeIntw = null;
        this.Counter = 20;
      }
      const playerWon = Object.values(this.players)[0];

      this.broadcast("playerWon", {
        name: playerWon.name,
      });

      if (this.timeIntp) {
        clearInterval(this.timeIntp);
        this.timeIntp = null;
        this.counter = 10;
      }

      this.RoomState = "solo";

      const remainingPlayer = Object.values(this.players)[0];
      if (remainingPlayer) {
        remainingPlayer.socket.emit("returnToSolo");
      }
    }
  }


  setPlayerDirection(name, direction) {
    const player = this.players[name];
    if (!player || !player.isAlive()) return;

    player.movingDirection = direction;
  }

  update() {
    let anyPlayerMoved = false;
    for (const player of Object.values(this.players)) {
      if (player.movingDirection) {
        let dx = 0;
        let dy = 0;

        switch (player.movingDirection) {
          case "up":
            dy -= player.speed;
            break;
          case "down":
            dy += player.speed;
            break;
          case "left":
            dx -= player.speed;
            break;
          case "right":
            dx += player.speed;
            break;
        }

        const moved = this.movePlayerPixel(player.name, dx, dy);
        if (moved) {
          anyPlayerMoved = true;
        }
      }
    }

    if (anyPlayerMoved) {
      const playersPositions = {};
      for (const p of Object.values(this.players)) {
        playersPositions[p.name] = {
          pixelX: p.pixelPosition.x,
          pixelY: p.pixelPosition.y,
          tileX: p.position.x,
          tileY: p.position.y,
          avatar: p.avatar,
        };
      }
      this.broadcast("updatePlayers", { playersPositions });
    }
  }

  movePlayerPixel(name, dx, dy) {
    const player = this.players[name];
    if (!player || !player.isAlive()) return false;

    const TILE_SIZE = 40;
    const oldX = player.pixelPosition.x;
    const oldY = player.pixelPosition.y;

    const centerX = player.position.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = player.position.y * TILE_SIZE + TILE_SIZE / 2;

    const playerCenterX = player.pixelPosition.x + TILE_SIZE / 2;
    const playerCenterY = player.pixelPosition.y + TILE_SIZE / 2;

    const newAxis = dx !== 0 ? "x" : dy !== 0 ? "y" : null;

    let isChangingAxis = false;
    if (player.lastAxis && newAxis && player.lastAxis !== newAxis) {
      isChangingAxis = true;
    }

    if (isChangingAxis) {
      const CENTER_THRESHOLD = TILE_SIZE * 0.4;
      const distFromCenterX = Math.abs(playerCenterX - centerX);
      const distFromCenterY = Math.abs(playerCenterY - centerY);

      if (
        distFromCenterX > CENTER_THRESHOLD ||
        distFromCenterY > CENTER_THRESHOLD
      ) {
        return false;
      } else {
        player.pixelPosition.x = centerX - TILE_SIZE / 2;
        player.pixelPosition.y = centerY - TILE_SIZE / 2;
        player.position.x = Math.floor(centerX / TILE_SIZE);
        player.position.y = Math.floor(centerY / TILE_SIZE);
        player.lastAxis = newAxis;
        return true;
      }
    }

    let newX = player.pixelPosition.x;
    let newY = player.pixelPosition.y;

    if (dx !== 0) {
      if (dx > 0) {
        const rightEdge = player.pixelPosition.x + TILE_SIZE + dx;
        const rightTile = Math.floor(rightEdge / TILE_SIZE);

        if (rightTile !== player.position.x) {
          const tile = this.map.getTile(player.position.y, rightTile);
          if (tile === this.map.TILE_WALL || tile === this.map.TILE_BLOCK) {
            newX = (player.position.x + 1) * TILE_SIZE - TILE_SIZE;
            dx = 0;
          }
        }
      } else {
        const leftEdge = player.pixelPosition.x + dx;
        const leftTile = Math.floor(leftEdge / TILE_SIZE);

        if (leftTile !== player.position.x) {
          const tile = this.map.getTile(player.position.y, leftTile);
          if (tile === this.map.TILE_WALL || tile === this.map.TILE_BLOCK) {
            newX = player.position.x * TILE_SIZE;
            dx = 0;
          }
        }
      }
    }

    if (dy !== 0) {
      if (dy > 0) {
        const bottomEdge = player.pixelPosition.y + TILE_SIZE + dy;
        const downTile = Math.floor(bottomEdge / TILE_SIZE);

        if (downTile !== player.position.y) {
          const tile = this.map.getTile(downTile, player.position.x);
          if (tile === this.map.TILE_WALL || tile === this.map.TILE_BLOCK) {
            newY = (player.position.y + 1) * TILE_SIZE - TILE_SIZE;
            dy = 0;
          }
        }
      } else {
        const topEdge = player.pixelPosition.y + dy;
        const upTile = Math.floor(topEdge / TILE_SIZE);

        if (upTile !== player.position.y) {
          const tile = this.map.getTile(upTile, player.position.x);
          if (tile === this.map.TILE_WALL || tile === this.map.TILE_BLOCK) {
            newY = player.position.y * TILE_SIZE;
            dy = 0;
          }
        }
      }
    }

    newX += dx;
    newY += dy;

    const newTileX = Math.floor((newX + TILE_SIZE / 2) / TILE_SIZE);
    const newTileY = Math.floor((newY + TILE_SIZE / 2) / TILE_SIZE);

    const bombthere = this.bombs.some((b) => {
      const isStandingOnBomb =
        b.x === player.position.x && b.y === player.position.y;
      const isMovingIntoBomb = b.x === newTileX && b.y === newTileY;
      return isMovingIntoBomb && !isStandingOnBomb;
    });

    if (bombthere) {
      return false;
    }

    player.pixelPosition.x = newX;
    player.pixelPosition.y = newY;

    if (newTileX !== player.position.x || newTileY !== player.position.y) {
      player.position.x = newTileX;
      player.position.y = newTileY;
    }

    const powerUpIndex = this.powerUps.findIndex(
      (p) => p.x === player.position.x && p.y === player.position.y
    );

    if (powerUpIndex !== -1) {
      const powerUp = this.powerUps[powerUpIndex];
      this.pickupPowerUp(name, powerUp.x, powerUp.y);
    }

    if (newX !== oldX || newY !== oldY) {
      player.lastAxis = newAxis;
      return true;
    } else {
      return false;
    }
  }

  pickupPowerUp(name, x, y) {
    const powerUpIndex = this.powerUps.findIndex((p) => p.x === x && p.y === y);
    if (powerUpIndex === -1) return;

    const powerUp = this.powerUps[powerUpIndex];
    const player = this.players[name];
    if (!player || !player.isAlive()) return;

    const updatedValue = player.addPowerUp(powerUp.type);
    this.powerUps.splice(powerUpIndex, 1);

    console.log("-->", powerUp.type, updatedValue);

    player.socket.emit("powerUpPicked", {
      name,
      type: powerUp.type,
      x,
      y,
      newValue: updatedValue,
    });

    this.broadcast("removePowerUp", {
      x,
      y,
    });
  }

  explodeBomb(bomb) {
    let mapChanged = false;
    this.bombs = this.bombs.filter((b) => b !== bomb);

    const blastTiles = [];
    const destroyedBlocks = []; // ← New array to store destroyed blocks

    blastTiles.push({ x: bomb.x, y: bomb.y });

    const directions = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ];

    for (const dir of directions) {
      for (let i = 1; i <= bomb.range; i++) {
        const checkX = bomb.x + dir.dx * i;
        const checkY = bomb.y + dir.dy * i;

        if (
          checkX < 0 ||
          checkX >= this.map.columns ||
          checkY < 0 ||
          checkY >= this.map.rows
        ) {
          break;
        }

        const tile = this.map.getTile(checkY, checkX);
        if (tile === this.map.TILE_EMPTY) {
          destroyedBlocks.push({ x: checkX, y: checkY });
        }
        if (tile === this.map.TILE_WALL) {
          break;
        }

        blastTiles.push({ x: checkX, y: checkY });

        if (tile === this.map.TILE_BLOCK) {
          this.map.setTile(checkY, checkX, this.map.TILE_EMPTY);
          destroyedBlocks.push({ x: checkX, y: checkY }); // ← Track destroyed block
          mapChanged = true;

          if (Math.random() < 0.3) {
            const type = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
            this.powerUps.push({
              x: checkX,
              y: checkY,
              type,
            });

            this.broadcast("powerUpSpawned", {
              x: checkX,
              y: checkY,
              type,
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
          if (!alive) {
            this.broadcast("playerDied", {
              name: player.name,
            });
            this.removePlayer(player.name);
            // Check if there’s only one player left
            const remainingPlayers = Object.values(this.players);
            if (remainingPlayers.length === 1) {
              const user = remainingPlayers[0];
              this.broadcast("playerWon", {
                name: user.name,
              });
              return
            }

          }
        }
      }
    }



    this.broadcast("bombExploded", {
      bomb: { x: bomb.x, y: bomb.y, owner: bomb.owner },
      blastTiles,
      destroyedBlocks, // ← send list of destroyed blocks
    });

    if (mapChanged) {
      this.broadcast("mapChange", {
        map: this.map.tiles,
      });
    }
  }

  hasPlayer(name) {
    return this.players.hasOwnProperty(name);
  }
  placeBomb(name) {
    const player = this.players[name];
    if (!player || !player.isAlive()) return;

    const { x, y } = player.position;

    const bombsByPlayer = this.bombs.filter((b) => b.owner === name);
    if (bombsByPlayer.length >= player.maxBombs) {
      return;
    }

    const bomb = {
      x,
      y,
      owner: name,
      range: player.explosionRange,
    };
    this.bombs.push(bomb);

    this.broadcast("bombPlaced", {
      x,
      y,
      owner: name,
    });

    setTimeout(() => {
      this.explodeBomb(bomb);
    }, 2000);
  }

  broadcast(event, data) {
    for (const player of Object.values(this.players)) {
      if (!player.socket) {
        continue;
      }
      player.socket.emit(event, data);
    }
  }
}
