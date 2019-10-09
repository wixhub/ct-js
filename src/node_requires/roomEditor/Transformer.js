const TransformHandle = require('./TransformHandle');
const trigo = require('./../trigo');
const everywhere = {
    contains() {
        return true;
    }
};

class Transformer extends PIXI.Container {
    constructor(items) {
        if (!items || !items.length) {
            throw new Error('Cannot create a Tramsformer with no items.');
        }
        super();
        this.x = this.y = 1;
        this.items = items;
        this.drag = false;
        this.interactive = true;
        this.hitArea = everywhere; // set a custom hit area so we can detect clicks outside the transform frame

        /* Copy transforms so we don't get misalignment
        due to layered deltas after transforming at each frame */
        this.sourceTransforms = items.map(item => {
            const t = new PIXI.Matrix();
            t.copyFrom(item.localTransform);
            return t;
        });
        this.applyingTransform = new PIXI.Transform();
        this.outline = new PIXI.Graphics();
        this.rotHandle = new TransformHandle('grab');
        this.moveHandle = new TransformHandle('move');
        this.scaleXHandle = new TransformHandle('ew-resize');
        this.scaleYHandle = new TransformHandle('ns-resize');
        this.scaleXYHandle = new TransformHandle('nwse-resize');
        this.handles = [this.rotHandle, this.scaleXHandle, this.scaleYHandle, this.scaleXYHandle, this.moveHandle];
        this.addChild(this.outline, ...this.handles);
        this.realign();

        this.on('pointerdown', this.deleteSelf);
        for (const handle of this.handles) {
            handle.on('pointerdown', this.captureMouseDown.bind(this));
        }
        this.on('pointermove', this.updateState);
        this.on('pointerup', this.stopDragging);
    }
    realign() {
        let bbox;
        for (const item of this.items) {
            const ibbox = item.getLocalBounds();
            ibbox.x += item.x;
            ibbox.y += item.y;
            if (!bbox) {
                bbox = new PIXI.Rectangle(0, 0, 0, 0);
                bbox.copyFrom(ibbox);
            } else {
                bbox.enlarge(ibbox);
            }
        }
        // Position itself so the pivot is placed at the center of the selection.
        this.x = bbox.x + bbox.width / 2;
        this.y = bbox.y + bbox.height / 2;

        const hw = bbox.width / 2; // half-width, half height
        const hh = bbox.height / 2;
        this.applyingTransform.updateLocalTransform();
        const t = this.applyingTransform.localTransform;

        const c = t.apply({
            x: 0,
            y: 0
        });
        const tl = t.apply({
            x: -hw,
            y: -hh
        });
        const tr = t.apply({
            x: hw,
            y: -hh
        });
        const br = t.apply({
            x: hw,
            y: hh
        });
        const bl = t.apply({
            x: -hw,
            y: hh
        });
        this.outline.clear();
        this.outline
        .lineStyle(3, 0x446adb)
        .moveTo(tl.x, tl.y)
        .lineTo(tr.x, tr.y)
        .lineTo(br.x, br.y)
        .lineTo(bl.x, bl.y)
        .lineTo(tl.x, tl.y)
        .closePath();
        this.outline
        .lineStyle(1, 0xffffff)
        .moveTo(tl.x, tl.y)
        .lineTo(tr.x, tr.y)
        .lineTo(br.x, br.y)
        .lineTo(bl.x, bl.y)
        .lineTo(tl.x, tl.y)
        .closePath();

        // Position the handles relative to the target transform matrix
        this.moveHandle.x = c.x;
        this.moveHandle.y = c.y;
        t.apply({
            x: hw,
            y: hh
        }, this.scaleXYHandle.position);
        t.apply({
            x: hw,
            y: 0
        }, this.scaleXHandle.position);
        t.apply({
            x: 0,
            y: hh
        }, this.scaleYHandle.position);
        t.apply({
            x: hw + 32,
            y: 0
        }, this.rotHandle.position);

        this.selectionBounds = bbox;
    }

    deleteSelf() {
        this.parent.removeChild(this);
    }
    captureMouseDown(e) {
        // Previous local transform that will be applied to entities
        this.previousTransformL = this.applyingTransform.localTransform.clone();

        this.selfPreviousGlobalTransform = this.worldTransform.clone();
        this.previousRotation = this.applyingTransform.rotation;
        this.drag = {
            fromX: e.data.global.x,
            fromY: e.data.global.y,
            target: e.currentTarget
        };
        e.stopPropagation();
    }
    updateState(e) {
        //console.log(this.drag, e);
        if (!this.drag) {
            return;
        }
        this.drag.toX = e.data.global.x;
        this.drag.toY = e.data.global.y;
        const globPos = this.getGlobalPosition();
        const hw = this.selectionBounds.width / 2; // half-width, half height
        const hh = this.selectionBounds.height / 2;
        const t = this.applyingTransform;

        if (this.drag.target === this.rotHandle) {
            const from = trigo.pdnRad(globPos.x, globPos.y, this.drag.fromX, this.drag.fromY),
                  to = trigo.pdnRad(globPos.x, globPos.y, this.drag.toX, this.drag.toY);
            let delta = trigo.deltaDirRad(from, to);
            // Snap rotation to 15° when shift is pressed
            if (this.state.shift) {
                delta = trigo.degToRad(Math.round(trigo.radToDeg(delta) / 15) * 15);
            }
            t.rotation = this.previousRotation + delta;
        } else if (this.drag.target === this.scaleXHandle) {
            const fromDist = this.drag.fromX - this.selfPreviousGlobalTransform.tx; // k === 1;
            const toDist = this.drag.toX - this.selfPreviousGlobalTransform.tx;

            let k = toDist / fromDist;
            if (this.state.shift) {
                k = Math.round(k / 0.1) * 0.1;
            }
            if (!this.state.alt) {
                k = (k - 1) / 2 + 1;
                t.position.x = this.previousTransformL.tx + Math.cos(t.rotation) * hw * (k - 1);
                t.position.y = this.previousTransformL.ty + Math.sin(t.rotation) * hh * (k - 1);
            } else {
                t.position.x = this.previousTransformL.tx;
                t.position.y = this.previousTransformL.ty;
            }
            t.scale.x = this.previousTransformL.a * k;
        }
        this.realign();
    }
    stopDragging() {
        this.drag = false;
    }
}

module.exports = Transformer;
