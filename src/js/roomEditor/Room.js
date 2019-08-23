/* global Copy Background TileLayer Viewport PIXI glob */
(function () {
    const everywhere = {
        contains() {
            return true;
        }
    };

    const defaultSelectData = {
        selecting: false
    };

    class Room extends PIXI.Container {
        constructor(template) {
            super();
            this.template = template;
            this.copies = [];
            this.backgrounds = [];
            this.tileLayers = [];
            this.viewports = [];

            this.interactive = true;
            this.hitArea = everywhere; // set a custom hit area so we can drag the room from anywhere
                                       // otherwise, a Room will catch clicks on copies and bgs only
            this.populate();

            this.select = glob.extend({}, defaultSelectData);
            this.selectBox = new PIXI.Graphics();
            this.selectBox.depth = Infinity;
            this.addChild(this.selectBox);

            // Setup listeners for user input (for room editing)
            this.on('pointerdown', this.onDown);
            this.on('pointermove', this.onMove);
            this.on('pointerup', this.onUp);
            this.on('pointerupoutside', this.onUp);

            this.loop = () => {
                for (const bg of this.backgrounds) {
                    bg.onDraw();
                }
            };
        }
        bindLoop(ticker) {
            ticker.add(this.loop);
        }
        addCopy(data) {
            const copy = new Copy(data);
            this.addChild(copy);
            this.copies.push(copy);
        }
        addBackground(data) {
            const bg = new Background(data);
            this.addChild(bg);
            this.backgrounds.push(bg);
            //bg.onDraw();
        }
        addTileLayer(data) {
            const layer = new TileLayer(data);
            this.addChild(layer);
            this.tileLayers.push(layer);
        }
        addViewport(data) {
            const view = new Viewport(data);
            this.viewports.push(view);
            this.addChild(view);
        }
        populate() {
            for (const copy of this.template.copies) {
                this.addCopy(copy);
            }
            for (const bg of this.template.backgrounds) {
                this.addBackground(bg);
            }
            for (const layer of this.template.tileLayers) {
                this.addTileLayer(layer);
            }
            this.addViewport({
                width: this.template.width,
                height: this.template.height,
                x: this.template.x,
                y: this.template.y
            });
            this.sort();
        }
        sort() {
            this.children.sort((a, b) =>
                ((a.depth || 0) - (b.depth || 0)) || 0
            );
        }
        writeToTemplate() {
            this.template.copies = this.copies.map(copy => copy.serialize());
            this.template.backgrounds = this.backgrounds.map(bg => bg.serialize());
            this.template.tiles = this.tileLayers.map(layer => layer.serialize());
        }
        onDown(e) {
            // start selecting if a left mouse is pressed with no modifiers
            if (e.data.button === 0 && glob.equal(this.editor.state, {
                shift: false,
                ctrl: false,
                alt: false,
                space: false
            })) {
                this.interactiveChildren = false;
                this.select.selecting = true;
                const local = this.toLocal(e.data.global);
                this.select.fromX = local.x;
                this.select.fromY = local.y;
            } else {
                this.buttonMode = false;
            }
        }
        onMove(e) {
            // Show a different cursor when Space key is pressed
            if (this.editor.state.space) {
                this.buttonMode = true;
            } else {
                this.buttonMode = false;
            }
            // Draw a selection box
            if (this.select.selecting) {
                this.interactiveChildren = false;
                const local = this.toLocal(e.data.global);
                this.select.toX = local.x;
                this.select.toY = local.y;
                this.redrawSelectBox();
            } else {
                this.interactiveChildren = true;
            }
        }
        onUp() {
            // There was a selection. Let's hide the selection box
            // and create a Transformer.
            if (this.select.selecting) {
                this.selectBox.clear();
                // TODO:
            }
            this.select.selecting = false;
        }
        getEditorWidth() {
            return this.editor.pixiApp.view.width;
        }
        getEditorHeight() {
            return this.editor.pixiApp.view.height;
        }

        redrawSelectBox() {
            this.selectBox.clear();
            this.selectBox
            .lineStyle(3, 0x446adb)
            .drawRect(this.select.fromX - 0.5, this.select.fromY - 0.5, this.select.toX - this.select.fromX + 1, this.select.toY - this.select.fromY + 1);
            this.selectBox
            .lineStyle(1, 0xffffff)
            .drawRect(this.select.fromX - 0.5, this.select.fromY - 0.5, this.select.toX - this.select.fromX + 1, this.select.toY - this.select.fromY + 1);
        }
    }

    window.Room = Room;
})();
