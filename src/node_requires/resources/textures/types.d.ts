type collisionShapeType = 'strip' | 'circle' | 'rect';

interface ITexture extends IAsset {
    grid: [number, number],
    untill: 0,
    frames: number,

    axis: [number, number],
    width: number,
    height: number,

    imgWidth: number,
    imgHeight: number,

    marginx: number,
    marginy: number,
    offy: number,
    offx: number,

    shape: collisionShapeType,

    top: number,
    right: number,
    bottom: number,
    left: number,

    r: number,

    stripPoints?: Array<[number, number]>,
    closedStrip: boolean,
    symmetryStrip: boolean,

    padding: number,

    source?: string
}
