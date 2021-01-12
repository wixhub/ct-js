const fs = require('fs-extra');

import {getAssetPath, pokeAsset, pushDependent, removeDependent, getDependents, addAsset, removeAsset, moveAsset as moveAssetInRegistry} from './registry';
import {ensureAsset, throwIfOutsideAssets, ensureAbsoluteAssetPath, ensureId, getTypeFromPath, ensureRelativeAssetPath} from './utils';


const getAssetDataFolder = (uidOrPath: string | IAsset): string => {
    const uid = ensureId(uidOrPath);
    return getAssetPath(uid) + '.data';
};

interface IAssetType {
    /** How the metadata file should be loaded and saved: as a JSON file or a YAML file. */
    format: 'json' | 'yaml',
    /** Whether each asset of this type has a supplemental data folder */
    hasDataFolder: boolean,
    /**
     * Riot tag's name that can edit this asset type.
     * If it is not set, ct.js will warn that it cannot edit
     * this asset type on any attempts to do so.
     */
    editor?: string,
    /** The name of an SVG icon from ct.IDE to be used in asset viewers and other situations */
    icon: string,
    /** The path to a translatable key in i18n files that is used to name this asset type. */
    nounAccessor: string,
    /**
     * A function that returns the thumbnail of an asset.
     * Actual value depends on `thumbnailType` value, as well as the asset.
     */
    thumbnail: (asset: IAsset, x2?: boolean) => string,
    /** Informs asset viewers and other entities what type of a thumbnail should be used.
     * `icon` uses an SVG icon from ct.IDE.
     * `image` points to an image file in the filesystem.
     */
    thumbnailType: 'image' | 'icon',

    /**
     * An array of any methods that should be run on each save operation,
     * such as regeneration of thumbnails.
     * Runs on external patch operations, as well as regular UI interactions.
     * This will be run after the creation and patch operations of the metadata file.
     * Tasks are run in parallel and are awaited to fully finish.
     */
    saveHooks?: Array<(asset: Readonly<IAsset>, path: string) => Promise<void>>,

    /**
     * An array of additional handlers for move operations.
     * All paths are relative to `project/assets` directory.
     *
     * **!!! Note: Data folders are moved automatically.**
     */
    moveHooks?: Array<(asset: Readonly<IAsset>, newPath: string, oldPath: string) => Promise<void>>

    /**
     * An array of handlers that is called when a dependency is removed from a project.
     * Dependents list is cleaned up automatically.
     * Note that all these hooks are run in parallel, so if you want to patch the dependent
     * object, it is needed to make these edits in one go, to avoid race conditions
     * and loss of data.
     */
    dependencyRemovedHooks?: Array<(asset: Readonly<IAsset>, dependency: IAsset) => Promise<void>>
}

const assetTypes: Record<string, IAssetType> = {};

/**
 * Adds a description of an asset type to ct.js. The collection of asset types
 * is then consumed by asset viewers, tabs system, and other tags to form
 * an integrated experience.
 * It does not affect the exporter, as it aims to be as standalone as possible.
 */
const registerAssetType = function (name: string, type: IAssetType): void {
    if (name in assetTypes) {
        throw new Error(`[resources] Asset type ${type} already exists.`);
    }
    assetTypes[name] = type;
};

const throwIfInvalidAssetType = function (typeOrAsset: string | IAsset): void {
    const type = typeof typeOrAsset === 'string' ? typeOrAsset : typeOrAsset.type;
    if (!(type in assetTypes)) {
        throw new Error(`[resources] Invalid asset type passed: ${type}. Currently available: ${Object.keys(assetTypes)}`);
    }
};

/**
 * @param dest Must be a path relative to the `project/assets` folder.
 */
const applySaveHooks = async function (asset: IAsset, dest: string): Promise<void> {
    const typeSpec = assetTypes[asset.type];
    if (typeSpec.saveHooks && typeSpec.saveHooks.length) {
        await Promise.all(typeSpec.saveHooks.map(predicate => predicate(asset, dest)));
    }
};

/**
 * @param dest The path to the asset. Can be either absolute
 * or relative to `project/assets` folder.
 * @param fileType Either 'json' or 'yaml'.
 * @param asset The object to dump.
 */
const dumpAsset = async (dest: string, fileType: 'json' | 'yaml', asset: IAsset): Promise<void> => {
    throwIfInvalidAssetType(asset);
    dest = ensureAbsoluteAssetPath(dest);
    if (fileType === 'json') {
        await fs.writeJson(dest, asset);
    } else if (fileType === 'yaml') {
        await fs.writeYaml(dest, asset);
    } else {
        throw Error(`[resources] Unknown asset format: ${fileType} for asset ${dest}`);
    }
};

/**
 * @param asset Either an asset's object or its UID.
 * @param dest The path to the asset.
 * Can be either absolute or relative to `project/assets` folder.
 *
 * @async
 */
const createAsset = async (asset: IAsset, dest: string): Promise<void> => {
    throwIfOutsideAssets(dest);
    const typeSpec = assetTypes[asset.type];
    await dumpAsset(dest, typeSpec.format, Object.assign(asset, {
        mtime: Number(new Date())
    }));
    if (typeSpec.hasDataFolder) {
        fs.ensureDir(dest + '.data');
    }
    applySaveHooks(asset, ensureRelativeAssetPath(dest));
    addAsset(asset.uid, dest);
    window.signals.trigger(asset.type + 'Created', asset, dest);
    window.signals.trigger('assetCreated', asset, dest);
};

/**
 * @param idOrPath The ID of an asset, or the path to it relative to the `project/assets` folder.
 * @returns A promise that resolves into an asset's object.
 * @async
 */
const loadAsset = (idOrPath: string): Promise<IAsset> => {
    const src: string = ensureAbsoluteAssetPath(idOrPath);
    throwIfOutsideAssets(src);
    const type = getTypeFromPath(src);
    throwIfInvalidAssetType(type);
    const typeSpec = assetTypes[type];
    if (typeSpec.format === 'json') {
        return fs.readJson(src);
    }
    if (typeSpec.format === 'yaml') {
        return fs.readYaml(src);
    }
    throw Error(`[resources] Unknown asset format: ${typeSpec.format} for asset ${src}`);
};

const {extend} = require('../objectUtils');
/**
 * Patches the given asset.
 * If the `patch` parameter is not set, dumps the asset itself.
 */
const patchAsset = async function (
    assetOrId: IAsset | string,
    patch?: Partial<IAsset>
): Promise<void> {
    const source = await ensureAsset(assetOrId);
    const result = patch ? extend(extend({}, source), patch) : source;
    const {format} = assetTypes[source.type];
    const assetPath = getAssetPath(assetOrId);
    await dumpAsset(assetPath, format, result);
    await applySaveHooks(source, assetPath);
    pokeAsset(ensureId(assetOrId));
    window.signals.trigger(source.type + 'Updated', source, assetPath);
    window.signals.trigger('assetUpdated', source, assetPath);
};
/**
 * @param asset Either an asset's object or its UID.
 * @param newPath The path to the asset, either relative to the project's 'assets' folder
 * or an absolute path.
 *
 * @returns The final path of a moved asset.
 */
const moveAsset = async function (assetOrId: IAsset | string, newPath: string): Promise<string> {
    throwIfOutsideAssets(newPath);
    const oldRelativePath = getAssetPath(assetOrId);
    const id = ensureId(assetOrId),
          asset = await ensureAsset(assetOrId);
    const newAbsolutePath = ensureAbsoluteAssetPath(newPath),
          newRelativePath = ensureRelativeAssetPath(newPath);
    const assetPath = ensureAbsoluteAssetPath(getAssetPath(id));
    const typeSpec = assetTypes[getTypeFromPath(assetPath)];
    await fs.move(assetPath, newAbsolutePath);
    if (typeSpec.hasDataFolder) {
        await fs.move(getAssetDataFolder(assetOrId), newAbsolutePath + '.data');
    }
    if (typeSpec.moveHooks && typeSpec.moveHooks.length) {
        const assetObject = asset;
        await Promise.all(typeSpec.moveHooks
            .map(predicate => predicate(assetObject, newRelativePath, oldRelativePath)));
    }
    moveAssetInRegistry(id, newRelativePath);
    applySaveHooks(asset, newRelativePath);
    window.signals.trigger(asset.type + 'Moved', asset, newRelativePath);
    window.signals.trigger('assetMoved', asset, newRelativePath);
    return newPath;
};

const deleteAsset = async function (assetOrId: IAsset | string): Promise<void> {
    const dataFile = ensureAbsoluteAssetPath(getAssetPath(assetOrId));
    const asset = await ensureAsset(assetOrId);
    const type = getTypeFromPath(dataFile),
          typeSpec = assetTypes[type];
    const promises = [];
    promises.push(fs.remove(dataFile));
    if (typeSpec.hasDataFolder) {
        promises.push(fs.remove(ensureAbsoluteAssetPath(getAssetDataFolder(assetOrId))));
    }
    if (typeSpec.dependencyRemovedHooks && typeSpec.dependencyRemovedHooks.length) {
        const assetObject = await ensureAsset(assetOrId);
        const dependents = getDependents(assetOrId);
        for (const dependent of dependents) {
            promises.push(loadAsset(dependent)
                .then(dependentObject => Promise.all(typeSpec.dependencyRemovedHooks.map(hook =>
                    hook(dependentObject, assetObject)))
                .then(() => {
                    removeDependent(assetOrId, dependent);
                })));
        }
    }
    await Promise.all(promises);
    removeAsset(ensureId(assetOrId));
    window.signals.trigger(asset.type + 'Deleted', asset, getAssetPath(assetOrId));
    window.signals.trigger('assetDeleted', asset, getAssetPath(assetOrId));
};

/* * * * * * * * * * * * * * * * * */
/* * Standard type registration  * */
/* * * * * * * * * * * * * * * * * */

import {register as registerTypes} from './types';
registerTypes();
import {register as registerTextures} from './textures';
registerTextures();
import {register as registerTandems} from './tandems';
registerTandems();
import {register as registerStyles} from './styles';
registerStyles();
import {register as registerSounds} from './sounds';
registerSounds();

/* * * * * * * * * * * * * * * * * */
/* * * * * * * Exports * * * * * * */
/* * * * * * * * * * * * * * * * * */

export {
    assetTypes,
    createAsset,
    loadAsset,
    patchAsset,
    moveAsset,
    deleteAsset,
    getAssetPath,
    getAssetDataFolder,
    pushDependent,
    removeDependent,
    registerAssetType
};
