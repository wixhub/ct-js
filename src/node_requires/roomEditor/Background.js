const glob = require('./../glob');

class Background extends PIXI.TilingSprite {
    constructor(data) {
        super(glob.pixiFramesMap[data.texture][data.frame || 0] || PIXI.Texture.EMPTY);
        this.depth = data.depth === void 0? -10 : data.depth;
        this.extends = data.extends || {};
        this.frame = data.frame || 0;
        this.tex = data.texture;
        this.simulatedX = this.simulatedY = 0;
    }
    onDraw() {
        this.simulatedX += (this.extends.movementX || 0) * PIXI.Ticker.shared.deltaTime;
        this.simulatedY += (this.extends.movementY || 0) * PIXI.Ticker.shared.deltaTime;

        const tex = glob.texturemap[this.tex].g;
        this.width = this.parent.getEditorWidth() / this.parent.scale.x; // TODO:
        this.height = this.parent.getEditorHeight() / this.parent.scale.x;
        if (this.extends.repeat === 'no-repeat' || this.extends.repeat === 'repeat-x') {
            this.height = tex.height * (this.extends.scaleY || 1);
        }
        if (this.extends.repeat === 'no-repeat' || this.extends.repeat === 'repeat-y') {
            this.width = tex.width * (this.extends.scaleX || 1);
        }
        if (this.extends.scaleX) {
            this.tileScale.x = Number(this.extends.scaleX);
        }
        if (this.extends.scaleY) {
            this.tileScale.y = Number(this.extends.scaleY);
        }

        const zero = {
            x: 0,
            y: 0
        };
        this.x = -this.parent.toGlobal(zero).x / this.parent.scale.x;
        this.y = -this.parent.toGlobal(zero).y / this.parent.scale.y;
        if (this.repeat !== 'repeat-x' && this.repeat !== 'no-repeat') {
            this.tilePosition.y = -this.y*this.extends.parallaxY + this.extends.shiftY;
        } else {
            this.y = this.extends.shiftY + this.parent.pivot.y * (this.extends.parallaxY - 1) + this.simulatedY;
        }
        if (this.repeat !== 'repeat-y' && this.repeat !== 'no-repeat') {
            this.tilePosition.x = -this.x*this.extends.parallaxX + this.extends.shiftX;
        } else {
            this.x = this.shiftX + this.parent.pivot.x * (this.extends.parallaxX - 1) + this.simulatedX;
        }
    }
    serialize() {
        return {
            texture: this.tex,
            depth: this.depth,
            extends: this.extends,
            frame: this.frame
        };
    }
}

module.exports = Background;
