const path = require('path');
import {ensureAbsoluteAssetPath, ensureAsset, ensureId, throwIfOutsideAssets} from './../utils';
import {getMdate} from './../registry';
import {get as getDefaultTexture} from './defaultTexture';
import {createAsset} from './../';

/**
 * Retrieves the full path to a thumbnail of a given texture.
 * @param {string|ITexture} texture Either the id of the texture, or its ct.js object
 * @param {boolean} [x2] If set to true, returns a 128x128 image instead of 64x64.
 * @param {boolean} [fs] If set to true, returns a file system path, not a URI.
 * @returns {string} The full path to the thumbnail.
 */
const getTexturePreview = function (
    texture: assetRef | ITexture,
    x2?: boolean,
    fs?: boolean
): string {
    if (texture === -1) {
        return 'data/img/notexture.png';
    }
    const id = ensureId(texture);
    const textureMetaPath = ensureAbsoluteAssetPath(id);
    if (fs) {
        return `${textureMetaPath}.data/prev${x2 ? '@2' : ''}.png`;
    }
    return `file://${textureMetaPath.replace(/\\/g, '/')}.data/prev${x2 ? '@2' : ''}.png?cache=${Number(getMdate(id))}`;
};

/**
 * Retrieves a full path to the source image of a given texture
 * @param {string|ITexture} texture Either the id of a texture, or a ct.js texture object
 * @param {boolean} [fs] If set to true, returns a file system path, not a URI.
 * @returns {string} The full path to the source image.
 */
const getTextureOrig = function (texture: assetRef | ITexture, fs?: boolean): string {
    if (texture === -1) {
        return 'data/img/notexture.png';
    }
    const id = ensureId(texture);
    if (fs) {
        return path.join(`${ensureAbsoluteAssetPath(id)}.data`, 'source.png');
    }
    return `file://${ensureAbsoluteAssetPath(id).replace(/\\/g, '/')}/source.png?cache=${Number(getMdate(id))}`;
};

const baseTextureFromTexture = (texture: string | ITexture): Promise<PIXI.BaseTexture> =>
    new Promise((resolve, reject) => {
        const textureLoader = new PIXI.Loader();
        const {resources} = textureLoader;

        texture = ensureId(texture);
        const path = getTextureOrig(texture, false);

        textureLoader.add(texture, path);
        textureLoader.onError.add(reject);
        textureLoader.load(() => {
            resolve(resources[texture].texture.baseTexture);
        });
    });

declare interface IPixiTextureCacheEntry {
    lastmod: number,
    texture: PIXI.Texture
}
const pixiTextureCache: Map<string, IPixiTextureCacheEntry> = new Map();
const clearPixiTextureCache = function (): void {
    pixiTextureCache.clear();
};
/**
 * @param {any} tex A ct.js texture object
 * @returns {Array<PIXI.Texture>} An array of PIXI.Textures
 */
const texturesFromCtTexture = async function (tex: ITexture | string) {
    tex = (await ensureAsset(tex)) as ITexture;
    const frames = [];
    const baseTexture = await baseTextureFromTexture(tex);
    for (let col = 0; col < tex.grid[1]; col++) {
        for (let row = 0; row < tex.grid[0]; row++) {
            const texture = new PIXI.Texture(
                baseTexture,
                new PIXI.Rectangle(
                    tex.offx + row * (tex.width + tex.marginx),
                    tex.offy + col * (tex.height + tex.marginy),
                    tex.width,
                    tex.height
                )
            );
            texture.defaultAnchor = new PIXI.Point(
                tex.axis[0] / tex.width,
                tex.axis[1] / tex.height
            );
            frames.push(texture);
            if (col * tex.grid[0] + row >= tex.untill && tex.untill > 0) {
                break;
            }
        }
    }
    return frames;
};

const defaultTexture: PIXI.Texture = PIXI.Texture.from('data/img/unknown.png');

const getDOMImage = function (
    texture: ITexture | assetRef,
    fallback?: string
): Promise<HTMLImageElement> {
    let path;
    const img = document.createElement('img');
    if (texture === -1 || !texture) {
        path = fallback || 'data/img/notexture.png';
    } else {
        const id = ensureId(texture);
        path = getTextureOrig(id, false);
    }
    img.src = path;
    return new Promise((resolve, reject) => {
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (err) => reject(err));
    });
};

/**
 * @param {string|-1|any} texture Either a uid of a texture, or a ct.js texture object
 * @param {number} [frame] The frame to extract. If not defined, will return an array of all frames
 * @param {boolean} [allowMinusOne] Allows the use of `-1` as a texture uid
 * @returns {Array<PIXI.Texture>|PIXI.Texture} An array of textures, or an individual one.
 */
const getPixiTexture = async function (
    texture: assetRef | ITexture,
    frame?: number,
    allowMinusOne?: boolean
): Promise<PIXI.Texture> {
    if (texture === -1) {
        if (allowMinusOne) {
            if (frame || frame === 0) {
                return defaultTexture;
            }
            return [defaultTexture];
        }
        throw new Error('[resources/texture/getPixiTexture]');
    }
    const uid = ensureId(texture);
    if (!pixiTextureCache.has(uid) ||
        pixiTextureCache.get(uid).lastmod !== Number(getMdate(uid))
    ) {
        const pixiTextures = await texturesFromCtTexture(texture);
        // Everything is constant, and the key gets overridden.
        // Where's the race condition? False positive??
        // eslint-disable-next-line require-atomic-updates
        pixiTextureCache.set(uid, {
            lastmod: Number(getMdate(uid)),
            texture: pixiTextures
        });
    }
    if (frame || frame === 0) {
        return pixiTextureCache.get(uid).texture[frame];
    }
    return pixiTextureCache.get(uid).texture;
};

const convertToPngBuffer = function convertToPngBuffer(
    img: HTMLImageElement | HTMLCanvasElement
): Buffer {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const x = canvas.getContext('2d');
    x.drawImage(img, 0, 0);
    const base64 = canvas.toDataURL('png').replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(base64, 'base64');
    return buf;
};

const textureGenPreview = async function textureGenPreview(texture, destination, size) {
    if (typeof texture === 'string') {
        texture = getTextureFromId(texture);
    }
    const {imageContain, toBuffer, crop} = require('../../imageUtils');

    const source = await getDOMImage(texture);
    const frame = crop(
        source,
        texture.offx,
        texture.offy,
        texture.width,
        texture.height
    );
    const c = imageContain(frame, size, size);
    const buf = toBuffer(c);
    const fs = require('fs-extra');
    await fs.writeFile(destination, buf);
    return destination;
};

const texturePostfixParser = /_(?<cols>\d+)x(?<rows>\d+)(?:@(?<until>\d+))?$/;
const isBgPostfixTester = /@bg$/;
/**
 * Tries to load an image, then adds it to the projects and creates a thumbnail
 * @param {string|Buffer} src A path to the source image, or a Buffer of an already read image.
 * @param {string} [name] The name of the texture. Optional, defaults to 'NewTexture'
 * or file's basename.
 * @returns {Promise<ITexture>} A promise that resolves into the resulting texture object.
 */
// eslint-disable-next-line max-lines-per-function
const importImageToTexture = async ( // TODO:
    src: string | Buffer,
    name: string,
    folder: string
): Promise<ITexture> => {
    throwIfOutsideAssets(folder);
    const fs = require('fs-extra'),
          path = require('path'),
          generateGUID = require('./../../generateGUID');
    const id = generateGUID();
    const metaFile = path.join(folder, `${name}.cttexture`);
    const image = document.createElement('img');
    // Wait while the image is loading
    await new Promise((resolve, reject) => {
        image.onload = () => {
            resolve();
        };
        image.onerror = e => {
            window.alertify.error(e);
            reject(e);
        };
        image.src = 'file://' + dest + '?' + Math.random();
    });
    let texName;
    if (name) {
        texName = name;
    } else if (src instanceof Buffer) {
        texName = 'NewTexture';
    } else {
        texName = path.basename(src)
            .replace(/\.(jpg|gif|png|jpeg)/gi, '')
            .replace(/\s/g, '_');
    }
    const obj: ITexture = Object.assign(getDefaultTexture(), {
        imgWidth: image.width,
        imgHeight: image.height,
        width: image.width,
        height: image.height,
        shape: 'rect',
        left: 0,
        right: image.width,
        top: 0,
        bottom: image.height,
        uid: id
    });
    if (!(src instanceof Buffer)) {
        obj.source = src;
    }

    // Test if this has a postfix _NxM@K or _NxM
    const exec = texturePostfixParser.exec(texName);
    if (exec) {
        texName = texName.replace(texturePostfixParser, '');
        obj.grid = [Number(exec.groups.cols) || 1, Number(exec.groups.rows) || 1];
        obj.width /= obj.grid[0];
        obj.height /= obj.grid[1];
        obj.right /= obj.grid[0];
        obj.bottom /= obj.grid[1];
        if (exec.groups.until) {
            obj.untill = Number(exec.groups.until);
        }
    } else if (isBgPostfixTester.test(texName)) {
        // Test whether it has a @bg postfix
        texName = texName.replace(isBgPostfixTester, '');
        obj.tiled = true;
    }
    createAsset(obj, metaFile);
    fs.writeFile(path.join(metaFile + '.data', 'source.png'), convertToPngBuffer(image));

    await Promise.all([
        textureGenPreview(obj, dest + '_prev.png', 64),
        textureGenPreview(obj, dest + '_prev@2.png', 128)
    ]);

    return obj;
};

const getTexturePivot = (texture: -1 | ITexture, inPixels: boolean): [number, number] => {
    if (texture === -1) {
        return [16, 16];
    }
    if (inPixels) {
        return [texture.axis[0], texture.axis[1]];
    }
    return [texture.axis[0] / texture.width, texture.axis[1] / texture.height];
};

import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('texture', {
        editor: 'texture-editor',
        format: 'yaml',
        hasDataFolder: true,
        icon: 'texture',
        nounAccessor: 'common.resourceNames.texture',
        thumbnail: (texture: ITexture, big?: boolean) => getTexturePreview(texture, big, false),
        thumbnailType: 'image'
    });
};

export {
    clearPixiTextureCache,
    getTexturePreview,
    getTexturePivot,
    getTextureOrig,
    getPixiTexture,
    getDOMImage,
    importImageToTexture,
    textureGenPreview,
    register
};
