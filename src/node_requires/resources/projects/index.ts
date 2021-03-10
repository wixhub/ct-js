import {defaultProject} from './defaultProject';
import gitignore from './gitignore';

const path = require('path');

/** projectPath must return a path to a **DIRECTORY** */
let projectPath: string | void = void 0;
let currentProject: IProject | void = void 0;

const getProjectPath = (): string|void => projectPath;
const setProjectPath = async (newPath: string): Promise<void> => {
    if (newPath.endsWith('project.yaml')) {
        throw new Error('[resources/projects/index] The path to a project must not point to the project.yaml file, but to its directory.');
    }
    const fs = require('fs-extra');
    if (!(await fs.pathExists(path.join(newPath, 'project.yaml')))) {
        throw new Error('[resources/projects/index] The project\'s folder does not have project.yaml');
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
    const fs = require('fs-extra');
    await setProjectPath(projectPath);
    await Promise.all(['actions', 'assets', 'includes', 'scripts'].map(subpath =>
        fs.ensureDir(path.join(projectPath, subpath))));
    await putGitignore(projectPath);
    currentProject = await fs.readYaml(path.join(projectPath, 'project.yaml')) as IProject;

    // Update the list of latest projects
    const latestProjects = localStorage.latestProjects ? localStorage.latestProjecs.split(';') : [];
    const lpId = latestProjects.indexOf(projectPath);
    if (lpId !== -1) {
        latestProjects.splice(lpId, 1);
    }
    latestProjects.unshift(projectPath);
    localStorage.latestProjects = latestProjects.join(';');

    window.signals.trigger('projectLoaded');
    return currentProject;
};

const saveProject = async (customData?: IProject, customProjPath?: string): Promise<void> => {
    const fs = require('fs-extra');
    if (customData) {
        await fs.outputYaml(path.join(customProjPath, 'project.yaml'), customData);
        return;
    }
    await fs.outputYaml(path.join(getProjectPath(), 'project.yaml'), currentProject);
};

/**
 * @param {string} projectPath The path to the root folder of a project
 * @param {string} [name] Optional name to be set inside the created project.yaml
 */
const createProject = async (newProjectPath: string, name?: string): Promise<void> => {
    const fs = require('fs-extra');
    await Promise.all(['actions', 'assets', 'includes', 'scripts'].map(subpath =>
        fs.ensureDir(path.join(newProjectPath, subpath))));
    await putGitignore(newProjectPath);
    await fs.copy('./data/img/notexture.png', path.join(newProjectPath, 'splash.png'));
    const newProject = defaultProject.get();
    newProject.settings.authoring.title = name;
    await saveProject(newProject, newProjectPath);
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
