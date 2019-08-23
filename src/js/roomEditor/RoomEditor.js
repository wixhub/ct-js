/* global PIXI glob Room */
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

// eslint-disable-next-line no-unused-vars
class RoomEditor extends PIXI.Application {
    /**
     * Creates a pixi.js app — a room editor
     *
     * @param {Object} opts A partial set of PIXI.Application options that should include a mounting point (`view`)
     * @param {RiotTag} editor a tag instance of a `room-editor`
     */
    constructor(opts, editor) {
        const data = glob.extend(glob.extend({}, roomEditorDefaults), opts);
        super(data);
        this.room = new Room(editor.room);
        this.editor = this.room.editor = editor;
        this.stage.addChild(this.room);
        this.room.bindLoop(this.ticker);

        this.stage.interactive = true;
        this.onMove = e => {
            const roomPos = this.room.toLocal(new PIXI.Point(e.data.global.x, e.data.global.y));
            this.pointerCoords.text = `(${Math.round(roomPos.x)}; ${Math.round(roomPos.y)})`;
        };
        this.stage.on('pointermove', this.onMove);

        this.pointerCoords = new PIXI.Text('(0; 0)', defaultTextStyle);
        this.pointerCoords.depth = Infinity;
        this.pointerCoords.x = 8;
        this.stage.addChild(this.pointerCoords);

        this.camera = new PIXI.Container();
        this.camera.x = this.room.template.width / 2;
        this.camera.y = this.room.template.height / 2;
        this.stage.addChild(this.camera);
        this.room.camera = this.camera;

        this.loop = () => {
            this.realignCamera();
        };
        this.ticker.add(this.loop);
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
