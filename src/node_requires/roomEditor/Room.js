const {extend, equal} = require('./../objectUtils');
const Transformer = require('./Transformer');

const Background = require('./Background');

const Layer = require('./Layer');
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

/**
 * Takes a Layer and a PIXI.Rectangle
 * and returns all the items that are contained inside the given rectangle
 * @param {Layer|Background} layer A layer with items
 * @param {PIXI.Rectangle} rect A rectangular selection
 * @returns {Array<Copy|Tile>} The selected items
 */
const getSelection = function (layer, rect) {
    const selection = [];
    if (layer instanceof Layer) {
        const items = layer.children;
        if (!items) {
            return selection; // it will be an empty array
        }
        for (const item of items) {
            const bbox = item.getLocalBounds();
            bbox.x += item.x;
            bbox.y += item.y;
            if (rect.contains(bbox.left, bbox.top) && rect.contains(bbox.right, bbox.bottom)) {
                const ind = selection.indexOf(item);
                if (ind === -1) {
                    selection.push(item);
                }
            }
        }
        return selection;
        // Other Layer instances that do not support selection
    }
    // BGs are not instances of Layer, so they require a separate check
    if (layer instanceof Background) {
        return selection; // it will be an empty array
    }
    throw new Error('getSelection requires a layer to be given');
};

class Room extends PIXI.Container {
    constructor(template) {
        super();
        this.template = template;
        this.layers = [];

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
     * @param {Number} [customPos] If set, the new layer will be inserted to a given
     *        position (starting from the most bottom layer at 0)
     * @returns {Layer} The created layer
     */
    addLayerFromTemplate(data, noTemplateUpdate, customPos) {
        const layer = new (layerMap[data.type])(data);
        if (customPos) {
            this.addChildAt(layer, customPos);
            this.layers.splice(customPos, 0, layer);
        } else {
            this.addChild(layer);
            this.layers.push(layer);
        }
        if (!noTemplateUpdate) {
            if (customPos) {
                this.template.layers.splice(customPos, 0, data);
            } else {
                this.template.layers.push(data);
            }
        }
        return layer;
    }

    /**
     * Gets a currently active Layer, according to that one that is set in a room-editor.tag
     * Their arrays of layers are expected to be parallel
     * @returns {Layer} The currently active layer.
     */
    get currentLayer() {
        return this.layers[this.template.layers.indexOf(this.editor.activeLayer)];
    }
    /**
     * Gets a Layer instance that corresponds to a given template
     * Their arrays of layers are expected to be parallel
     * @param {Object} template The template to match to
     * @returns {Layer} The corresponds layer
     */
    templateToLayer(template) {
        return this.layers[this.template.layers.indexOf(template)];
    }
    /**
     * Removes a given layer
     * @param {Object} layer The layer to remove (a source template data)
     * @returns {void}
     */
    removeLayer(layer) {
        const ind = this.template.layers.indexOf(layer);
        this.removeLayerAt(ind);
    }
    /**
     * Removes a layer at a given index
     * @param {Number} ind The position of a layer to delete, starting with 0
     * @returns {void}
     */
    removeLayerAt(ind) {
        const [layer] = this.layers.splice(ind, 1);
        this.removeChild(layer);
        this.template.layers.splice(ind, 1);
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
        const x1 = Math.min(this.select.fromX, this.select.toX),
              y1 = Math.min(this.select.fromY, this.select.toY),
              x2 = Math.max(this.select.fromX, this.select.toX),
              y2 = Math.max(this.select.fromY, this.select.toY);
        const rect = new PIXI.Rectangle(x1, y1, x2-x1, y2-y1);
        if (this.select.selecting) {
            this.selectBox.clear();
            const selection = getSelection(this.currentLayer, rect);
            if (selection && selection.length) {
                const transformer = new Transformer(selection);
                this.addChild(transformer);
                transformer.state = this.editor.state;
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
        return this.editor.roomEditor.view.width;
    }
    /**
     * Returns the height of the drawing canvas of the editor, in pixels
     * @returns {Number} The height of the drawing canvas of the editor
     */
    getEditorHeight() {
        return this.editor.roomEditor.view.height;
    }

    /**
     * Updates the graphical depiction of the selection box
     * @returns {void}
     */
    redrawSelectBox() {
        const x = Math.min(this.select.fromX, this.select.toX) - 0.5,
              y = Math.min(this.select.fromY, this.select.toY) - 0.5;
        this.selectBox.clear();
        this.selectBox
        .lineStyle(3, 0x446adb)
        .drawRoundedRect(x, y, Math.abs(this.select.toX - this.select.fromX) + 1, Math.abs(this.select.toY - this.select.fromY + 1), 0.1);
        this.selectBox
        .lineStyle(1, 0xffffff)
        .drawRoundedRect(x, y, Math.abs(this.select.toX - this.select.fromX) + 1, Math.abs(this.select.toY - this.select.fromY + 1), 0.1);
    }

    /**
     * Sets a default viewport for the current room
     * @param {Viewport|Object} view The new default viewport
     * @returns {void}
     */
    setDefaultViewport(view) {
        for (const layer of this.layers) {
            if (layer instanceof Viewport) {
                layer.setDefault(
                    layer === view ||
                    layer === this.layers[this.template.layers.indexOf(view)]
                );
            }
        }
    }
}

module.exports = Room;
