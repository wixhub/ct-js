const fs = require('fs-extra'),
      path = require('path');

import {getProjectPath} from './projects';
const getAbsolutePath = (subpath: string): string => {
    const pp = getProjectPath();
    if (!pp) {
        throw new Error('Project path must be set');
    }
    return path.join(pp, subpath);
};

/**
 * @async
 */
const saveAsset = (asset: IAsset, path: string): Promise<void> =>
    fs.outputJSON(getAbsolutePath(path), asset);
/**
 * @async
 */
const loadAsset = (path: string): Promise<IAsset> =>
    fs.readJSON(getAbsolutePath(path));

export {
    getAbsolutePath,
    saveAsset,
    loadAsset
};
