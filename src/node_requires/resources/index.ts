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
const saveResource = (resource: IResource, path: string): Promise<void> =>
    fs.outputJSON(getAbsolutePath(path), resource);

/**
 * @async
 */
const loadResource = (path: string): Promise<IResource> =>
    fs.readJSON(getAbsolutePath(path));

export {
    getAbsolutePath,
    saveResource,
    loadResource
};
