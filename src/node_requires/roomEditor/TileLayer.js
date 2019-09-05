const glob = require('./../glob');

class TileLayer extends PIXI.Container {
    constructor(data) {
        super();

        this.depth = data.depth;
        this.tiles = data.tiles;
        for (const tile of data.tiles) {
            const textures = glob.pixiFramesMap[tile.texture];
            const sprite = new PIXI.Sprite(textures[tile.frame]);
            this.addChild(sprite);
            sprite.x = tile.x;
            sprite.y = tile.y;
        }
    }
}

module.exports = TileLayer;
