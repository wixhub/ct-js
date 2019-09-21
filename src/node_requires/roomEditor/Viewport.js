const Layer = require('./Layer');

/**
 * This is a graphic depiction of a camera in an exported game.
 * It can be moved around and writes to `room.x`, `room.y`.
 * @param {Object} data A rectangle; a camera's position
 */
class Viewport extends Layer {
    constructor(data) {
        super();
        this.template = data;
        this.graphic = new PIXI.Graphics();
        this.depth = Infinity;
        this.redrawFrame();
        this.addChild(this.graphic);
        this.startingIcon = new PIXI.Graphics();
        this.startingIcon
        .lineStyle(2, 0xff9748, 1, 0.5)
        .moveTo(0, 0)
        .lineTo(17, 10)
        .lineTo(0, 20)
        .lineTo(0, 0)
        .closePath();
        this.startingIcon.y = 16;
        this.startingIcon.x = this.displayWidth - 16 - 17;
        this.startingIcon.visible = this.template.default;
        this.addChild(this.startingIcon);
    }
    redrawFrame() {
        this.graphic.clear();
        this.graphic
        .lineStyle(4, 0x446adb)
        .drawRoundedRect(0, 0, this.displayWidth, this.displayHeight, 0.1);
        this.graphic
        .lineStyle(2, 0xffffff)
        .drawRoundedRect(0, 0, this.displayWidth, this.displayHeight, 0.1);
        this.startingIcon.x = this.displayWidth - 16 - 17;
    }
    /**
     * This method changes whether or not a given Viewport is considered as a default one.
     * @param {Boolean} isDefault Whether or not the viewport should be a default one
     * @returns {void}
     */
    setDefault(isDefault) {
        this.startingIcon.visible = Boolean(isDefault);
        this.template.default = Boolean(isDefault);
    }

    get displayWidth() {
        return this.template.width || 1280;
    }
    set displayWidth(val) {
        this.template.width = val;
    }
    get displayHeight() {
        return this.template.height || 768;
    }
    set displayHeight(val) {
        this.template.height = val;
    }
}

module.exports = Viewport;
