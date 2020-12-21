import DoubleMap from './../DoubleMap';
let registry: DoubleMap<string, string>;

const forceRescan = async function (): Promise<void> {
    // TODO:
    registry = new DoubleMap();
};
const moveAsset = function (uid: string, newPath: string) {
    // TODO:
};
const addAsset = function (uid: string, newPath: string) {
    // TODO:
    if (!(uid in registry)) {

    }
};
