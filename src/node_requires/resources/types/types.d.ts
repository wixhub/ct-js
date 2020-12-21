interface IType extends IScriptable {
    depth: number,
    texture: assetRef,
    visible: boolean,
    parent: assetRef,
    extends: {
        [key: string]: unknown
    }
}
