class Player {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;

    this.lives = 3;

    // Tile coordinates (grid cells)
    this.position = { x: 0, y: 0 };

    // Pixel coordinates
    this.pixelPosition = { x: 0, y: 0 };

    this.speed = 1;
    this.maxBombs = 1;
    this.explosionRange = 1;
    this.powerUps = [];
    this.avatar = null;
  }

  loseLife() {
    this.lives -= 1;
    if (this.socket) {
      this.socket.emit("lifeUpdate", {
        lives: this.lives,
        alive: this.isAlive()
      });
    }
    return this.isAlive();
  }

  addPowerUp(type) {
    this.powerUps.push(type);
    if (type === "Bomb") this.maxBombs += 1;
    if (type === "Flame") this.explosionRange += 1;
    if (type === "Speed") this.speed += 1;
  }

  resetPosition(tileX, tileY) {
    this.position = { x: tileX, y: tileY };
    this.pixelPosition = {
      x: tileX * 40,
      y: tileY * 40
    };
  }

  isAlive() {
    return this.lives > 0;
  }
}

module.exports = Player;