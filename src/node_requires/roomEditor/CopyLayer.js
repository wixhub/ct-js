const Layer = require('./Layer');
const Copy = require('./Copy');

class SpriteLayer extends Layer {
    constructor(data) {
        super(data);
        for (const copy of data.copies) {
            this.addChild(new Copy(copy));
        }
    }
    /**
     * Adds a new copy to itself and a copy data to the room's JSON layer
     * @param {Object} data The template data of a new copy
     * @returns {Copy} A pixi.js entity
     */
    addCopy(data) {
        const copy = new Copy(data);
        this.addChild(copy);
        return Copy;
    }
    removeCopy(copy) {
        const ind = this.template.copies.indexOf(copy);
        if (ind !== -1) {
            this.removeChild(copy);
            this.template.splice(ind, 1);
        }
    }
}

module.exports = SpriteLayer;
