import {ensureAbsoluteAssetPath, ensureId} from './../utils';
import {getMdate} from './../registry';

/**
 * Retrieves the full path to a thumbnail of a given room.
 * @param {string|IRoom} room Either the id of the room, or its ct.js object
 * @param {boolean} [x2] If set to true, returns a 128x128 image instead of 64x64.
 * @param {boolean} [fs] If set to true, returns a file system path, not a URI.
 * @returns {string} The full path to the thumbnail.
 */
const getRoomPreview = function (
    room: assetRef | IRoom,
    x2?: boolean,
    fs?: boolean
): string {
    if (room === -1) {
        return 'data/img/notexture.png';
    }
    const id = ensureId(room);
    const roomMetaPath = ensureAbsoluteAssetPath(id);
    if (fs) {
        return `${roomMetaPath}.data/prev${x2 ? '@2' : ''}.png`;
    }
    return `file://${roomMetaPath.replace(/\\/g, '/')}.data/prev${x2 ? '@2' : ''}.png?cache=${Number(getMdate(id))}`;
};

import {registerAssetType} from './../index';
const register = function (): void {
    registerAssetType('room', {
        editor: 'room-editor',
        creatable: true,
        importable: false,
        format: 'json',
        hasDataFolder: true,
        icon: 'room',
        nounAccessor: 'common.resourceNames.room',
        thumbnail: (room: IRoom, big?: boolean) => getRoomPreview(room, big, false),
        thumbnailType: 'icon'
    });
};

export {
    register,
    getRoomPreview
};
