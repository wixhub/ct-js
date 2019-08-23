/* global Copy Background TileLayer Viewport PIXI glob */
(function () {
    const everywhere = {
        contains() {
            return true;
        }
    };

    const defaultDragData = {
        dragging: false
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

            this.on('pointerdown', this.onDown);
            this.on('pointermove', this.onMove);
            this.on('pointerup', this.onUp);
            this.on('pointerupoutside', this.onUp);

            this.dragData = glob.extend({}, defaultDragData);

            this.loop = () => {
                for (const bg of this.backgrounds) {
                    bg.onDraw();
                }
            };
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
            if (this.editor.state.space || e.data.button === 1) { // start dragging if Space key is down OR a middle mouse button is pressed
                this.dragData.fromGX = e.data.global.x;
                this.dragData.fromGY = e.data.global.y;
                this.dragData.fromCX = this.camera.x;
                this.dragData.fromCY = this.camera.y;
                this.dragData.dragging = true;
                this.buttonMode = true;
                this.interactiveChildren = false;
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
            // handle movement while dragging around
            if (this.dragData.dragging) {
                this.interactiveChildren = false;
                this.camera.x = this.dragData.fromCX + (this.dragData.fromGX - e.data.global.x) * this.camera.scale.x;
                this.camera.y = this.dragData.fromCY + (this.dragData.fromGY - e.data.global.y) * this.camera.scale.y;
            } else {
                this.interactiveChildren = true;
            }
        }
        onUp() {
            this.dragData.dragging = false;
        }
        getEditorWidth() {
            return this.editor.pixiApp.view.width;
        }
        getEditorHeight() {
            return this.editor.pixiApp.view.height;
        }
        bindLoop(ticker) {
            ticker.add(this.loop);
        }
        unbindLoop(ticker) {
            ticker.remove(this.loop);
        }
    }

    window.Room = Room;
})();
