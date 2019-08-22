/* global Copy Background TileLayer Viewport PIXI */

const everywhere = {
    contains() {
        return true;
    }
};

// eslint-disable-next-line no-unused-vars
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
        console.log(this);

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
            height: this.template.height
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
        console.log(e);
        if (this.editor.state.space || e.data.button === 1) { // start dragging if Space key is down OR a middle mouse button is pressed
            this.startX = e.data.global.x;
            this.startY = e.data.global.y;
            this.dragging = true;
            this.buttonMode = true;
            this.interactiveChildren = false;
            this.oldPositionX = this.pivot.x;
            this.oldPositionY = this.pivot.y;
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
        if (this.dragging) {
            this.interactiveChildren = false;
            this.pivot.x = this.oldPositionX - (e.data.global.x - this.startX) / this.scale.x;
            this.pivot.y = this.oldPositionY - (e.data.global.y - this.startY) / this.scale.y;
        } else {
            this.interactiveChildren = true;
        }
    }
    onUp() {
        this.dragging = false;
    }
    getEditorWidth() {
        return this.editor.pixiApp.view.width;
    }
    getEditorHeight() {
        return this.editor.pixiApp.view.height;
    }
    bindLoop(ticker) {
        ticker.add(this.loop);
        ticker.addOnce(() => {
            this.x = this.getEditorWidth() / 2;
            this.y = this.getEditorHeight() / 2;
            this.pivot.x = this.template.width / 2;
            this.pivot.y = this.template.height / 2;
        });
    }
    unbindLoop(ticker) {
        ticker.remove(this.loop);
    }
}
