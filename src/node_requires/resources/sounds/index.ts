import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('style', {
        editor: 'sound-editor',
        format: 'json',
        hasDataFolder: true,
        icon: 'volume-2',
        nounAccessor: 'common.resourceNames.sound',
        thumbnail: (sound: ISound) => (sound.isMusic ? 'music' : 'volume-2'),
        thumbnailType: 'icon'
    });
};

export {register};
