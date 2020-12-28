import {getProjectPath} from './projects';

const ensureId = (source: string | IAsset): string => {
    if (typeof source === 'string') {
        return source;
    }
    return source.uid;
};

const path = require('path');
const getTypeFromPath = (source: string): string => {
    const ext = path.extname(source);
    if (!ext.startsWith('ct')) {
        throw new Error(`[resources/utils] Not a valid ct.js resource: ${source}`);
    }
    return ext.slice(2);
};

import {loadAsset} from './index';
import {getAssetPath, getAssetId} from './registry';

/**
 * @async
 */
const ensureAsset = (asset: IAsset | string): IAsset | Promise<IAsset> => {
    if (typeof asset === 'string') {
        return loadAsset(getAssetPath(asset));
    }
    return asset;
};

const ensureRelativeAssetPath = function (pathOrId: string): string {
    try {
        // Make a backwards lookup.
        return getAssetId(pathOrId);
    } catch {
        // Call a forwards lookup to ensure that the path really exists.
        getAssetPath(pathOrId);
        if (path.isAbsolute(pathOrId)) {
            const pp = getProjectPath();
            if (!pp) {
                throw new Error('[resources/utils] Project path must be set');
            }
            return path.relative(path.join(pp, 'assets'), pathOrId);
        }
        return pathOrId;
    }
};
/**
 * @param asset The path of an asset or its ID.
 * @returns The ID of an asset.
 * @remarks
 * For getting uid from IAsset, simply use `asset.uid`.
 */
const ensureIdFromPath = function (pathOrId: string): string {
    try {
        // Make a forwards lookup.
        return getAssetPath(pathOrId);
    } catch {
        // Call a backwards lookup to ensure that the id really exists.
        getAssetId(pathOrId);
        return pathOrId;
    }
};

const makeAssetPathAbsolute = (subpath: string): string => {
    const pp = getProjectPath();
    if (!pp) {
        throw new Error('[resources/utils] Project path must be set');
    }
    return path.join(pp, 'assets', subpath);
};

/**
 * Returns an absolute path to a file when given any path or id.
 *
 * @param subpathOrId The absolute path, subpath relative to `project/assets`,
 * or the UID of an asset.
 * @returns The UID of the specified asset.
 */
const ensureAbsoluteAssetPath = (subpathOrId: string): string => {
    try {
        // Is it an ID?
        subpathOrId = getAssetPath(subpathOrId);
    } catch (e) {
        void e; // Not an ID ✅
    }
    if (path.isAbsolute(subpathOrId)) {
        return subpathOrId;
    }
    return makeAssetPathAbsolute(subpathOrId);
};

const throwIfOutsideAssets = (dest: string): void => {
    const assets = path.join(getProjectPath(), 'assets');
    if (path.relative(assets, ensureAbsoluteAssetPath(dest)).startsWith('..')) {
        throw new Error(`[resources/utils] The path ${dest} is outside of the assets directory.`);
    }
};
const throwIfRelative = (dest: string): void => {
    if (!path.isAbsolute(dest)) {
        throw new Error(`[resources/utils] The path ${dest} is not absolute.`);
    }
};
const throwIfAbsolute = (dest: string): void => {
    if (path.isAbsolute(dest)) {
        throw new Error(`[resources/utils] The path ${dest} is not relative.`);
    }
};

export {
    getTypeFromPath,
    ensureAsset,
    ensureRelativeAssetPath,
    ensureAbsoluteAssetPath,
    makeAssetPathAbsolute,
    ensureIdFromPath,
    ensureId,
    throwIfOutsideAssets,
    throwIfRelative,
    throwIfAbsolute
};
