class GameMap {



    constructor(rows, columns, tileSize) {
        this.rows = rows;
        this.columns = columns;     // number of columns (e.g. 15)
        this.tileSize = tileSize;   // size of each tile in px (e.g. 40)

        this.tiles = []; // flat array representing the map grid

        // Tile types (constants)
        this.TILE_WALL = 0;    // indestructible wall
        this.TILE_BLOCK = 1;   // destructible block
        this.TILE_EMPTY = 2;   // empty space (walkable)
    }



    generateMap() {
        
        this.tiles = new Array(this.rows * this.columns).fill(this.TILE_EMPTY);
        // Place walls - outer boundaries + inner walls on even rows & cols
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                if (
                    r === 0 || r === this.rows - 1 || c === 0 || c === this.columns - 1 ||
                    (r % 2 === 0 && c % 2 === 0)
                ) {
                    this.setTile(r, c, this.TILE_WALL);
                }
            }
        }

        // Place destructible blocks randomly except near player start positions
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.columns - 1; c++) {
                if (this.getTile(r, c) === this.TILE_EMPTY && !this.isSafeStartArea(r, c)) {
                    if (Math.random() < 0.5) {
                        this.setTile(r, c, this.TILE_BLOCK);
                    }
                }
            }
        }
    }


    index(row, col) {
        return row * this.columns + col;
    }


    getTile(row, col) {
        return this.tiles[this.index(row, col)];
    }


    setTile(row, col, tileType) {
        this.tiles[this.index(row, col)] = tileType;
    }


    isSafeStartArea(row, col) {
        const safeZone = 2;
        // Top-left corner
        if (row <= safeZone && col <= safeZone) return true;
        // Top-right corner
        if (row <= safeZone && col >= this.columns - 1 - safeZone) return true;
        // Bottom-left corner
        if (row >= this.rows - 1 - safeZone && col <= safeZone) return true;
        // Bottom-right corner
        if (row >= this.rows - 1 - safeZone && col >= this.columns - 1 - safeZone) return true;

        return false;
    }

    printMap() {
        for (let r = 0; r < this.rows; r++) {
            let rowStr = "";
            for (let c = 0; c < this.columns; c++) {
                rowStr += this.getTile(r, c) + " ";
            }
            console.log(rowStr);
        }
    }
}
module.exports = GameMap;
