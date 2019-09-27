class TransformHandle extends PIXI.Graphics {
    constructor(cursor) {
        super();
        this.interactive = true;
        this.cursor = cursor || 'pointer';
        this
        .lineStyle(3, 0x446adb)
        .beginFill(0xffffff)
        .drawCircle(0, 0, 8)
        .endFill();
    }
}

module.exports = TransformHandle;
