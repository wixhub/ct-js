room-editor.panel.view
    .toolbar.borderright.tall
        .settings.nogrow.noshrink
            b {voc.name}
            br
            input.wide(type="text" value="{room.name}" onchange="{wire('this.room.name')}")
            .anErrorNotice(if="{nameTaken}") {vocGlob.nametaken}
            .fifty.npt.npb.npl
                b {voc.width}
                br
                input.wide(type="number" value="{room.width}" onchange="{wire('this.room.width')}")
            .fifty.npt.npb.npr
                b {voc.height}
                br
                input.wide(type="number" value="{room.height}" onchange="{wire('this.room.height')}")
            br
            button.wide(onclick="{openRoomEvents}")
                i.icon-confirm(if="{room.oncreate || room.onstep || room.ondestroy || room.ondraw}")
                span {voc.events}
        .palette
            .tabwrap
                ul.tabs.nav.noshrink.nogrow
                    li(onclick="{changeTab('roomcopies')}" class="{active: tab === 'roomcopies'}") {voc.copies}
                    li(onclick="{changeTab('roombackgrounds')}" class="{active: tab === 'roombackgrounds'}") {voc.backgrounds}
                    li(onclick="{changeTab('roomtiles')}" class="{active: tab === 'roomtiles'}") {voc.tiles}
                .relative
                    room-type-picker(show="{tab === 'roomcopies'}" current="{currentType}")
                    room-backgrounds-editor(show="{tab === 'roombackgrounds'}" room="{room}")
                    room-tile-editor(show="{tab === 'roomtiles'}" room="{room}")
        .done.nogrow
            button.wide#roomviewdone(onclick="{roomSave}")
                i.icon-confirm
                span {voc.done}
    .editor(ref="canvaswrap")
        canvas(ref="canvas" onmousewheel="{onCanvasWheel}")
        .shift
            button.inline.square(title="{voc.shift}" onclick="{roomShift}")
                i.icon-move
            span {voc.hotkeysNotice}
        .zoom
            b {voc.zoom}
            div.button-stack
                button#roomzoom12.inline(onclick="{roomToggleZoom(0.125)}" class="{active: zoomFactor === 0.125}") 12%
                button#roomzoom25.inline(onclick="{roomToggleZoom(0.25)}" class="{active: zoomFactor === 0.25}") 25%
                button#roomzoom50.inline(onclick="{roomToggleZoom(0.5)}" class="{active: zoomFactor === 0.5}") 50%
                button#roomzoom100.inline(onclick="{roomToggleZoom(1)}" class="{active: zoomFactor === 1}") 100%
                button#roomzoom200.inline(onclick="{roomToggleZoom(2)}" class="{active: zoomFactor === 2}") 200%
                button#roomzoom400.inline(onclick="{roomToggleZoom(4)}" class="{active: zoomFactor === 4}") 400%
        .grid
            button#roomgrid(onclick="{roomToggleGrid}" class="{active: room.gridX > 0}")
                span {voc[room.gridX > 0? 'gridoff' : 'grid']}
        .center
            button#roomcenter(onclick="{roomToCenter}") {voc.tocenter}
    room-events-editor(if="{editingCode}" room="{room}")
    script.
        this.editingCode = false;
        this.forbidDrawing = false;
        const fs = require('fs-extra'),
              gui = require('nw.gui');
        const win = gui.Window.get();
        this.namespace = 'roomview';
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);
        this.room = this.opts.room;

        this.mouseX = this.mouseY = 0;
        this.roomx = this.room.width / 2;
        this.roomy = this.room.height / 2;
        this.zoomFactor = 1;
        this.room.gridX = this.room.gridX || this.room.grid || 64;
        this.room.gridY = this.room.gridY || this.room.grid || 64;
        this.tab = 'roomcopies';

        this.on('update', () => {
            if (window.currentProject.rooms.find(room =>
                this.room.name === room.name && this.room !== room
            )) {
                this.nameTaken = true;
            } else {
                this.nameTaken = false;
            }
        });
        /**
         * Records the state of Ctrl, Shift, Alt, etc to a `this.state` object
         * This is used in the Room class
         */
        this.state = {
            alt: false,
            shift: false,
            ctrl: false,
            space: false
        };
        this.recordStateKeys = e => {
            this.state.alt = e.altKey;
            this.state.ctrl = e.ctrlKey || e.metaKey; // recognise Meta key on MacOS as ctrl, because screw you, MacOS
            this.state.shift = e.shiftKey;
        };
        this.onKeyDown = e => {
            if (e.key === ' ') {
                this.state.space = true;
            }
            this.recordStateKeys(e);
        };
        this.onKeyUp = e => {
            if (e.key === ' ') {
                this.state.space = false;
            }
            this.recordStateKeys(e);
        };
        document.body.addEventListener('keydown', this.onKeyDown);
        document.body.addEventListener('keyup', this.onKeyUp);
        this.on('unmount', () => {
            document.body.removeEventListener('keydown', this.onKeyDown);
            document.body.removeEventListener('keyup', this.onKeyUp);
        });

        this.on('mount', () => {
            this.room = this.opts.room;
            this.gridCanvas = document.createElement('canvas');
            this.gridCanvas.x = this.gridCanvas.getContext('2d');
            this.redrawGrid();

            const RoomEditor = require('./data/node_requires/roomEditor/RoomEditor');
            this.pixiApp = new RoomEditor({
                view: this.refs.canvas,
                resizeTo: this.refs.canvaswrap
            }, this);
            this.pixiRoom = this.pixiApp.room;
        });
        this.openRoomEvents = e => {
            this.editingCode = true;
        };

        // Room navigation and zoom settings
        this.updateCameraZoom = () => {
            Ease.ease.add(this.pixiApp.camera.scale, {
                x: 1 / this.zoomFactor, // to zoom out, we need to enlarge the area covered by a camera,
                y: 1 / this.zoomFactor  // thus we use an inverted scale here
            }, {
                duration: 350
            });
        }
        this.roomToggleZoom = zoomFactor => e => {
            this.zoomFactor = zoomFactor;
            this.updateCameraZoom();
        };
        this.roomToCenter = e => {
            // TODO:
            this.pixiRoom.x = 0;
            this.pixiRoom.y = 0;
        };

        this.redrawGrid = () => {
            this.gridCanvas.width = this.room.gridX;
            this.gridCanvas.height = this.room.gridY;
            this.gridCanvas.x.clearRect(0, 0, this.room.gridX, this.room.gridY);
            this.gridCanvas.x.globalAlpha = 0.3;
            this.gridCanvas.x.strokeStyle = localStorage.UItheme === 'Night'? '#44dbb5' : '#446adb';
            this.gridCanvas.x.lineWidth = 1 / this.zoomFactor;
            this.gridCanvas.x.strokeRect(0.5 / this.zoomFactor, 0.5 / this.zoomFactor, this.room.gridX, this.room.gridY);
        };
        this.roomToggleGrid = () => {
            if (this.room.gridX === 0) {
                alertify
                .confirm(this.voc.gridsize + `<br/><input type="number" value="64" style="width: 6rem;" min=2 id="theGridSizeX"> x <input type="number" value="64" style="width: 6rem;" min=2 id="theGridSizeY">`)
                .then(e => {
                    if (e.buttonClicked === 'ok') {
                        this.room.gridX = Number(document.getElementById('theGridSizeX').value);
                        this.room.gridY = Number(document.getElementById('theGridSizeY').value);
                    }
                    this.redrawGrid();
                    // TODO:
                    this.update();
                });
            } else {
                this.refreshRoomCanvas();
                this.room.gridX = 0;
                this.room.gridY = 0;
            }
        };

        // Copies
        this.tab = 'roomcopies';
        this.changeTab = tab => e => {
            this.tab = tab;
            if (tab === 'roombackgrounds') {
                this.roomUnpickType();
            }
        };
        this.roomUnpickType = e => {
            this.currentType = -1;
        };

        /** При прокрутке колёсиком меняем фактор зума */
        this.onCanvasWheel = e => {
            const oldZoomFactor = this.zoomFactor;
            if (e.wheelDelta > 0) {
                // in
                if (this.zoomFactor === 2) {
                    this.zoomFactor = 4;
                } else if (this.zoomFactor === 1) {
                    this.zoomFactor = 2;
                } else if (this.zoomFactor === 0.5) {
                    this.zoomFactor = 1;
                } else if (this.zoomFactor === 0.25) {
                    this.zoomFactor = 0.5;
                } else if (this.zoomFactor === 0.125) {
                    this.zoomFactor = 0.25;
                }
            } else {
                // out
                if (this.zoomFactor === 4) {
                    this.zoomFactor = 2;
                } else if (this.zoomFactor === 2) {
                    this.zoomFactor = 1;
                } else if (this.zoomFactor === 1) {
                    this.zoomFactor = 0.5;
                } else if (this.zoomFactor === 0.5) {
                    this.zoomFactor = 0.25;
                } else if (this.zoomFactor === 0.25) {
                    this.zoomFactor = 0.125;
                }
            }
            if (oldZoomFactor !== this.zoomFactor) {
                this.updateCameraZoom();
                const local = this.pixiRoom.toLocal({
                    x: e.offsetX,
                    y: e.offsetY
                });
                k = 1/this.zoomFactor / this.pixiApp.camera.scale.x;
                Ease.ease.add(this.pixiApp.camera, {
                    x: this.pixiApp.camera.x*k + local.x*(1-k),
                    y: this.pixiApp.camera.y*k + local.y*(1-k)
                }, {
                    duration: 350
                });
            }
        };

        // Shifts all the copies in a room at once.
        this.roomShift = e => {
            window.alertify.confirm(`
                ${window.languageJSON.roomview.shifttext}
                <label class="block">X:
                    <input id="roomshiftx" type="number" value="${this.room.gridX}" />
                </label>
                <label class="block">Y:
                    <input id="roomshifty" type="number" value="${this.room.gridY}" />
                </label>
            `)
            .then((e, a) => {
                if (e.buttonClicked === 'ok') {
                    var dx = Number(document.getElementById('roomshiftx').value) || 0,
                        dy = Number(document.getElementById('roomshifty').value) || 0;
                    // TODO:
                }
            });
        };

        /** Saves a room (in fact, just marks a project as an unsaved, and closes the room editor) */
        this.roomSave = e => {
            // TODO:
            this.room.lastmod = +(new Date());
            this.roomGenSplash()
            .then(() => {
                window.glob.modified = true;
                this.parent.editing = false;
                this.parent.update();
            })
            .catch(err => {
                console.error(err);
                window.glob.modified = true;
                this.parent.editing = false;
                this.parent.update();
            });
        };

        var typesChanged = () => {
            this.currentType = -1;
        };
        window.signals.on('typesChanged', typesChanged);
        this.on('unmount', () => {
            window.signals.off('typesChanged', typesChanged);
        });

        /**
         * Generates a thumbnail
         */
        this.roomGenSplash = function() {
            return new Promise((accept, decline) => {
                // TODO:
            });
        };
