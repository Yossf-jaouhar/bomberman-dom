export class Player {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;
    this.lives = 3;
    this.position = { x: 1, y: 1 };
    this.pixelPosition = {};
    this.movingDirection = null;
    this.speed = 1;
    this.maxBombs = 1;
    this.explosionRange = 1;
    this.powerUps = [];
    this.avatar = null;
    this.lastAxis = null;

    this.sor3aTimeout = null;
    this.sor3aActive = false;
  }

  loseLife() {
    this.lives -= 1;
    if (this.socket) {
      this.socket.emit("lifeUpdate", {
        lives: this.lives,
        alive: this.isAlive(),
      });
    }
    return this.isAlive();
  }
  addPowerUp(type) {
    let newValue;

    switch (type) {
      case "Bomb":
        if (this.maxBombs < 3) {
          this.maxBombs += 1;
          this.powerUps.push(type);
        }
        newValue = this.maxBombs;
        break;

      case "Flame":
        if (this.explosionRange < 3) {
          this.explosionRange += 1;
          this.powerUps.push(type);
        }
        newValue = this.explosionRange;
        break;

      case "Speed":

      if (!this.sor3aActive && this.speed < 2) {
          this.speed += 0.5;
          if (this.speed > 2) {
            this.speed = 2;
          }
          this.powerUps.push(type);
        }
        newValue = this.speed;
        break;

      case "sor3a":
        const oldSpeed = this.speed;

        this.speed = 5;
        this.sor3aActive = true;
        this.powerUps.push(type);

        if (this.sor3aTimeout) clearTimeout(this.sor3aTimeout);

        this.sor3aTimeout = setTimeout(() => {
          this.sor3aActive = false;
          this.sor3aTimeout = null;

          if (this.speed === 5) {
            this.speed = Math.min(2, this.speed); 
          }

          if (this.socket) {
            this.socket.emit("powerUpExpired", {
              type: "sor3a",
              speed: this.speed,
            });
          }
        }, 10000);

        newValue = oldSpeed;
        break;

      default:
        newValue = null;
        break;
    }

    return newValue;
  }

  resetPosition(tileX, tileY) {
    this.position = { x: tileX, y: tileY };
    this.pixelPosition = {
      x: tileX * 40,
      y: tileY * 40,
    };
  }

  isAlive() {
    return this.lives > 0;
  }
}
