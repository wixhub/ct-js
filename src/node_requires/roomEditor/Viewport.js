const Layer = require('./Layer');

/**
 * This is a graphic depiction of a camera in an exported game.
 * It can be moved around and writes to `room.x`, `room.y`.
 * @param {Object} data A rectangle; a camera's position
 */
class Viewport extends Layer {
    constructor(data) {
        super();
        this.displayWidth = data.width || 1280;
        this.displayHeight = data.height || 768;
        this.graphic = new PIXI.Graphics();
        this.depth = Infinity;
        this.redrawFrame();
        this.addChild(this.graphic);
    }
    redrawFrame() {
        this.graphic.clear();
        this.graphic
        .lineStyle(4, 0x446adb)
        .drawRect(0, 0, this.displayWidth, this.displayHeight);
        this.graphic
        .lineStyle(2, 0xffffff)
        .drawRect(0, 0, this.displayWidth, this.displayHeight);
    }
}

module.exports = Viewport;
