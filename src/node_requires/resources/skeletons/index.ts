const path = require('path');
import {ensureAbsoluteAssetPath, ensureId, throwIfOutsideAssets} from './../utils';

/**
 * Returns the path to the file that holds the mesh data, armature, and animations.
 */
const getSkeletonData = function getSkeletonData(skeleton: ISkeleton, fs?: boolean): string {
    const id = ensureId(skeleton);
    const metaPath = ensureAbsoluteAssetPath(id);
    const src = path.join(metaPath + '.data', 'ske.json');
    if (fs) {
        return src;
    }
    return `file://${src.replace(/\\/g, '/')}`;
};
/**
 * Returns the path to the file that describes a texture atlas.
 */
const getSkeletonTextureData = function getSkeletonTextureData(
    skeleton: ISkeleton,
    fs?: boolean
): string {
    const id = ensureId(skeleton);
    const metaPath = ensureAbsoluteAssetPath(id);
    const src = path.join(metaPath + '.data', 'tex.json');
    if (fs) {
        return src;
    }
    return `file://${src.replace(/\\/g, '/')}`;
};
/**
 * Returns the path to the texture atlas.
 */
const getSkeletonTexture = function getSkeletonTexture(skeleton: ISkeleton, fs?: boolean): string {
    const id = ensureId(skeleton);
    const metaPath = ensureAbsoluteAssetPath(id);
    const src = path.join(metaPath + '.data', 'tex.png');
    if (fs) {
        return src;
    }
    return `file://${src.replace(/\\/g, '/')}`;
};

const getSkeletonPreview = function getSkeletonPreview(skeleton: ISkeleton, fs?: boolean): string {
    const id = ensureId(skeleton);
    const metaPath = ensureAbsoluteAssetPath(id);
    const src = path.join(metaPath + '.data', 'preview.png');
    if (fs) {
        return src;
    }
    return `file://${src.replace(/\\/g, '/')}`;
};

/**
 * Generates a square thumbnail of a given skeleton
 * @param {String} skeleton The skeleton object to generate a preview for.
 * @returns {Promise<void>} Resolves after creating a thumbnail.
 */
const skeletonGenPreview = function (skeleton: ISkeleton): Promise<void> {
    const loader = new PIXI.Loader(),
          dbf = dragonBones.PixiFactory.factory;
    const fs = require('fs-extra');
    return new Promise((resolve, reject) => {
        // Draw the armature on a canvas/in a Pixi.js app
        const skelData = getSkeletonData(skeleton),
              texData = getSkeletonTextureData(skeleton),
              tex = getSkeletonTexture(skeleton);
        loader.add(skelData, skelData)
              .add(texData, texData)
              .add(tex, tex);
        loader.load(() => {
            dbf.parseDragonBonesData(loader.resources[skelData].data);
            dbf.parseTextureAtlasData(
                loader.resources[texData].data,
                loader.resources[tex].texture
            );
            const skel = dbf.buildArmatureDisplay('Armature', loader.resources[skelData].data.name);

            const app = new PIXI.Application();

            const rawSkelBase64 = app.renderer.plugins.extract.base64(skel);
            const skelBase64 = rawSkelBase64.replace(/^data:image\/\w+;base64,/, '');
            const buf = Buffer.from(skelBase64, 'base64');

            fs.writeFile(getSkeletonPreview(skeleton, true), buf)
            .then(() => {
                // Clean memory from DragonBones' armatures
                // eslint-disable-next-line no-underscore-dangle
                delete dbf._dragonBonesDataMap[loader.resources[skelData].data.name];
                // eslint-disable-next-line no-underscore-dangle
                delete dbf._textureAtlasDataMap[loader.resources[skelData].data.name];
            })
            .then(resolve)
            .catch(reject);
        });
    });
};

const importSkeleton = async function importSkeleton(
    src: string,
    name: string,
    folder: string
): Promise<void> { // TODO:
    throwIfOutsideAssets(folder);
    const generateGUID = require('./../generateGUID');
    const fs = require('fs-extra');
    if (!name) {
        name = path.basename(src)
            .replace(/_ske\.json/gi, '')
            .replace(/\s/g, '_');
    }
    const metaFile = path.join(folder, `${name}.ctskeleton`);

    const uid = generateGUID();

    await Promise.all([
        fs.copy(src, path.join(metaFile, 'ske.json')),
        fs.copy(src.replace('_ske.json', '_tex.json'), path.join(metaFile, 'tex.json')),
        fs.copy(src.replace('_ske.json', '_tex.png'), path.join(metaFile, 'tex.png'))
    ]);
    const skel = {
        name,
        from: 'dragonbones',
        type: 'skeleton',
        uid
    } as const;
    await skeletonGenPreview(skel);
    window.signals.trigger('skeletonImported', skel);
};

import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('skeleton', {
        format: 'json',
        hasDataFolder: true,
        icon: 'texture', // TODO:
        nounAccessor: 'common.resourceNames.skeleton',
        thumbnail: (skeleton: ISkeleton) => getSkeletonPreview(skeleton, true),
        thumbnailType: 'image'
    });
};

export {
    getSkeletonData,
    getSkeletonTextureData,
    getSkeletonTexture,
    getSkeletonPreview,
    skeletonGenPreview,
    importSkeleton,
    register
};
