const defaultTexture: Omit<ITexture, 'grid' | 'axis' | 'uid'> = {
    type: 'texture',
    untill: 0,
    marginx: 0,
    marginy: 0,
    imgWidth: 0,
    imgHeight: 0,
    width: 0,
    height: 0,
    offx: 0,
    offy: 0,
    shape: 'rect',
    left: 0,
    right: 0,
    top: 0,
    r: 0,
    closedStrip: true,
    symmetryStrip: false,
    frames: 1,
    bottom: 0,
    padding: 1,
    tiled: false
};

const get = function (): Omit<ITexture, 'uid'> {
    return {
        ...defaultTexture,
        grid: [1, 1],
        axis: [0, 0]
    };
};

export {get};
