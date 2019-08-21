/* global Copy Background TileLayer PIXI */

// eslint-disable-next-line no-unused-vars
class Room extends PIXI.Container {
    constructor(template) {
        super();
        this.copies = [];
        this.backgrounds = [];
        this.tileLayers = [];

        this.template = template;
        this.populate();
        console.log(this);
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
        bg.onDraw();
    }
    addTileLayer(data) {
        const layer = new TileLayer(data);
        this.addChild(layer);
        this.tileLayers.push(layer);
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
}
