/* global PIXI glob */
const copyDefaults = {
    x: 0,
    y: 0,
    alpha: 1,
    rotation: 0,
    tint: 0xFFFFFF,
    frame: 0,
    extends: {}
};
const serializePlain = [
    'x',
    'y',
    'alpha',
    'rotation',
    'tint',
    'extends',
    'uid', // the type
    'frame'
];
// eslint-disable-next-line no-unused-vars
class Copy extends PIXI.AnimatedSprite {
    constructor(copyInfo) {
        const type = window.currentProject.types[glob.typemap[copyInfo.uid]],
              frames = glob.pixiFramesMap[type.texture];
        super(frames);
        glob.extend(this, copyDefaults);
        glob.extend(this, copyInfo);
    }
    serialize() {
        const out = {};
        for (const key of serializePlain) {
            out[key] = this[key];
        }
        out.scale = {
            x: this.scale.x,
            y: this.scale.y
        };
        return out;
    }
}

exports = Copy;
