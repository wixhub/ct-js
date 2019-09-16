const Layer = require('./Layer');
const Tile = require('./Tile');

class TileLayer extends Layer {
    constructor(data) {
        super(data);

        this.tiles = data.tiles;
        for (const tileData of data.tiles) {
            this.addTile(tileData);
        }
    }
    addTile(data) {
        const tile = new Tile(data);
        this.addChild(tile);
    }
}

module.exports = TileLayer;
