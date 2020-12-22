import DoubleMap from './../DoubleMap';
import {getProjectPath} from './projects';
import extensionToFormat from './extensionToFormatMap';

const path = require('path');

let registry: DoubleMap<string, string>;

const walkOptions = {
    depthLimit: -1,
    filter: (abs: string) => {
        if (path.basename(abs) === '.' || path.basename(abs)) {
            return false;
        }
        if (path.extname.startsWith('ct')) {
            return true;
        }
        return false;
    }
};

/**
 * Walks over a directory, reading each ct-like file,
 * reforms a registry, then discards the old one.
 */
const forceRescan = async function (): Promise<void> {
    const klaw = require('klaw'),
          fs = require('fs');
    const newRegistry = new DoubleMap();
    const assets = path.join(getProjectPath(), 'assets');
    const readAndPushPromises = [];
    for await (const file of klaw(assets, walkOptions)) {
        const ext = path.extname(file).slice(2);
        if (!(ext in extensionToFormat)) {
            continue;
        }
        if (extensionToFormat[ext] === 'yaml') {
            readAndPushPromises.push(fs.readYaml(file)
                .then((asset: IAsset) => {
                    newRegistry.putKeyValue(asset.uid, path.relative(assets, file));
                }));
        } else {
            readAndPushPromises.push(fs.readJson(file)
                .then((asset: IAsset) => {
                    newRegistry.putKeyValue(asset.uid, path.relative(assets, file));
                }));
        }
    }
    await Promise.all(readAndPushPromises);
    registry = newRegistry;
};
const moveAsset = function (uid: string, newPath: string): void {
    registry.updateValueByKey(uid, newPath);
};
const addAsset = function (uid: string, newPath: string): void {
    registry.putKeyValue(uid, newPath);
};
/**
 * @param {string} uidOrPath Can be either a UID of an asset or its path.
 */
const removeAsset = function (uidOrPath: string): void {
    if (registry.hasKey(uidOrPath)) {
        registry.deleteByKey(uidOrPath);
    } else {
        registry.deleteByValue(uidOrPath);
    }
};

export {
    forceRescan,
    moveAsset,
    addAsset,
    removeAsset
};
