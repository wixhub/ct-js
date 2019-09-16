const glob = require('./../glob');
const {extend, equal} = require('./../objectUtils');
const Transformer = require('./Transformer');
const Background = require('./Background');
const TileLayer = require('./TileLayer');
const CopyLayer = require('./CopyLayer');
const Viewport = require('./Viewport');
const everywhere = {
    contains() {
        return true;
    }
};
const layerMap = {
    copies: CopyLayer,
    tiles: TileLayer,
    background: Background,
    viewport: Viewport
};

const defaultSelectData = {
    selecting: false
};

const getCopySelection = function (copies, rect) {
    const selection = [];
    for (const copy of copies) {
        // the texture object of a copy;
        const {g} = glob.texturemap[window.currentProject.types[glob.typemap[copy.uid]].texture];
        const x1 = copy.x - g.axis[0] * (copy.tx || 1),
                x2 = copy.x - (g.axis[0] - g.width) * (copy.tx || 1),
                y1 = copy.y - g.axis[1] * (copy.ty || 1),
                y2 = copy.y - (g.axis[1] - g.height) * (copy.ty || 1),
                xcmin = Math.min(x1, x2), // sort values so negatively scaled copies count as well
                ycmin = Math.min(y1, y2),
                xcmax = Math.max(x1, x2),
                ycmax = Math.max(y1, y2);
        if (xcmin > rect.x1 && xcmax < rect.x2 && // inclusion into a rect
            ycmin > rect.y1 && ycmax < rect.y2) {
            const ind = this.selectedCopies.indexOf(copy);
            if (ind === -1) {
                this.selectedCopies.push(copy);
            }
        }
    }
    return selection;
};

class Room extends PIXI.Container {
    constructor(template) {
        super();
        this.template = template;
        this.layers = this.children;

        this.interactive = true;
        this.hitArea = everywhere; // set a custom hit area so we can drag the room from anywhere
                                   // otherwise, a Room will catch clicks on copies and bgs only
        this.populate();

        this.select = extend({}, defaultSelectData);
        this.selectBox = new PIXI.Graphics();
        this.selectBox.depth = Infinity;
        this.addChild(this.selectBox);

        // Setup listeners for user input (for room editing)
        this.on('pointerdown', this.onDown);
        this.on('pointermove', this.onMove);
        this.on('pointerup', this.onUp);
        this.on('pointerupoutside', this.onUp);

        this.loop = () => {
            for (const child of this.children) {
                if (child.onDraw) {
                    child.onDraw();
                }
            }
        };
    }
    /**
     * A helper function to add a listener to a specific Ticker
     * @param {PIXI.Ticker} ticker The ticker to add a listener to.
     * @returns {void}
     */
    bindLoop(ticker) {
        ticker.add(this.loop);
    }
    /**
     * Creates all the needed layers on startup, based on template's layer collection
     * @returns {void}
     */
    populate() {
        for (const layer of this.template.layers) {
            this.addLayerFromTemplate(layer, true);
        }
    }
    /**
     * Adds a layer of a corresponding type
     * @param {Object} data The template data of the layer
     * @param {Boolean} [noTemplateUpdate] If set to true, the function will not add
     *        the new layer to this.template.layers.
     * @returns {Layer} The created layer
     */
    addLayerFromTemplate(data, noTemplateUpdate) {
        const layer = new (layerMap[data.type])(data);
        this.addChild(layer);
        if (!noTemplateUpdate) {
            this.template.layers.push(data);
        }
        return layer;
    }
    /**
     * Mouse/touch event handler
     * @param {Object} e Pixi's event object
     * @returns {void}
     */
    onDown(e) {
        // start selecting if a left mouse is pressed with no modifiers
        if (e.data.button === 0 && equal(this.editor.state, {
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
    /**
     * Mouse/touch event handler
     * @param {Object} e Pixi's event object
     * @returns {void}
     */
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
    /**
     * Mouse/touch event handler
     * @returns {void}
     */
    onUp() {
        // There was a selection. Let's hide the selection box
        // and create a Transformer.
        const rect = {
            x1: Math.min(this.select.fromX, this.select.toX),
            y1: Math.min(this.select.fromY, this.select.toY),
            x2: Math.max(this.select.fromX, this.select.toX),
            y2: Math.max(this.select.fromY, this.select.toY)
        };
        if (this.select.selecting) {
            this.selectBox.clear();
            const selection = getCopySelection(this.copies, rect);
            if (selection && selection.length) {
                const transformer = new Transformer(selection);
                this.addChild(transformer);
                this.activeTransformer = transformer;
            }
        }
        this.select.selecting = false;
    }
    /**
     * Returns the width of the drawing canvas of the editor, in pixels
     * @returns {Number} The width of the drawing canvas of the editor
     */
    getEditorWidth() {
        return this.editor.pixiApp.view.width;
    }
    /**
     * Returns the height of the drawing canvas of the editor, in pixels
     * @returns {Number} The height of the drawing canvas of the editor
     */
    getEditorHeight() {
        return this.editor.pixiApp.view.height;
    }

    /**
     * Updates the graphical depiction of the selection box
     * @returns {void}
     */
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

module.exports = Room;
