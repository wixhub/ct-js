import {defaultProject} from './defaultProject';
import gitignore from './gitignore';

// These must return a path to a **DIRECTORY**
let projectPath: string | void = void 0;
let currentProject: IProject | void = void 0;
const getProjectPath = (): string|void => projectPath;
const setProjectPath = (newPath: string): void => {
    if (newPath.endsWith('project.yaml')) {
        throw new Error('[resources/projects/index] The path to a project must not point to the project.yaml file, but to its directory.');
    }
    projectPath = newPath;
};
const getProject = (): IProject|void => currentProject;

/**
 * @returns {Promise<string>} A promise that resolves into the absolute path
 * to the projects' directory
 */
const getDefaultProjectDir = function (): Promise<string> {
    const {getProjectsDir} = require('./../../platformUtils');
    return getProjectsDir();
};

const getExamplesDir = function (): string {
    const path = require('path');
    try {
        require('gulp');
        // Most likely, we are in a dev environment
        return path.join((nw.App as any).startPath, 'src/examples');
    } catch (e) {
        return path.join((nw.App as any).startPath, 'examples');
    }
};

/**
 * Returns a path to the project's thumbnail.
 * @param {string} projPath
 * @param {boolean} [fs] Whether to return a filesystem path (true) or a URL (false; default).
 */
const getProjectThumbnail = function (projPath: string, fs?: boolean): string {
    const path = require('path');
    if (fs) {
        return path.join(projPath, 'img', 'splash.png');
    }
    return `file://${projPath.replace(/\\/g, '/')}/splash.png`;
};

const putGitignore = async (projectPath: string) => {
    const fs = require('fs-extra');
    if (!(await fs.pathExists(path.join(projectPath, '.gitignore')))) {
        await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
    }
};

const loadProject = async (projectPath: string): Promise<IProject> => {
    const path = require('path'),
          fs = require('fs-extra');
    await Promise.all(['actions', 'assets', 'includes', 'scripts'].map(subpath =>
        fs.ensureDir(path.join(projectPath, subpath))));
    await putGitignore(projectPath);
    currentProject = fs.readYaml(path.join(projectPath, 'project.yaml')) as IProject;
    setProjectPath(projectPath);
    return currentProject;
};

const saveProject = async (): Promise<void> => {
    const fs = require('fs-extra');
    await fs.outputYaml(path.json(getProjectPath(), 'project.yaml'));
};

const createProject = async (projectPath: string, name: string): Promise<void> => {
    const path = require('path'),
          fs = require('fs-extra');
    await Promise.all(['actions', 'assets', 'includes', 'scripts'].map(subpath =>
        fs.ensureDir(path.join(projectPath, subpath))));
    await putGitignore(projectPath);
    currentProject = defaultProject.get();
    currentProject.settings.authoring.title = name;
    setProjectPath(projectPath);
    saveProject();
};

export {
    defaultProject,
    getDefaultProjectDir,
    getProjectThumbnail,
    getExamplesDir,
    getProjectPath,
    setProjectPath,
    loadProject,
    createProject,
    getProject,
    saveProject
};
