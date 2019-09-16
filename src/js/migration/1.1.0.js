window.migrationProcess = window.migrationProcess || [];

/* CHANGELOG
 * Rename room.tiles into room.tileLayers, decompose tile patches of more than 1 tile down into individual pieces
 */

(function () {
    const i18n = require('./data/node_requires/i18n');
    const patchIntoTiles = (patch, project) => {
        /**
         * Previous data included a `grid` entry, which was an array with values:
         * - a starting column;
         * - a starting row;
         * - column span;
         * - row span.
         *
         * @returns {Array<Object>} An array of individual tiles.
         **/
        const texture = project.textures.find(tex => tex.uid === patch.texture);
        const tiles = [];
        for (let x = 0; x < patch.grid[2]; x++) {
            for (let y = 0; y < patch.grid[3]; y++) {
                tiles.push({
                    x: patch.x + x * texture.width,
                    y: patch.y + y * texture.height,
                    texture: patch.texture,
                    frame: x + patch.grid[0] + (y + patch.grid[1]) * texture.grid[0]
                });
            }
        }
        return tiles;
    };
    window.migrationProcess.push({
        version: '1.1.0',
        process: project => new Promise((resolve) => {
            for (const room of project.rooms) {
                const tileLayers = [];
                for (const oldLayer of room.tiles) {
                    const newLayer = {
                        depth: Number(oldLayer.depth),
                        type: 'tiles',
                        tiles: [],
                        name: i18n.languageJSON.roomview.layerTypes.tiles
                    };
                    for (const patch of (oldLayer.tiles)) {
                        newLayer.tiles.push(...patchIntoTiles(patch, project));
                    }
                    tileLayers.push(newLayer);
                }
                const {backgrounds} = room;
                for (const bg of backgrounds) {
                    bg.type = 'background';
                    bg.depth = Number(bg.depth);
                    bg.name = i18n.languageJSON.roomview.layerTypes.background;
                }
                for (const copy of room.copies) {
                    delete copy.lastX; // these should have been temporal variables :[
                    delete copy.lastY;
                    copy.scale = {
                        x: copy.tx === void 0? 1 : copy.tx,
                        y: copy.ty === void 0? 1 : copy.ty
                    };
                    copy.rotation = 0;
                    copy.alpha = 1;
                    copy.tint = 0xffffff;
                    copy.extends = {};
                }
                room.x = room.x || 0; // The starting position of the camera
                room.y = room.y || 0;
                // From background layers to top ones.
                // We don't (though we can) split copies into layers here.
                room.layers = [...tileLayers, ...backgrounds, {
                    depth: 0,
                    type: 'copies',
                    name: i18n.languageJSON.roomview.layerTypes.copies,
                    copies: room.copies
                }, {
                    type: 'viewport',
                    depth: Infinity,
                    x: room.width / 2,
                    y: room.height / 2,
                    name: i18n.languageJSON.roomview.layerTypes.camera,
                    width: room.width,
                    height: room.height
                }];
                room.layers.sort((a, b) => a.depth - b.depth);
                delete room.tiles;
                delete room.backgrounds;
                delete room.copies;
                for (const layer of room.layers) {
                    delete layer.depth;
                }
            }
            resolve();
        })
    });
})();
