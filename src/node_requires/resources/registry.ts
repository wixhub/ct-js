import DoubleMap from './../DoubleMap';
import {getProjectPath} from './projects';
import {ensureId} from './utils';
import {assetTypes} from './index';

const path = require('path');

/** Maps asset UIDs to their metadata file's location relative to the. */
let fsRegistry: DoubleMap<string, string>;
/** Maps each asset UID to a list of UIDs of dependent asset, meaning that they reference it. */
let dependents: Map<string, Array<string>>;
/**
 * Maps recently changed assets' UIDs to the date of their modification.
 * Used to avoid caching problems on thumbnails and source images.
 * It is not a full registry contrary to the `registry` and will return
 * nothing on not yet changed assets.
 * Changed automatically on each patch operation.
 */
let changed: Map<string, Date>;

const purgeRegistries = function () {
    changed = new Map();
    dependents = new Map();
    fsRegistry = new DoubleMap();
};
purgeRegistries();

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
    const newRegistry = new DoubleMap<string, string>();
    const assets = path.join(getProjectPath(), 'assets');
    const readAndPushPromises = [];
    for await (const file of klaw(assets, walkOptions)) {
        const ext = path.extname(file).slice(2);
        if (!(ext in assetTypes)) {
            continue;
        }
        if (assetTypes[ext].format === 'yaml') {
            readAndPushPromises.push(fs.readYaml(file)
                // False positive; it complains about an "unsafe usage" of an interface.
                // eslint-disable-next-line no-loop-func
                .then((asset: IAsset) => {
                    newRegistry.putKeyValue(asset.uid, path.relative(assets, file));
                }));
        } else {
            readAndPushPromises.push(fs.readJson(file)
                // eslint-disable-next-line no-loop-func
                .then((asset: IAsset) => {
                    newRegistry.putKeyValue(asset.uid, path.relative(assets, file));
                }));
        }
    }
    await Promise.all(readAndPushPromises);
    fsRegistry = newRegistry;
    dependents = new Map();
};
const moveAsset = function (uid: string, newPath: string): void {
    fsRegistry.updateValueByKey(uid, newPath);
};
const addAsset = function (uid: string, newPath: string): void {
    fsRegistry.putKeyValue(uid, newPath);
    dependents.set(uid, []);
};
/**
 * @param {string} uidOrPath Can be either a UID of an asset or its path.
 */
const removeAsset = function (uidOrPath: string): void {
    const uid = ensureId(uidOrPath);
    if (fsRegistry.hasKey(uidOrPath)) {
        fsRegistry.deleteByKey(uidOrPath);
    } else {
        fsRegistry.deleteByValue(uidOrPath);
    }
    dependents.delete(uid);
};

/**
 * @returns The path of an asset relative to `project/assets` directory.
 */
const getAssetPath = function (asset: string | IAsset): string {
    if (typeof asset === 'string') {
        return fsRegistry.getValue(asset);
    }
    return fsRegistry.getValue(asset.uid);
};
const getAssetId = function (path: string): string {
    return fsRegistry.getKey(path);
};

const pushDependent = function (asset: string | IAsset, dependent: string | IAsset): void {
    const uid = ensureId(asset);
    dependents.get(uid).push(ensureId(dependent));
};
const removeDependent = function (asset: string | IAsset, dependent: string | IAsset): void {
    const uid = ensureId(asset);
    const dependentId = ensureId(dependent);
    dependents.get(uid).splice(dependents.get(uid).indexOf(dependentId), 1);
};
const getDependents = function (asset: string | IAsset): Readonly<Array<string>> {
    const uid = ensureId(asset);
    return [...dependents.get(uid)]; // Clone the array to avoid unintentional mutations.
};

/**
 * Updates date modified for a given asset ID.
 */
const pokeAsset = (uid: string): void => {
    changed.set(uid, new Date());
};
const getMdate = (uid: string): Date => changed.get(uid);

export {
    forceRescan,
    moveAsset,
    addAsset,
    getAssetPath,
    getAssetId,
    pushDependent,
    removeDependent,
    getDependents,
    getMdate,
    pokeAsset,
    removeAsset
};
