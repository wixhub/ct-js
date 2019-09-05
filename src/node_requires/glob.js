/**
 * `glob` is a shared object for storing textures, handy mappings and global state.
 */

const textureLoader = new global.PIXI.Loader();

let modified = false;
const glob = {
    get modified() {
        return modified;
    },
    set modified(v) {
        if (v) {
            window.title = 'ctjs — ' + sessionStorage.projname + ' •';
        } else {
            window.title = 'ctjs — ' + sessionStorage.projname;
        }
        modified = v;
        return modified;
    },
    textureLoader
};

module.exports = glob;
