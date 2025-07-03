class Mutex {
    constructor() {
      this.locked = false;
      this.queue = [];
    }
  
    lock() {
      return new Promise((resolve) => {
        if (!this.locked) {
          this.locked = true;
          resolve(this.unlock.bind(this));
        } else {
          this.queue.push(resolve);
        }
      });
    }
  
    unlock() {
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next(this.unlock.bind(this));
      } else {
        this.locked = false;
      }
    }
  }
  
  module.exports = Mutex;
  