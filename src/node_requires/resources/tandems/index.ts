import {get as defaultEmitter} from './defaultEmitter';

import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('tandem', {
        editor: 'emitter-tandem-editor',
        creatable: true,
        importable: false,
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
