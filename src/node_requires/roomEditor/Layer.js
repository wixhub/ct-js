class Layer extends PIXI.Container {
    constructor(data) {
        super();
        this.template = data;
    }
    get visible() {
        if (this.template) {
            return !this.template.hidden;
        }
        return true;
    }
    set visible(val) {
        if (this.template) {
            this.template.hidden = !val;
        }
    }
    getBoundingBox() {
        //const worldBounds = this.getBounds();
        //const p1 = new PIXI.Point(worldBounds.x, worldBounds.y),
        //      p2 = new PIXI.Point(worldBounds.width, worldBounds.height);
        //this.parent.
        //return new PIXI.Rectangle(p1.x, p1.y, p2.x, p2.y);
        return this.getLocalBounds();
    }
}

module.exports = Layer;
