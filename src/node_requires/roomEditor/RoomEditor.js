/* global PIXI glob */
const Room = require('./Room');

const roomEditorDefaults = {
    width: 10,
    height: 10,
    autoDensity: true,
    transparent: true,
    sharedLoader: true,
    roundPixels: true,
    resolution: devicePixelRatio,
    antialias: true
};

const defaultTextStyle = new PIXI.TextStyle({
    dropShadow: true,
    dropShadowDistance: 2,
    dropShadowAlpha: 0.35,
    fill: '#fff',
    fontFamily: '\'Open Sans\',sans-serif,serif',
    fontSize: 16
});

const defaultDragData = {
    dragging: false
};

// eslint-disable-next-line no-unused-vars
class RoomEditor extends PIXI.Application {
    /**
     * Creates a pixi.js app — a room editor
     * Its `stage` manipulates the camera, managing panning and zooming.
     * All the CRUD operations are in the Room class.
     *
     * @param {Object} opts A partial set of PIXI.Application options that should include a mounting point (`view`)
     * @param {RiotTag} editor a tag instance of a `room-editor`
     */
    constructor(opts, editor) {
        const data = glob.extend(glob.extend({}, roomEditorDefaults), opts);
        super(data);

        this.room = new Room(editor.room);
        this.room.bindLoop(this.ticker);
        this.stage.addChild(this.room);

        this.editor = this.room.editor = editor;

        this.stage.interactive = true;

        // Create a label that will display current mouse coords relative to a room,
        // in a left-bottom corner. Useful for lining up things in a level.
        this.pointerCoords = new PIXI.Text('(0; 0)', defaultTextStyle);
        this.pointerCoords.depth = Infinity;
        this.pointerCoords.x = 8;
        this.stage.addChild(this.pointerCoords);

        // Create an empty Container that will be used as a camera.
        // The camera provides inverted transforms for proper view placement.
        this.camera = new PIXI.Container();
        this.camera.x = this.room.template.width / 2 + this.room.template.x;
        this.camera.y = this.room.template.height / 2 + this.room.template.y;
        this.stage.addChild(this.camera);
        this.room.camera = this.camera;

        // Setup listeners for user input (for view management)
        this.stage.on('pointerdown', this.onDown.bind(this));
        this.stage.on('pointermove', this.onMove.bind(this));
        this.stage.on('pointerup', this.onUp.bind(this));
        this.stage.on('pointerupoutside', this.onUp.bind(this));

        this.drag = glob.extend({}, defaultDragData);


        this.loop = () => {
            this.realignCamera();
        };
        this.ticker.add(this.loop);
    }
    onDown(e) {
        // start dragging if Space key is down OR a middle mouse button is pressed
        if (this.editor.state.space || e.data.button === 1) {
            this.drag.dragging = true;
            this.drag.fromGX = e.data.global.x;
            this.drag.fromGY = e.data.global.y;
            this.drag.fromCX = this.camera.x;
            this.drag.fromCY = this.camera.y;
            this.stage.buttonMode = true;
            this.interactiveChildren = false;
        } else {
            this.stage.buttonMode = false;
            this.interactiveChildren = true;
        }
    }
    onMove(e) {
        const roomPos = this.room.toLocal(new PIXI.Point(e.data.global.x, e.data.global.y));
        this.pointerCoords.text = `(${Math.round(roomPos.x)}; ${Math.round(roomPos.y)})`;

        // Show a different cursor when Space key is pressed
        if (this.editor.state.space) {
            this.stage.buttonMode = true;
        } else {
            this.stage.buttonMode = false;
        }
        // handle movement while dragging around
        if (this.drag.dragging) {
            this.interactiveChildren = false;
            this.camera.x = this.drag.fromCX + (this.drag.fromGX - e.data.global.x) * this.camera.scale.x;
            this.camera.y = this.drag.fromCY + (this.drag.fromGY - e.data.global.y) * this.camera.scale.y;
        } else {
            this.interactiveChildren = true;
        }
    }
    onUp() {
        this.drag.dragging = false;
    }
    realignCamera() {
        this.room.transform.setFromMatrix(
            this.camera.worldTransform
            .clone()
            .invert()
            .translate(this.view.width / devicePixelRatio / 2, this.view.height / devicePixelRatio / 2)
        );
    }
}
exports = RoomEditor;
