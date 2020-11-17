const textures = require('./textures');
const particles = require('./particles');

const fs = require('fs-extra'),
      path = require('path');

const {getProjectPath} = require('./projects');

const getAbsolutePath = (subpath: string) => {
    const pp = getProjectPath();
    if (!pp) {
        throw new Error('Project path must be set');
    }
    path.join(pp, subpath);
};

/**
 * @async
 */
const saveResource = (resource: IResource, path: string) =>
    fs.outputJSON(getAbsolutePath(path), resource);

/**
 * @async
 */
const loadResource = (path: string) =>
    fs.readJSON(getAbsolutePath(path));

module.exports = {
    ...textures,
    ...particles,
    getAbsolutePath,
    saveResource,
    loadResource
};
