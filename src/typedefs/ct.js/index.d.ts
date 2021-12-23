import * as PIXI from 'pixi.js';

interface IBackgroundTemplate {
    // TODO:
}

/**
 * A class that extends PIXI.TilingSprite, adding positioning logic and parallax effect.
 */
 declare class Background extends PIXI.TilingSprite {
    /**
     * Updates the position of this background.
     */
    reposition(): void;
    /**
     * How much to shift the texture horizontally, in pixels.
    */
    shiftX: number;
    /**
     * How much to shift the texture vertically, in pixels.
    */
    shiftY: number;
    /**
     * The speed at which the background's texture moves by X axis,
    wrapping around its area. The value is measured in pixels per frame, and takes
    `ct.delta` into account.
    */
    movementX: number;
    /**
     * The speed at which the background's texture moves by Y axis,
    wrapping around its area. The value is measured in pixels per frame, and takes
    `ct.delta` into account.
    */
    movementY: number;
    /**
     * A value that makes background move faster
    or slower relative to other objects. It is often used to create an effect of depth.
    `1` means regular movement, values smaller than 1
    will make it move slower and make an effect that a background is placed farther away from camera;
    values larger than 1 will do the opposite, making the background appear closer than the rest
    of object.
    This property is for horizontal movement.
    */
    parallaxX: number;
    /**
     * A value that makes background move faster
    or slower relative to other objects. It is often used to create an effect of depth.
    `1` means regular movement, values smaller than 1
    will make it move slower and make an effect that a background is placed farther away from camera;
    values larger than 1 will do the opposite, making the background appear closer than the rest
    of object.
    This property is for vertical movement.
    */
    parallaxY: number;
    constructor(bgName: string, frame: number, depth: number, exts: object);
    constructor(pixiTexture: PIXI.Texture, frame: number, depth: number, exts: object);
    depth: number;
    scaleX: number;
    scaleY: number;
    repeat: string;
}
/**
 * This class represents a camera that is used by ct.js' cameras.
 * Usually you won't create new instances of it, but if you need, you can substitute
 * ct.camera with a new one.
 */
 declare class Camera extends PIXI.Container {
    constructor();
    /**
     * Moves the camera to a new position. It will have a smooth transition
     * if a `drift` parameter is set.
     * @param x - New x coordinate
     * @param y - New y coordinate
     */
    moveTo(x: number, y: number): void;
    /**
     * Moves the camera to a new position. Ignores the `drift` value.
     * @param x - New x coordinate
     * @param y - New y coordinate
     */
    teleportTo(x: number, y: number): void;
    /**
     * Updates the position of the camera
     * @param delta - A delta value between the last two frames.
     * This is usually ct.delta.
     */
    update(delta: number): void;
    /**
     * Returns the current camera position plus the screen shake effect.
     */
    computedX: number;
    /**
     * Returns the current camera position plus the screen shake effect.
     */
    computedY: number;
    /**
     * Returns the position of the left edge where the visible rectangle ends,
     * in game coordinates.
     * This can be used for UI positioning in game coordinates.
     * This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopLeftCorner`
     * and `getBottomLeftCorner` methods.
     */
    readonly left: number;
    /**
     * Returns the position of the top edge where the visible rectangle ends,
     * in game coordinates.
     * This can be used for UI positioning in game coordinates.
     * This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopLeftCorner`
     * and `getTopRightCorner` methods.
     */
    readonly top: number;
    /**
     * Returns the position of the right edge where the visible rectangle ends,
     * in game coordinates.
     * This can be used for UI positioning in game coordinates.
     * This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopRightCorner`
     * and `getBottomRightCorner` methods.
     */
    readonly right: number;
    /**
     * Returns the position of the bottom edge where the visible rectangle ends,
     * in game coordinates. This can be used for UI positioning in game coordinates.
     * This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getBottomLeftCorner`
     * and `getBottomRightCorner` methods.
     */
    readonly bottom: number;
    /**
     * Translates a point from UI space to game space.
     * @param x - The x coordinate in UI space.
     * @param y - The y coordinate in UI space.
     * @returns A pair of new `x` and `y` coordinates.
     */
    uiToGameCoord(x: number, y: number): PIXI.Point;
    /**
     * Translates a point from game space to UI space.
     * @param x - The x coordinate in game space.
     * @param y - The y coordinate in game space.
     * @returns A pair of new `x` and `y` coordinates.
     */
    gameToUiCoord(x: number, y: number): PIXI.Point;
    /**
     * Gets the position of the top-left corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates,
     * especially with rotated viewports.
     * @returns A pair of `x` and `y` coordinates.
     */
    getTopLeftCorner(): PIXI.Point;
    /**
     * Gets the position of the top-right corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates,
     * especially with rotated viewports.
     * @returns A pair of `x` and `y` coordinates.
     */
    getTopRightCorner(): PIXI.Point;
    /**
     * Gets the position of the bottom-left corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates,
     * especially with rotated viewports.
     * @returns A pair of `x` and `y` coordinates.
     */
    getBottomLeftCorner(): PIXI.Point;
    /**
     * Gets the position of the bottom-right corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates,
     * especially with rotated viewports.
     * @returns A pair of `x` and `y` coordinates.
     */
    getBottomRightCorner(): PIXI.Point;
    /**
     * Returns the bounding box of the camera.
     * Useful for rotated viewports when something needs to be reliably covered by a rectangle.
     * @returns The bounding box of the camera.
     */
    getBoundingBox(): PIXI.Rectangle;
    /**
     * Checks whether a given object (or any Pixi's DisplayObject)
     * is potentially visible, meaning that its bounding box intersects
     * the camera's bounding box.
     * @param copy - An object to check for.
     * @returns `true` if an object is visible, `false` otherwise.
     */
    contains(copy: PIXI.DisplayObject): boolean;
    /**
     * Realigns all the copies in a room so that they distribute proportionally
     * to a new camera size based on their `xstart` and `ystart` coordinates.
     * Will throw an error if the given room is not in UI space (if `room.isUi` is not `true`).
     * You can skip the realignment for some copies
     * if you set their `skipRealign` parameter to `true`.
     * @param room - The room which copies will be realigned.
     */
    realign(room: Room): void;
    /**
     * This will align all non-UI layers in the game according to the camera's transforms.
     * This is automatically called internally, and you will hardly ever use it.
     */
    manageStage(): void;
    /**
     * The real x-coordinate of the camera.
    It does not have a screen shake effect applied, as well as may differ from `targetX`
    if the camera is in transition.
    */
    public get x(): number;
    public set x(value: number);
    /**
     * The real y-coordinate of the camera.
     * It does not have a screen shake effect applied, as well as may differ from `targetY`
     * if the camera is in transition.
    */
     public get y(): number;
     public set y(value: number);
    /**
     * The width of the unscaled shown region.
     * This is the base, unscaled value. Use ct.camera.scale.x to get a scaled version.
     * To change this value, see `ct.width` property.
    */
     public get width(): number;
     public set width(value: number);
    /**
     * The width of the unscaled shown region.
    This is the base, unscaled value. Use ct.camera.scale.y to get a scaled version.
    To change this value, see `ct.height` property.
    */
     public get height(): number;
     public set height(value: number);
    /**
     * The x-coordinate of the target location.
    Moving it instead of just using the `x` parameter will trigger the drift effect.
    */
    targetX: number;
    /**
     * The y-coordinate of the target location.
    Moving it instead of just using the `y` parameter will trigger the drift effect.
    */
    targetY: number;
    /**
     * If set, the camera will follow the given copy.
    */
    follow: Copy | false;
    /**
     * Works if `follow` is set to a copy.
    Enables following in X axis. Set it to `false` and followY to `true`
    to limit automatic camera movement to vertical axis.
    */
    followX: boolean;
    /**
     * Works if `follow` is set to a copy.
    Enables following in Y axis. Set it to `false` and followX to `true`
    to limit automatic camera movement to horizontal axis.
    */
    followY: boolean;
    /**
     * Works if `follow` is set to a copy.
    Sets the frame inside which the copy will be kept, in game pixels.
    Can be set to `null` so the copy is set to the center of the screen.
    */
    borderX: number | null;
    /**
     * Works if `follow` is set to a copy.
    Sets the frame inside which the copy will be kept, in game pixels.
    Can be set to `null` so the copy is set to the center of the screen.
    */
    borderY: number | null;
    /**
     * Displaces the camera horizontally
    but does not change x and y parameters.
    */
    shiftX: number;
    /**
     * Displaces the camera vertically
    but does not change x and y parameters.
    */
    shiftY: number;
    /**
     * Works if `follow` is set to a copy.
    If set to a value between 0 and 1, it will make camera movement smoother
    */
    drift: number;
    /**
     * The current power of a screen shake effect,
    relative to the screen's max side (100 is 100% of screen shake).
    If set to 0 or less, it, disables the effect.
    */
    shake: number;
    /**
     * The current phase of screen shake oscillation.
    */
    shakePhase: number;
    /**
     * The amount of `shake` units substracted in a second.
    Default is 5.
    */
    shakeDecay: number;
    /**
     * The base frequency of the screen shake effect.
    Default is 50.
    */
    shakeFrequency: number;
    /**
     * A multiplier applied to the horizontal screen shake effect.
    Default is 1.
    */
    shakeX: number;
    /**
     * A multiplier applied to the vertical screen shake effect.
    Default is 1.
    */
    shakeY: number;
    /**
     * The maximum possible value for the `shake` property
    to protect players from losing their monitor, in `shake` units. Default is 10.
    */
    shakeMax: number;
}
interface IShapeTemplate {
    // TODO:
}

/**
 * The base class for all the copies in a ct.js game.
 */
 declare class Copy extends PIXI.AnimatedSprite {
    constructor();
    /**
     * The name of the current copy's texture, or -1 for an empty texture.
     */
    tex: string | number;
    /**
     * The speed of a copy that is used in `this.move()` calls
     */
    speed: number;
    /**
     * The moving direction of the copy, in degrees, starting with 0 at the right side
     * and going with 90 facing upwards, 180 facing left, 270 facing down.
     * This parameter is used by `this.move()` call.
     */
    direction: number;
    /**
     * Performs a movement step, reading such parameters as `gravity`, `speed`, `direction`.
     */
    move(): void;
    /**
     * Adds a speed vector to the copy, accelerating it by a given delta speed
     * in a given direction.
     * @param spd - Additive speed
     * @param dir - The direction in which to apply additional speed
     */
    addSpeed(spd: number, dir: number): void;
    /**
     * Returns the room that owns the current copy
     * @returns The room that owns the current copy
     */
    getRoom(): Room;
    /**
     * The name of the type from which the copy was created
    */
    type: string;
    /**
     * The collision shape of a copy
    */
    shape: IShapeTemplate;
    /**
     * The horizontal location of a copy in the previous frame
    */
    xprev: number;
    /**
     * The vertical location of a copy in the previous frame
    */
    yprev: number;
    /**
     * The starting location of a copy,
    meaning the point where it was created — either by placing it in a room with ct.IDE
    or by calling `ct.types.copy`.
    */
    xstart: number;
    /**
     * The starting location of a copy,
    meaning the point where it was created — either by placing it in a room with ct.IDE
    or by calling `ct.types.copy`.
    */
    ystart: number;
    /**
     * The horizontal speed of a copy
    */
    hspeed: number;
    /**
     * The vertical speed of a copy
    */
    vspeed: number;
    /**
     * The acceleration that pulls a copy at each frame
    */
    gravity: number;
    /**
     * The direction of acceleration that pulls a copy at each frame
    */
    gravityDir: number;
    /**
     * The position of a copy in draw calls
    */
    depth: number;
    /**
     * If set to `true`, the copy will be destroyed by the end of a frame.
    */
    kill: boolean;
    // Everything a user writes to a copy is valid!
    [key: string]: any;
}

/**
 * This is a custom action defined in the Settings tab → Edit actions section.
 * Actions are used to abstract different input methods into one gameplay-related interface:
 * for example, joystick movement, WASD keys and arrows can be turned into two actions:
 * `MoveHorizontally` and `MoveVertically`.
 * @property value - The current value of an action. It is always in the range from -1 to 1.
 * @property name - The name of the action.
 * @param name - The name of the new action.
 */
 declare class CtAction {
    constructor(name: string);
    /**
     * Checks whether the current action listens to a given input method.
     * This *does not* check whether this input method is supported by ct.
     * @param code - The code to look up.
     * @returns `true` if it exists, `false` otherwise.
     */
    methodExists(code: string): boolean;
    /**
     * Adds a new input method to listen.
     * @param code - The input method's code to listen to. Must be unique per action.
     * @param [multiplier] - An optional multiplier, e.g. to flip its value.
     * Often used with two buttons to combine them into a scalar input identical to joysticks.
     */
    addMethod(code: string, multiplier?: number): void;
    /**
     * Removes the provided input method for an action.
     * @param code - The input method to remove.
     */
    removeMethod(code: string): void;
    /**
     * Changes the multiplier for an input method with the provided code.
     * This method will produce a warning if one is trying to change an input method
     * that is not listened by this action.
     * @param code - The input method's code to change
     * @param multiplier - The new value
     */
    setMultiplier(code: string, multiplier: number): void;
    /**
     * Recalculates the digital value of an action.
     * @returns A scalar value between -1 and 1.
     */
    update(): number;
    /**
     * Resets the state of this action, setting its value to `0`
     * and its pressed, down, released states to `false`.
     */
    reset(): void;
    /**
     * Returns whether the action became active in the current frame,
     * either by a button just pressed or by using a scalar input.
     *
     * `true` for being pressed and `false` otherwise
     */
    pressed: boolean;
    /**
     * Returns whether the action became inactive in the current frame,
     * either by releasing all buttons or by resting all scalar inputs.
     *
     * `true` for being released and `false` otherwise
     */
    released: boolean;
    /**
     * Returns whether the action is active, e.g. by a pressed button
     * or a currently used scalar input.
     *
     * `true` for being active and `false` otherwise
     */
    down: boolean;
    /**
     * The current value of an action. It is always in the range from -1 to 1.
    */
    value: number;
    /**
     * The name of the action.
    */
    name: string;
}

/**
 * An object for holding a timer
 * @property isUi - Whether the timer uses ct.deltaUi or not.
 * @property name - The name of the timer
 * @param timeMs - The length of the timer, **in milliseconds**
 * @param [name = false] - The name of the timer
 * @param [uiDelta = false] - If `true`, it will use `ct.deltaUi` for counting time.
 * if `false`, it will use `ct.delta` for counting time.
 */
 declare class CtTimer {
    constructor(timeMs: number, name?: string | false, uiDelta?: boolean);
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled - The callback to execute when the Promise is resolved.
     * @param [onrejected] - The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then(onfulfilled: (...params: any[]) => any, onrejected?: (...params: any[]) => any): Promise<void>;
    /**
     * Attaches a callback for the rejection of the Promise.
     * @param [onrejected] - The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    catch(onrejected?: (...params: any[]) => any): Promise<Error>;
    /**
     * The time passed on this timer, in seconds
     */
    time: number;
    /**
     * Instantly triggers the timer and calls the callbacks added through `then` method.
     */
    resolve(): void;
    /**
     * Stops the timer with a given message by rejecting a Promise object.
     * @param message - The value to pass to the `catch` callback
     */
    reject(message: any): void;
    /**
     * Removes the timer from ct.js game loop. This timer will not trigger.
     */
    remove(): void;
    /**
     * Whether the timer uses ct.deltaUi or not.
    */
    isUi: boolean;
    /**
     * The name of the timer
    */
    name: string | false;
}
interface ITandemSettings {
    /**
     * Optional scaling object with `x` and `y` parameters.
     */
    scale?: ISimplePoint;
    /**
     * Set this to additionally shift the emitter tandem relative
     * to the copy it was attached to, or relative to the copy it follows.
     */
    position?: ISimplePoint;
    /**
     * Optional; if less than 0, it will prewarm the emitter tandem,
     * meaning that it will simulate a given number of seconds before
     * showing particles in the world. If greater than 0, will postpone
     * the effect for the specified number of seconds.
     */
    prewarmDelay?: number;
    /** Optional tint to the whole effect. */
    tint?: number;
    /** Optional opacity set to the whole effect. */
    alpha?: number;
    /** Optional rotation in radians. */
    rotation?: number;
    /** Optional rotation in degrees. */
    angle?: number;
    /**
     * If set to true, will use the time scale of UI layers. This affects
     * how an effect is simulated during slowmo effects and game pause.
     */
    isUi?: boolean;
    /**
     * The depth of the tandem. Defaults to Infinity
     * (will overlay everything).
     */
    depth?: number;
    /**
     * The room to attach the effect to.
     * Defaults to the current main room (ct.room); has no effect if attached to a copy.
     */
    room?: Room;
}

/**
 * Creates a new emitter tandem. This method should not be called directly;
 * better use the methods of `ct.emitters`.
 * @property frozen - If set to true, the tandem will stop updating its emitters
 * @property follow - A copy to follow
 * @param tandemData - The template object of the tandem, as it was exported from ct.IDE.
 * @param opts - Additional settings applied to the tandem
 */
 declare class EmitterTandem extends PIXI.Container {
    /**
     * Creates a new emitter tandem. This method should not be called directly;
     * better use the methods of `ct.emitters`.
     */
    constructor(tandemData: any, opts: ITandemSettings);
    /**
     * A method for internal use; advances the particle simulation further
     * according to either a UI ticker or ct.delta.
     */
    update(): void;
    /**
     * Stops spawning new particles, then destroys itself.
     * Can be fired only once, otherwise it will log a warning.
     */
    stop(): void;
    /**
     * Stops spawning new particles, but continues simulation and allows to resume the effect later
     * with `emitter.resume();`
     */
    pause(): void;
    /**
     * Resumes previously paused effect.
     */
    resume(): void;
    /**
     * Removes all the particles from the tandem, but continues spawning new ones.
     */
    clear(): void;
    /**
     * If set to true, the tandem will stop updating its emitters
    */
    frozen: boolean;
    /**
     * A copy to follow
    */
    follow: Copy | PIXI.DisplayObject;
}

interface ICopyTemplate {
    // TODO:
}

interface ITileTemplate {
    x: number;
    y: number;
}

interface ITileLayerTemplate {
    depth: number;
    tiles: Array<ITileTemplate>
}

interface IRoomTemplate {
    name: string;
    width: number;
    height: number;
    objects: ICopyTemplate;
    bgs: Array<IBackgroundTemplate>;
    tiles: Array<ITileLayerTemplate>;
    onStep(): void;
    onDraw(): void;
    onLeave(): void;
    onCreate(): void;
}

interface IRoomMergeResult {
    copies: Copy[];
    tileLayers: Tilemap[];
    backgrounds: Background[];
}

declare class Room extends PIXI.Container {
    /**
     * Creates an instance of `Room`, based on a given template.
     * @param {object} template The template to use, usually from `ct.rooms.templates`.
     */
    constructor(template: IRoomTemplate);

    /** The horizontal position of the camera */
    public get x(): number;
    public set x(value: number);
    /** The vertical position of the camera */
    public get y(): number;
    public set y(value: number);

    tileLayers: Array<PIXI.Container>
    backgrounds: Array<Background>

    onCreate(): void;
    onStep(): void;
    onDraw(): void;
    onLeave(): void;

    template: IRoomTemplate;

    /** The name of the room, as defined in ct.IDE */
    name: string;

    /** The unique identifier of a room. Can be used to differentiate rooms without capturing them in a closure. */
    uid: number;

    [key: string]: any
}
/**
 * @param template - A template object that contains data about depth
 * and tile placement. It is usually used by ct.IDE.
 */
 declare class Tilemap extends PIXI.Container {
    constructor(template: any);
    /**
     * Adds a tile to the tilemap. Will throw an error if a tilemap is cached.
     * @param textureName - The name of the texture to use
     * @param x - The horizontal location of the tile
     * @param y - The vertical location of the tile
     * @param [frame = 0] - The frame to pick from the source texture. Defaults to 0.
     * @returns The created tile
     */
    addTile(textureName: string, x: number, y: number, frame?: number): PIXI.Sprite;
    /**
     * Enables caching on this tileset, freezing it and turning it
     * into a series of bitmap textures. This proides great speed boost,
     * but prevents further editing.
     */
    cache(): void;
    /**
     * Enables caching on this tileset, freezing it and turning it
     * into a series of bitmap textures. This proides great speed boost,
     * but prevents further editing.
     *
     * This version packs tiles into rhombus-shaped chunks, and sorts them
     * from top to bottom. This fixes seam issues for isometric games.
     */
    cacheDiamond(): void;
}

interface ITextureOptions {
    // TODO:
    [key: string]: any;
}

interface ITypeTemplate {
    // TODO:
    [key: string]: any;
}

interface IEmitterTemplate {
    // TODO:
    [key: string]: any;
}

interface IActionInputMethod {
    code: string,
    multiplier?: number
}

interface ISimplePoint {
    x: number;
    y: number;
}

/**
 * The ct.js library
 */
declare namespace ct {
    namespace backgrounds {
        /**
         * @returns The created background
         */
        function add(): Background;
    }
    /**
     * A collection of content that was made inside ct.IDE.
     */
    var content: Record<string, Record<string, unknown>[]>;
    namespace emitters {
        /**
         * A map of existing emitter templates.
         */
        var templates: IEmitterTemplate[];
        /**
         * A list of all the emitters that are simulated in UI time scale.
         */
        var uiTandems: EmitterTandem[];
        /**
         * A list of all the emitters that are simulated in a regular game loop.
         */
        var tandems: EmitterTandem[];
        /**
         * Creates a new emitter tandem in the world at the given position.
         * @param name - The name of the tandem template, as it was named in ct.IDE.
         * @param x - The x coordinate of the new tandem.
         * @param y - The y coordinate of the new tandem.
         * @param [settings] - Additional configs for the created tandem.
         * @returns The newly created tandem.
         */
        function fire(
            name: string,
            x: number,
            y: number,
            settings?: ITandemSettings
        ): EmitterTandem;
        /**
         * Creates a new emitter tandem and attaches it to the given copy
         * (or to any other DisplayObject).
         * @param parent - The parent of the created tandem.
         * @param name - The name of the tandem template.
         * @param [settings] - Additional options for the created tandem.
         * @returns The newly created emitter tandem.
         */
        function append(
            parent: Copy | PIXI.DisplayObject,
            name: string,
            settings?: ITandemSettings
        ): EmitterTandem;
        /**
         * Creates a new emitter tandem in the world, and configs it so it will follow a given copy.
         * This includes handling position, scale, and rotation.
         * @param parent - The copy to follow.
         * @param name - The name of the tandem template.
         * @param [settings] - Additional options for the created tandem.
         * @returns The newly created emitter tandem.
         */
        function follow(
            parent: Copy | PIXI.DisplayObject,
            name: string,
            settings?: ITandemSettings
        ): EmitterTandem;
    }
    /**
     * A list of custom Actions. They are defined in the Settings tab → Edit actions section.
     */
    var actions: {
        [key: string]: CtAction;
    };
    namespace inputs {
        /**
         * Adds a new action and puts it into `ct.actions`.
         * @param name - The name of an action, as it will be used in `ct.actions`.
         * @param methods - A list of input methods. This list can be changed later.
         * @returns The created action
         */
        function addAction(name: string, methods: IActionInputMethod[]): CtAction;
        /**
         * Removes an action with a given name.
         * @param name - The name of an action
         */
        function removeAction(name: string): void;
        /**
         * Recalculates values for every action in a game.
         */
        function updateActions(): void;
    }
    /**
     * A target number of frames per second. It can be interpreted as a second in timers.
     */
    var speed: number;
    /**
     * A measure of how long a frame took time to draw, usually equal to 1 and larger on lags.
     * For example, if it is equal to 2, it means that the previous frame took twice as much time
     * compared to expected FPS rate.
     *
     * Use ct.delta to balance your movement and other calculations on different framerates by
     * multiplying it with your reference value.
     *
     * Note that `this.move()` already uses it, so there is no need to premultiply
     * `this.speed` with it.
     *
     * **A minimal example:**
     * ```js
     * this.x += this.windSpeed * ct.delta;
     * ```
     */
    var delta: number;
    /**
     * A measure of how long a frame took time to draw, usually equal to 1 and larger on lags.
     * For example, if it is equal to 2, it means that the previous frame took twice as much time
     * compared to expected FPS rate.
     *
     * This is a version for UI elements, as it is not affected by time scaling, and thus works well
     * both with slow-mo effects and game pause.
     */
    var deltaUi: number;
    /**
     * The camera that outputs its view to the renderer.
     */
    var camera: Camera;
    /**
     * ct.js version in form of a string `X.X.X`.
     */
    var version: string;
    /**
     * Resizes the drawing canvas and viewport to the given value in pixels.
     * When used with ct.fittoscreen, can be used to enlarge/shrink the viewport.
     */
    var width: number;
    /**
     * Resizes the drawing canvas and viewport to the given value in pixels.
     * When used with ct.fittoscreen, can be used to enlarge/shrink the viewport.
     */
    var height: number;
    /**
     * The PIXI.Application that runs ct.js game
     */
    var pixiApp: PIXI.Application;
    var stage: PIXI.Container;
    /**
     * A library of different utility functions, mainly Math-related, but not limited to them.
     */
    namespace u {
        /**
         * Get the environment the game runs on.
         * @returns Either 'ct.ide', or 'nw', or 'electron', or 'browser'.
         */
        function getEnvironment(): string;
        /**
         * Get the current operating system the game runs on.
         * @returns One of 'windows', 'darwin' (which is MacOS), 'linux', or 'unknown'.
         */
        function getOS(): string;
        /**
         * Returns the length of a vector projection onto an X axis.
         * @param l - The length of the vector
         * @param d - The direction of the vector
         * @returns The length of the projection
         */
        function ldx(l: number, d: number): number;
        /**
         * Returns the length of a vector projection onto an Y axis.
         * @param l - The length of the vector
         * @param d - The direction of the vector
         * @returns The length of the projection
         */
        function ldy(l: number, d: number): number;
        /**
         * Returns the direction of a vector that points from the first point to the second one.
         * @param x1 - The x location of the first point
         * @param y1 - The y location of the first point
         * @param x2 - The x location of the second point
         * @param y2 - The y location of the second point
         * @returns The angle of the resulting vector, in degrees
         */
        function pdn(x1: number, y1: number, x2: number, y2: number): number;
        /**
         * Returns the distance between two points
         * @param x1 - The x location of the first point
         * @param y1 - The y location of the first point
         * @param x2 - The x location of the second point
         * @param y2 - The y location of the second point
         * @returns The distance between the two points
         */
        function pdc(x1: number, y1: number, x2: number, y2: number): number;
        /**
         * Convers degrees to radians
         * @param deg - The degrees to convert
         * @returns The resulting radian value
         */
        function degToRad(deg: number): number;
        /**
         * Convers radians to degrees
         * @param rad - The radian value to convert
         * @returns The resulting degree
         */
        function radToDeg(rad: number): number;
        /**
         * Rotates a vector (x; y) by `deg` around (0; 0)
         * @param x - The x component
         * @param y - The y component
         * @param deg - The degree to rotate by
         * @returns A pair of new `x` and `y` parameters.
         */
        function rotate(x: number, y: number, deg: number): PIXI.Point;
        /**
         * Rotates a vector (x; y) by `rad` around (0; 0)
         * @param x - The x component
         * @param y - The y component
         * @param rad - The radian value to rotate around
         * @returns A pair of new `x` and `y` parameters.
         */
        function rotateRad(x: number, y: number, rad: number): PIXI.Point;
        /**
         * Gets the most narrow angle between two vectors of given directions
         * @param dir1 - The direction of the first vector
         * @param dir2 - The direction of the second vector
         * @returns The resulting angle
         */
        function deltaDir(dir1: number, dir2: number): number;
        /**
         * Returns a number in between the given range (clamps it).
         * @param min - The minimum value of the given number
         * @param val - The value to fit in the range
         * @param max - The maximum value of the given number
         * @returns The clamped value
         */
        function clamp(min: number, val: number, max: number): number;
        /**
         * Linearly interpolates between two values by the apha value.
         * Can also be describing as mixing between two values with a given proportion `alpha`.
         * @param a - The first value to interpolate from
         * @param b - The second value to interpolate to
         * @param alpha - The mixing value
         * @returns The result of the interpolation
         */
        function lerp(a: number, b: number, alpha: number): number;
        /**
         * Returns the position of a given value in a given range. Opposite to linear interpolation.
         * @param a - The first value to interpolate from
         * @param b - The second value to interpolate top
         * @param val - The interpolated values
         * @returns The position of the value in the specified range.
         * When a <= val <= b, the result will be inside the [0;1] range.
         */
        function unlerp(a: number, b: number, val: number): number;
        /**
         * Re-maps the given value from one number range to another.
         * @param val - The value to be mapped
         * @param inMin - Lower bound of the value's current range
         * @param inMax - Upper bound of the value's current range
         * @param outMin - Lower bound of the value's target range
         * @param outMax - Upper bound of the value's target range
         * @returns The mapped value.
         */
        function map(
            val: number,
            inMin: number,
            inMax: number,
            outMin: number,
            outMax: number
        ): number;
        /**
         * Translates a point from UI space to game space.
         * @param x - The x coordinate in UI space.
         * @param y - The y coordinate in UI space.
         * @returns A pair of new `x` and `y` coordinates.
         */
        function uiToGameCoord(x: number, y: number): PIXI.Point;
        /**
         * Translates a point from fame space to UI space.
         * @param x - The x coordinate in game space.
         * @param y - The y coordinate in game space.
         * @returns A pair of new `x` and `y` coordinates.
         */
        function gameToUiCoord(x: number, y: number): PIXI.Point;
        /**
         * Tests whether a given point is inside the given rectangle
         * (it can be either a copy or an array).
         * @param x - The x coordinate of the point.
         * @param y - The y coordinate of the point.
         * @param arg - Either a copy (it must have a rectangular shape)
         * or an array in a form of [x1, y1, x2, y2], where (x1;y1) and (x2;y2) specify
         * the two opposite corners of the rectangle.
         * @returns `true` if the point is inside the rectangle, `false` otherwise.
         */
        function prect(x: number, y: number, arg: Copy | number[]): boolean;
        /**
         * Tests whether a given point is inside the given circle
         * (it can be either a copy or an array)
         * @param x - The x coordinate of the point
         * @param y - The y coordinate of the point
         * @param arg - Either a copy (it must have a circular shape)
         * or an array in a form of [x1, y1, r], where (x1;y1) define the center of the circle
         * and `r` defines the radius of it.
         * @returns `true` if the point is inside the circle, `false` otherwise
         */
        function pcircle(x: number, y: number, arg: Copy | number[]): boolean;
        /**
         * Copies all the properties of the source object to the destination object.
         * This is **not** a deep copy. Useful for extending some settings with default values,
         * or for combining data.
         * @param o1 - The destination object
         * @param o2 - The source object
         * @param [arr] - An optional array of properties to copy. If not specified,
         * all the properties will be copied.
         * @returns The modified destination object
         */
        function ext(
            o1: Record<string, unknown>,
            o2: Record<string, unknown>,
            arr?: string[]
        ): Record<string, unknown>;
        /**
         * Returns a Promise that resolves after the given time.
         * This timer is run in gameplay time scale, meaning that it is affected by time stretching.
         * @param time - Time to wait, in milliseconds
         * @returns The timer, which you can call `.then()` to
         */
        function wait(time: number): CtTimer;
        /**
         * Returns a Promise that resolves after the given time.
         * This timer runs in UI time scale and is not sensitive to time stretching.
         * @param time - Time to wait, in milliseconds
         * @returns The timer, which you can call `.then()` to
         */
        function waitUi(time: number): CtTimer;
        /**
         * Creates a new function that returns a promise, based
         * on a function with a regular (err, result) => {...} callback.
         * @param f - The function that needs to be promisified
         */
        function promisify(
            f: (...params: unknown[]) => unknown
        ): (...params: unknown[]) => Promise<unknown>;
        /**
         * Returns the length of a vector projection onto an X axis.
         * @param {number} l The length of the vector
         * @param {number} d The direction of the vector
         * @returns {number} The length of the projection
         */
        function lengthDirX(l: number, d: number): number;
        /**
         * Returns the length of a vector projection onto an Y axis.
         * @param {number} l The length of the vector
         * @param {number} d The direction of the vector
         * @returns {number} The length of the projection
         */
        function lengthDirY(l: number, d: number): number;
        /**
         * Returns the direction of a vector that points from the first point to the second one.
         * @param {number} x1 The x location of the first point
         * @param {number} y1 The y location of the first point
         * @param {number} x2 The x location of the second point
         * @param {number} y2 The y location of the second point
         * @returns {number} The angle of the resulting vector, in degrees
         */
        function pointDirection(x1: number, y1: number, x2: number, y2: number): number;
        /**
         * Returns the distance between two points
         * @param {number} x1 The x location of the first point
         * @param {number} y1 The y location of the first point
         * @param {number} x2 The x location of the second point
         * @param {number} y2 The y location of the second point
         * @returns {number} The distance between the two points
         */
        function pointDistance(x1: number, y1: number, x2: number, y2: number): number;
        /**
         * Tests whether a given point is inside the given rectangle
         * (it can be either a copy or an array)
         * @param {number} x The x coordinate of the point
         * @param {number} y The y coordinate of the point
         * @param {(Copy|Array<Number>)} arg Either a copy (it must have
         * a rectangular shape) or an array in a form of [x1, y1, x2, y2],
         * where (x1;y1) and (x2;y2) specify the two opposite corners
         * of the rectangle
         * @returns {boolean} `true` if the point is inside the rectangle, `false` otherwise
         */
        function pointRectangle(x: number, y: number, arg: Copy | number[]): boolean;
        /**
         * Tests whether a given point is inside the given circle
         * (it can be either a copy or an array)
         * @param {number} x The x coordinate of the point
         * @param {number} y The y coordinate of the point
         * @param {(Copy|Array<Number>)} arg Either a copy (it must have
         * a circular shape) or an array in a form of [x1, y1, r],
         * where (x1;y1) define the center of the circle and `r` defines
         * the radius of it
         * @returns {boolean} `true` if the point is inside the circle, `false` otherwise
         */
        function pointCircle(x: number, y: number, arg: Copy | number[]): boolean;
        /**
         * Copies all the properties of the source object to the destination
         * object. This is **not** a deep copy. Useful for extending some
         * settings with default values, or for combining data.
         * @param {object} o1 The destination object
         * @param {object} o2 The source object
         * @param {any} [arr] An optional array of properties to copy.
         * If not specified, all the properties will be copied.
         * @returns {object} The modified destination object
         */
        function extend(
            o1: Record<string, unknown>,
            o2: Record<string, unknown>,
            arr?: string[]
        ): Record<string, unknown>;
        /**
         * Get the current operating system the game runs on.
         * @returns {string} One of 'windows', 'darwin' (which is MacOS), 'linux', or 'unknown'.
         */
        function getOs(): string;
    }
    /**
     * A utility object that manages and stores textures and other entities
     */
    namespace res {
        /**
         * Loads and executes a script by its URL
         * @param url - The URL of the script file, with its extension.
         * Can be relative or absolute.
         */
        function loadScript(url: string): Promise<void>;
        /**
         * Loads an individual image as a named ct.js texture.
         * @param url - The path to the source image.
         * @param name - The name of the resulting ct.js texture
         * as it will be used in your code.
         * @param textureOptions - Information about texture's axis
         * and collision shape.
         */
        function loadTexture(
            url: string,
            name: string,
            textureOptions: ITextureOptions
        ): Promise<PIXI.Texture[]>;
        /**
         * Loads a skeleton made in DragonBones into the game
         * @param ske - Path to the _ske.json file that contains
         * the armature and animations.
         * @param tex - Path to the _tex.json file that describes the atlas
         * with a skeleton's textures.
         * @param png - Path to the _tex.png atlas that contains
         * all the textures of the skeleton.
         * @param name - The name of the skeleton as it will be used in ct.js game
         */
        function loadDragonBonesSkeleton(ske: string, tex: string, png: string, name: string): void;
        /**
         * Loads a Texture Packer compatible .json file with its source image,
         * adding ct.js textures to the game.
         * @param url - The path to the JSON file that describes the atlas' textures.
         * @returns A promise that resolves into an array
         * of all the loaded textures.
         */
        function loadAtlas(url: string): Promise<string[]>;
        /**
         * Loads a bitmap font by its XML file.
         * @param url - The path to the XML file that describes the bitmap fonts.
         * @param name - The name of the font.
         * @returns A promise that resolves into the font's name
         * (the one you've passed with `name`).
         */
        function loadBitmapFont(url: string, name: string): Promise<string>;

        /**
         * Gets a pixi.js texture from a ct.js' texture name,
         * so that it can be used in pixi.js objects.
         * @param {string} name The name of the ct.js texture
         * @returns {Array<PIXI.Texture>} Returns an array with all the frames
         * of this ct.js' texture.
         */
         function getTexture(name: string): PIXI.Texture[];
         /**
          * Gets a pixi.js texture from a ct.js' texture name, so that it can be used
          * in pixi.js objects.
          * @param {string} name The name of the ct.js texture
          * @param {number} frame The frame to extract
          * @returns {PIXI.Texture} Returns a single PIXI.Texture.
          */
         function getTexture(name: string, frame: number): PIXI.Texture;

        /**
         * Creates a DragonBones skeleton, ready to be added to your copies.
         * @param name - The name of the skeleton asset
         * @param [skin] - Optional; allows you to specify the used skin
         * @returns The created skeleton
         */
        function makeSkeleton(name: string, skin?: string): unknown;
    }
    namespace rooms {
        /**
         * An object that contains arrays of currently present rooms.
         * These include the current room (`ct.room`), as well as any rooms
         * appended or prepended through `ct.rooms.append` and `ct.rooms.prepend`.
         */
        var list: {
            [key: string]: Room[];
        };
        /**
         * Creates and adds a background to the current room, at the given depth.
         * @param texture - The name of the texture to use
         * @param depth - The depth of the new background
         * @returns The created background
         */
        function addBg(texture: string, depth: number): Background;
        /**
         * Adds a new empty tile layer to the room, at the given depth
         * @param layer - The depth of the layer
         * @returns The created tile layer
         */
        function addTileLayer(layer: number): Tilemap;
        /**
         * Clears the current stage, removing all rooms with copies, tile layers, backgrounds,
         * and other potential entities.
         */
        function clear(): void;
        /**
         * This method safely removes a previously appended/prepended room from the stage.
         * It will trigger "On Leave" for a room and "On Destroy" event
         * for all the copies of the removed room.
         * The room will also have `this.kill` set to `true` in its event, if it comes in handy.
         * This method cannot remove `ct.room`, the main room.
         * @param room - The `room` argument must be a reference
         * to the previously created room.
         */
        function remove(room: Room): void;
        /**
         * Creates a new room and adds it to the stage, separating its draw stack
         * from existing ones.
         * This room is added to `ct.stage` after all the other rooms.
         * @param roomName - The name of the room to be appended
         * @param [exts] - Any additional parameters applied to the new room.
         * Useful for passing settings and data to new widgets and prefabs.
         * @returns A newly created room
         */
        function append(roomName: string, exts?: Record<string, unknown>): Room;
        /**
         * Creates a new room and adds it to the stage, separating its draw stack
         * from existing ones.
         * This room is added to `ct.stage` before all the other rooms.
         * @param roomName - The name of the room to be prepended
         * @param [exts] - Any additional parameters applied to the new room.
         * Useful for passing settings and data to new widgets and prefabs.
         * @returns A newly created room
         */
        function prepend(roomName: string, exts?: Record<string, unknown>): Room;
        /**
         * Merges a given room into the current one. Skips room's OnCreate event.
         * @param roomName - The name of the room that needs to be merged
         * @returns Arrays of created copies, backgrounds, tile layers,
         * added to the current room (`ct.room`). Note: it does not get updated,
         * so beware of memory leaks if you keep a reference to this array for a long time!
         */
        function merge(roomName: string): IRoomMergeResult;
        /**
         * The name of the starting room, as it was set in ct.IDE.
         */
        var starting: string;
    }
    /**
     * The current room
     */
    var room: Room;
    namespace styles {
        /**
         * Returns a style of a given name. The actual behavior strongly
         * depends on `copy` parameter.
         * @param name - The name of the style to load
         * @param [copy] - If not set, returns the source style object.
         * Editing it will affect all new style calls.
         * When set to `true`, will create a new object, which you can safely modify
         * without affecting the source style.
         * When set to an object, this will create a new object as well,
         * augmenting it with given properties.
         * @returns The resulting style
         */
        function get(
            name: string,
            copy?: boolean | Record<string, unknown>
        ): Record<string, unknown>;
    }
    namespace tilemaps {
        /**
         * Creates a new tilemap at a specified depth, and adds it to the main room (ct.room).
         * @param [depth] - The depth of a newly created tilemap. Defaults to 0.
         * @returns The created tilemap.
         */
        function create(depth?: number): Tilemap;
        /**
         * Adds a tile to the specified tilemap. It is the same as
         * calling `tilemap.addTile(textureName, x, y, frame).
         * @param tilemap - The tilemap to modify.
         * @param textureName - The name of the texture to use.
         * @param x - The horizontal location of the tile.
         * @param y - The vertical location of the tile.
         * @param [frame] - The frame to pick from the source texture. Defaults to 0.
         * @returns The created tile
         */
        function addTile(
            tilemap: Tilemap,
            textureName: string,
            x: number,
            y: number,
            frame?: number
        ): PIXI.Sprite;
        /**
         * Enables caching on this tileset, freezing it and turning it
         * into a series of bitmap textures. This proides great speed boost,
         * but prevents further editing.
         *
         * This is the same as calling `tilemap.cache();`
         * @param tilemap - The tilemap which needs to be cached.
         * @param chunkSize - The size of one chunk.
         */
        function cache(tilemap: Tilemap, chunkSize: number): void;
        /**
         * Enables caching on this tileset, freezing it and turning it
         * into a series of bitmap textures. This proides great speed boost,
         * but prevents further editing.
         *
         * This version packs tiles into rhombus-shaped chunks, and sorts them
         * from top to bottom. This fixes seam issues for isometric games.
         * Note that tiles should be placed on a flat plane for the proper sorting.
         * If you need an effect of elevation, consider shifting each tile with
         * tile.pivot.y property.
         *
         * This is the same as calling `tilemap.cacheDiamond();`
         * @param tilemap - The tilemap which needs to be cached.
         * @param chunkSize - The size of one chunk.
         */
        function cacheDiamond(tilemap: Tilemap, chunkSize: number): void;
    }
    /**
     * Timer utilities
     */
    namespace timer {
        /**
         * A set with all the active timers.
         */
        var timers: Set<CtTimer>;
        /**
         * Adds a new timer with a given name
         * @param timeMs - The length of the timer, **in milliseconds**
         * @param [name = false] - The name of the timer, which you use
         * to access it from `ct.timer.timers`.
         * @returns The timer
         */
        function add(timeMs: number, name?: string | false): CtTimer;
        /**
         * Adds a new timer with a given name that runs in a UI time scale
         * @param timeMs - The length of the timer, **in milliseconds**
         * @param [name = false] - The name of the timer, which you use
         * to access it from `ct.timer.timers`.
         * @returns The timer
         */
        function addUi(timeMs: number, name?: string | false): CtTimer;
    }
    /**
     * An object with properties and methods for manipulating types and copies,
     * mainly for finding particular copies and creating new ones.
     */
    namespace types {
        /**
         * An object that contains arrays of copies of all types.
         */
        var list: {
            [key: string]: Copy[];
        };
        /**
         * A map of all the templates of types exported from ct.IDE.
         */
        var templates: Record<string, ITypeTemplate>;
        /**
         * Creates a new copy of a given type inside a specific room.
         * @param type - The name of the type to use
         * @param [x] - The x coordinate of a new copy. Defaults to 0.
         * @param [y] - The y coordinate of a new copy. Defaults to 0.
         * @param [room] - The room to which add the copy.
         * Defaults to the current room.
         * @param [exts] - An optional object which parameters will be applied
         * to the copy prior to its OnCreate event.
         * @returns the created copy.
         */
        function copyIntoRoom(
            type: string,
            x?: number,
            y?: number,
            room?: Room,
            exts?: Record<string, unknown>
        ): Copy;
        /**
         * Creates a new copy of a given type inside the current root room.
         * A shorthand for `ct.types.copyIntoRoom(type, x, y, ct.room, exts)`
         * @param type - The name of the type to use
         * @param [x] - The x coordinate of a new copy. Defaults to 0.
         * @param [y] - The y coordinate of a new copy. Defaults to 0.
         * @param [exts] - An optional object which parameters will be applied
         * to the copy prior to its OnCreate event.
         */
        function copy(type: string, x?: number, y?: number, exts?: any): void;
        /**
         * Applies a function to each copy in the current room
         * @param func - The function to apply
         */
        function each(func: (...params: any[]) => any): void;
        /**
         * Checks whether there are any copies of this type's name.
         * Will throw an error if you pass an invalid type name.
         * @param type - The name of a type to check.
         * @returns Returns `true` if at least one copy exists in a room;
         * `false` otherwise.
         */
        function exists(type: string): boolean;
        /**
         * Checks whether a given object exists in game's world.
         * Intended to be applied to copies, but may be used with other PIXI entities.
         * @param obj - The copy which existence needs to be checked.
         * @returns Returns `true` if a copy exists; `false` otherwise.
         */
        function valid(obj: Copy | PIXI.DisplayObject | unknown): boolean;
        /**
         * Checks whether a given object is a ct.js copy.
         * @param obj - The object which needs to be checked.
         * @returns Returns `true` if the passed object is a copy; `false` otherwise.
         */
        function isCopy(obj: unknown): boolean;
    }
}
