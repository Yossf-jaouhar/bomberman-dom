
//wall, blocks, place for players, 
const mapData = {
    width: 5,
    height: 5,
    tiles: [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 1, 2, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
    ]
};


class tileMap {
    constructor(mapData) {
        this.width = mapData.width
        this.height = mapData.height
        this.tiles = mapData.tiles
        this.size = 24
    }

}

module.exports = { tileMap, mapData };
