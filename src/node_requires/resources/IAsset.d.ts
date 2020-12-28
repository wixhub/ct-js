interface IAsset {
    readonly type: resourceType;
    readonly uid: string;
    /**
     * Last modification time as a number (simply `+(new Date())`).
     * Can be used to solve caching issues with textures and such.
     * It is set automatically on each save/patch operation.
     */
    mtime: number;
}
