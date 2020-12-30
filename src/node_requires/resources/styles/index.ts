import {ensureAbsoluteAssetPath, ensureAsset} from './../utils';

const getPreview = function (
    style: assetRef | IStyle,
    x2?: boolean,
    fs?: boolean
): string {
    if (style === -1) {
        return 'data/img/notexture.png';
    }
    const asset = ensureAsset(style) as IStyle;
    const styleMetaPath = ensureAbsoluteAssetPath(typeof style === 'string' ? style : style.uid);
    if (fs) {
        return `${styleMetaPath}.data/prev${x2 ? '@2' : ''}.png`;
    }
    return `file://${styleMetaPath.replace(/\\/g, '/')}.data/prev${x2 ? '@2' : ''}.png?cache=${asset.mtime}`;
};

import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('style', {
        editor: 'style-editor',
        format: 'yaml',
        hasDataFolder: true,
        icon: 'droplet',
        nounAccessor: 'common.resourceNames.style',
        thumbnail: (style: IStyle, big?: boolean) => getPreview(style, big, false),
        thumbnailType: 'image'
    });
};

export {register};
