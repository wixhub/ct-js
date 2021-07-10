import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('sound', {
        editor: 'sound-editor',
        creatable: true,
        importable: true,
        favorImport: true,
        format: 'json',
        defaultAsset: {
            type: 'sound',
            isMusic: false
        } as ISound,
        hasDataFolder: true,
        icon: 'volume-2',
        nounAccessor: 'common.resourceNames.sound',
        thumbnail: (sound: ISound) => (sound.isMusic ? 'music' : 'volume-2'),
        thumbnailType: 'icon'
    });
};

export {register};
