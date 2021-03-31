const getDefaultType = require('./defaultType').get;

import {getTexturePreview} from './../textures';

import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('type', {
        editor: 'type-editor',
        format: 'yaml',
        hasDataFolder: true,
        icon: 'type',
        nounAccessor: 'common.resourceNames.type',
        thumbnail: (type: IType, big?: boolean) => getTexturePreview(type.texture, big),
        thumbnailType: 'image',
        dependencyRemovedHooks: [] // TODO:
    });
};

export {
    getDefaultType,
    register
};