type canvasPatternRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

interface IRoomBackground {
    depth: number,
    texture: assetRef,
    extends: {
        parallaxX?: number,
        parallaxY?: number,
        shiftX?: number,
        shiftY?: number,
        repeat: canvasPatternRepeat
        [key: string]: unknown
    }
}

interface IRoomCopy {
    x: number,
    y: number,
    uid: assetRef,
    tx?: number,
    ty?: number,
    exts: {
        [key: string]: unknown
    }
}

interface ITileTemplate {
    x: number;
    y: number;
}

interface ITileLayerTemplate {
    depth: number;
    tiles: Array<ITileTemplate>
}

interface IRoom extends IScriptable {
    // Currently just stick to the old structure
    width: number,
    height: number,
    backgrounds: Array<IRoomBackground>,
    copies: Array<IRoomCopy>,
    tiles: Array<ITileLayerTemplate>
    gridX: number,
    gridY: number
    extends: {
        [key: string]: unknown
    }
}
