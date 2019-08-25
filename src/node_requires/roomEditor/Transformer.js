/* global PIXI */
// eslint-disable-next-line no-unused-vars
class Transformer extends PIXI.Container {
    constructor(items) {
        if (!items || !items.length) {
            throw new Error('Cannot create a Tramsformer with no items.');
        }
        super();
        this.items = items;
        this.outline = new PIXI.Graphics();
        this.redrawBox();
    }
    redrawBox() {
        const bbox = {
            x1: NaN,
            y1: NaN,
            x2: NaN,
            y2: NaN
        };
        for (const item of this.items) {
            const ibbox = item.getBounds();
            if (ibbox.x < bbox.x1 || isNaN(bbox.x1)) {
                bbox.x1 = ibbox.x;
            }
            if (ibbox.y < bbox.y1 || isNaN(bbox.y1)) {
                bbox.y1 = ibbox.y;
            }
            if (ibbox.width + ibbox.x > bbox.x2 || isNaN(bbox.x2)) {
                bbox.x2 = ibbox.width + ibbox.x;
            }
            if (ibbox.height + ibbox.y || isNaN(bbox.y2)) {
                bbox.y2 = ibbox.height + ibbox.y;
            }
        }
        this.outline.clear();
        this.outline
        .lineStyle(3, 0x446adb)
        .drawRect(bbox.x1 - 0.5, bbox.y1 - 0.5, bbox.x2 - bbox.x1 + 1, bbox.y2 - bbox.y1 + 1);
        this.outline
        .lineStyle(1, 0xffffff)
        .drawRect(bbox.x1 - 0.5, bbox.y1 - 0.5, bbox.x2 - bbox.x1 + 1, bbox.y2 - bbox.y1 + 1);
    }
}

exports = Transformer;