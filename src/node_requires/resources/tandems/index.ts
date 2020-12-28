import {get as defaultEmitter} from './defaultEmitter';

import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('type', {
        editor: 'emitter-tandem-editor',
        format: 'yaml',
        hasDataFolder: false,
        icon: 'sparkles',
        nounAccessor: 'common.resourceNames.tandem',
        thumbnail: () => 'sparkles',
        thumbnailType: 'icon',
        dependencyRemovedHooks: [] // TODO:
    });
};

export {
    defaultEmitter,
    register
};
