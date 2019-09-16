const glob = require('./../glob');
class Tile extends PIXI.Sprite {
    constructor(template) {
        const textures = glob.pixiFramesMap[template.texture];
        super(textures[template.frame]);
        this.template = template;
        this.x = template.x;
        this.y = template.y;
    }
    /**
     * Updates the position of a linked template object.
     * @returns {void}
     */
    updateTemplate() {
        this.template.x = this.x;
        this.template.y = this.y;
    }
}

module.exports = Tile;
