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
}

module.exports = Layer;
