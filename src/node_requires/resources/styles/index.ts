import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('type', {
        editor: 'style-editor',
        format: 'yaml',
        hasDataFolder: true,
        icon: 'droplet',
        nounAccessor: 'common.resourceNames.style',
        thumbnail: () => 'sparkles',
        thumbnailType: 'image',
        dependencyRemovedHooks: [] // TODO:
    });
};

export {register};
