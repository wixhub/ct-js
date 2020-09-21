main-menu.flexcol
    nav.nogrow.flexrow(if="{global.currentProject}")
        ul#app.nav.tabs
            li.it30#ctlogo(onclick="{ctClick}" title="{voc.ctIDE}")
                svg.feather.nmr
                    use(xlink:href="data/icons.svg#menu")
                context-menu#theCatMenu(menu="{catMenu}" ref="catMenu")
            li.it30(onclick="{changeTab('patrons')}" title="{voc.patrons}" class="{active: tab === 'patrons'}")
                svg.feather
                    use(xlink:href="data/icons.svg#heart")
            li.it30.nbr(onclick="{saveProject}" title="{voc.save} (Control+S)" data-hotkey="Control+s")
                svg.feather
                    use(xlink:href="data/icons.svg#save")

        ul#mainnav.nav.tabs
            li.nbl.it30(onclick="{runProject}" class="{active: tab === 'debug'}" title="{voc.launch} {voc.launchHotkeys}" data-hotkey="F5")
                svg.feather.rotateccw(show="{exportingProject}")
                    use(xlink:href="data/icons.svg#refresh-ccw")
                svg.feather(hide="{exportingProject}")
                    use(xlink:href="data/icons.svg#play")
                span(if="{tab !== 'debug'}") {voc.launch}
                span(if="{tab === 'debug'}") {voc.restart}
            li(onclick="{changeTab('project')}" class="{active: tab === 'project'}" data-hotkey="Control+1" title="Control+1")
                svg.feather
                    use(xlink:href="data/icons.svg#sliders")
                span {voc.project}
            li(onclick="{changeTab('texture')}" class="{active: tab === 'texture'}" data-hotkey="Control+2" title="Control+2")
                svg.feather
                    use(xlink:href="data/icons.svg#texture")
                span {voc.texture}
            li(onclick="{changeTab('ui')}" class="{active: tab === 'ui'}" data-hotkey="Control+3" title="Control+3")
                svg.feather
                    use(xlink:href="data/icons.svg#ui")
                span {voc.ui}
            li(onclick="{changeTab('fx')}" class="{active: tab === 'fx'}" data-hotkey="Control+4" title="Control+4")
                svg.feather
                    use(xlink:href="data/icons.svg#sparkles")
                span {voc.fx}
            li(onclick="{changeTab('sounds')}" class="{active: tab === 'sounds'}" data-hotkey="Control+5" title="Control+5")
                svg.feather
                    use(xlink:href="data/icons.svg#headphones")
                span {voc.sounds}
            li(onclick="{changeTab('types')}" class="{active: tab === 'types'}" data-hotkey="Control+6" title="Control+6")
                svg.feather
                    use(xlink:href="data/icons.svg#type")
                span {voc.types}
            li(onclick="{changeTab('rooms')}" class="{active: tab === 'rooms'}" data-hotkey="Control+7" title="Control+7")
                svg.feather
                    use(xlink:href="data/icons.svg#room")
                span {voc.rooms}
    div.flexitem.relative(if="{global.currentProject}")
        debugger-screen-embedded(if="{tab === 'debug'}" params="{debugParams}" data-hotkey-scope="play" ref="debugger")
        project-settings(show="{tab === 'project'}" data-hotkey-scope="project")
        icon-panel(if="{tab === 'icons'}" data-hotkey-scope="icons")
        textures-panel(show="{tab === 'texture'}" data-hotkey-scope="texture")
        ui-panel(show="{tab === 'ui'}" data-hotkey-scope="ui")
        fx-panel(show="{tab === 'fx'}" data-hotkey-scope="fx")
        sounds-panel(show="{tab === 'sounds'}" data-hotkey-scope="sounds")
        types-panel(show="{tab === 'types'}" data-hotkey-scope="types")
        rooms-panel(show="{tab === 'rooms'}" data-hotkey-scope="rooms")
        license-panel(if="{showLicense}")
        patreon-screen(if="{tab === 'patrons'}" data-hotkey-scope="patrons")
        export-panel(show="{showExporter}")
    new-project-onboarding(if="{sessionStorage.showOnboarding && localStorage.showOnboarding !== 'off'}")
    script.
        const fs = require('fs-extra'),
              path = require('path');
        const archiver = require('archiver');
        const glob = require('./data/node_requires/glob');

        this.namespace = 'menu';
        this.mixin(window.riotVoc);

        this.tab = 'project';
        this.changeTab = tab => () => {
            this.tab = tab;
            window.hotkeys.cleanScope();
            window.hotkeys.push(tab);
            window.signals.trigger('globalTabChanged');
            window.signals.trigger(`${tab}Focus`);
        };

        const languageSubmenu = {
            items: [],
            columns: 2
        };
        const recentProjectsSubmenu = {
            items: []
        };
        this.refreshLatestProject = function refreshLatestProject() {
            recentProjectsSubmenu.items.length = 0;
            var lastProjects;
            if (('lastProjects' in localStorage) &&
                (localStorage.lastProjects !== '')) {
                lastProjects = localStorage.lastProjects.split(';');
            } else {
                lastProjects = [];
            }
            for (const project of lastProjects) {
                recentProjectsSubmenu.items.push({
                    label: project,
                    click() {
                        alertify.confirm(window.languageJSON.common.reallyexit, e => {
                            if (e) {
                                window.signals.trigger('resetAll');
                                window.loadProject(project);
                            }
                        });
                    }
                });
            }
        };
        this.ctClick = (e) => {
            this.refreshLatestProject();
            if (e) {
                this.refs.catMenu.toggle();
            }
        };
        this.saveProject = () => {
            const YAML = require('js-yaml');
            return new Promise(function (resolve, reject) {
                const data = Object.assign({}, global.currentProject);

                for (const key of [
                    'actions',
                    'emitterTandems',
                    //'fonts',
                    'rooms',
                    'scripts',
                    'skeletons',
                    'sounds',
                    'styles',
                    'textures',
                    'types',
                ]) {
                    delete data[key];
                    let dirPath = path.join(global.projdir, "contents", key);
                    if (key === "scripts") {
                        dirPath = path.join(global.projdir, key);
                    }
                    if (key !== 'actions') {
                        fs.ensureDirSync(dirPath);
                        fs.emptyDirSync(dirPath);
                        try {
                            fs.removeSync(path.join(dirPath, '..', '..', key)); // Try to clean the directory outside the 'contents' folder
                        } catch (e) {
                            void 0;
                        }
                    }
                    switch (key) {
                        case 'actions': {
                            const ext = '.yaml';
                            const fileName = 'Actions';
                            const actions = [];
                            dirPath = path.join(global.projdir, "contents");
                            for (const action of global.currentProject.actions) {
                                actions.push(action);
                            }
                            try {
                                fs.unlinkSync(path.join(dirPath, '..', fileName + ext));
                            } catch (e) {
                                void 0;
                            }
                            fs.outputFileSync(
                                path.join(dirPath, fileName + ext),
                                YAML.safeDump(actions)
                            );
                            break;
                        }

                        case 'emitterTandems': {
                            const ext = '.cttandem';
                            for (const emitter of global.currentProject.emitterTandems) {
                                const tmp = Object.assign({}, emitter);
                                //delete tmp.name;
                                fs.outputFileSync(
                                    path.join(dirPath, emitter.name + ext),
                                    YAML.safeDump(tmp)
                                );
                            }
                            break;
                        }

                        /*case 'fonts': {
                            const ext = '.ctfont';
                            fs.emptyDirSync(dirPath);
                            for (const font of global.currentProject.fonts) {
                                fs.outputFileSync(
                                    path.join(dirPath, font.typefaceName + ext),
                                    YAML.safeDump(font)
                                );
                            }
                            break;
                        }*/

                        case 'rooms': {
                            const ext = '.ctroom';
                            for (const room of global.currentProject.rooms) {
                                const tmp = {};
                                tmp.name = room.name;
                                tmp.width = room.width;
                                tmp.height = room.height;
                                tmp.uid = room.uid;
                                tmp.thumbnail = room.thumbnail;
                                tmp.lastmod = room.lastmod;
                                tmp.gridX = room.gridX;
                                tmp.gridY = room.gridY;
                                fs.outputFileSync(
                                    path.join(dirPath, room.name + ext),
                                    YAML.safeDump(tmp)
                                );
                                try {
                                    fs.mkdirSync(path.join(dirPath, room.name + ext + '.data'));
                                } catch (e) {
                                    void 0;
                                }
                                const tmp2 = {};
                                tmp2.backgrounds = room.backgrounds;
                                tmp2.copies = room.copies;
                                tmp2.tiles = room.tiles;
                                fs.outputFileSync(
                                    path.join(
                                        dirPath,
                                        room.name + ext + '.data',
                                        'contents.yaml'
                                    ),
                                    YAML.safeDump(tmp2)
                                );
                                fs.outputFileSync(
                                    path.join(
                                        dirPath,
                                        room.name + ext + '.data',
                                        'oncreate.js'
                                    ),
                                    room.oncreate
                                );
                                fs.outputFileSync(
                                    path.join(dirPath, room.name + ext + '.data', 'onstep.js'),
                                    room.onstep
                                );
                                fs.outputFileSync(
                                    path.join(dirPath, room.name + ext + '.data', 'ondraw.js'),
                                    room.ondraw
                                );
                                fs.outputFileSync(
                                    path.join(dirPath, room.name + ext + '.data', 'onleave.js'),
                                    room.onleave
                                );
                            }
                            break;
                        }

                        case 'scripts': {
                            const ext = '.js';
                            const scripts = [];
                            for (const script of global.currentProject.scripts) {
                                scripts.push(script.name);
                                fs.outputFileSync(
                                    path.join(dirPath, script.name + ext),
                                    script.code
                                );
                            }
                            fs.outputFileSync(
                                path.join(dirPath, 'scriptOrder.yaml'),
                                YAML.safeDump(scripts)
                            );
                            break;
                        }

                        case 'skeletons': {
                            const ext = '.ctskeleton';
                            for (const skeleton of global.currentProject.skeletons) {
                                fs.outputFileSync(
                                    path.join(dirPath, skeleton.name + ext),
                                    YAML.safeDump(skeleton)
                                );
                            }
                            break;
                        }

                        case 'sounds': {
                            const ext = '.ctsound';
                            for (const sound of global.currentProject.sounds) {
                                fs.outputFileSync(
                                    path.join(dirPath, sound.name + ext),
                                    YAML.safeDump(sound)
                                );
                            }
                            break;
                        }

                        case 'styles': {
                            const ext = '.ctfont';
                            for (const style of global.currentProject.styles) {
                                fs.outputFileSync(
                                    path.join(dirPath, style.name + ext),
                                    YAML.safeDump(style)
                                );
                            }
                            break;
                        }

                        case 'textures': {
                            const ext = '.cttexture';
                            for (const texture of global.currentProject.textures) {
                                /*const tmp = {};
                                tmp.name = texture.name;
                                tmp.depth = texture.depth;
                                tmp.texture = texture.texture;
                                tmp.uid = texture.uid;
                                tmp.extends = texture.extends;
                                tmp.lastmod = texture.lastmod;*/
                                fs.outputFileSync(
                                    path.join(dirPath, texture.name + ext),
                                    YAML.safeDump(texture)
                                );
                                /*try {
                                    fs.mkdirSync(
                                        path.join(dirPath, texture.name + ext + '.data')
                                    );
                                } catch (e) {
                                    void 0;
                                }
                                fs.outputFileSync(
                                    path.join(
                                        dirPath,
                                        texture.name + ext + '.data',
                                        'oncreate.js'
                                    ),
                                    texture.oncreate
                                );
                                fs.outputFileSync(
                                    path.join(
                                        dirPath,
                                        texture.name + ext + '.data',
                                        'onstep.js'
                                    ),
                                    texture.onstep
                                );
                                fs.outputFileSync(
                                    path.join(
                                        dirPath,
                                        texture.name + ext + '.data',
                                        'ondraw.js'
                                    ),
                                    texture.ondraw
                                );
                                fs.outputFileSync(
                                    path.join(
                                        dirPath,
                                        texture.name + ext + '.data',
                                        'onleave.js'
                                    ),
                                    texture.onleave
                                );*/
                            }
                            break;
                        }

                        case 'types': {
                            const ext = '.cttype';
                            for (const type of global.currentProject.types) {
                                const tmp = {};
                                tmp.name = type.name;
                                tmp.depth = type.depth;
                                tmp.texture = type.texture;
                                tmp.uid = type.uid;
                                tmp.extends = type.extends;
                                tmp.lastmod = type.lastmod;
                                fs.outputFileSync(
                                    path.join(dirPath, type.name + ext),
                                    YAML.safeDump(tmp)
                                );
                                try {
                                    fs.mkdirSync(path.join(dirPath, type.name + ext + '.data'));
                                } catch (e) {
                                    void 0;
                                }
                                fs.outputFileSync(
                                    path.join(
                                        dirPath,
                                        type.name + ext + '.data',
                                        'oncreate.js'
                                    ),
                                    type.oncreate
                                );
                                fs.outputFileSync(
                                    path.join(dirPath, type.name + ext + '.data', 'onstep.js'),
                                    type.onstep
                                );
                                fs.outputFileSync(
                                    path.join(dirPath, type.name + ext + '.data', 'ondraw.js'),
                                    type.ondraw
                                );
                                fs.outputFileSync(
                                    path.join(dirPath, type.name + ext + '.data', 'ondestroy.js'),
                                    type.ondestroy
                                );
                            }
                            break;
                        }

                        default: {
                            console.error(key + ' was not saved! Maybe a new feature?');
                            break;
                        }
                    }
                    console.debug(key + " saved successfully.");
                }

                fs.outputFileSync(path.join(global.projdir, path.basename(global.projdir + '.ict')), YAML.safeDump(data));
                resolve();
            }).then(() => {
                alertify.success(languageJSON.common.savedcomm, "success", 3000);
                this.saveRecoveryDebounce();
                fs.remove(global.projdir + '.ict.recovery')
                    .then(() => console.log())
                    .catch(console.error);
                glob.modified = false;
            })
                .catch((e) => { alertify.error(e); console.error(e) });
        };
        this.saveRecovery = () => {
            if (global.currentProject) {
                const YAML = require('js-yaml');
                const data = YAML.safeDump(global.currentProject);
                fs.outputFile(path.join(global.projdir, path.basename(global.projdir + '.ict.recovery')), data);
            }
            this.saveRecoveryDebounce();
        };
        this.saveRecoveryDebounce = window.debounce(this.saveRecovery, 1000 * 60 * 5);
        window.signals.on('saveProject', this.saveProject);
        this.on('unmount', () => {
            window.signals.off('saveProject', this.saveProject);
        });
        this.saveRecoveryDebounce();

        const {getExportDir} = require('./data/node_requires/platformUtils');
        // Run a local server for ct.js games
        let fileServer;
        getExportDir().then(dir => {
            const fileServerSettings = {
                public: dir,
                cleanUrls: true
            };
            const handler = require('serve-handler');
            fileServer = require('http').createServer((request, response) =>
                handler(request, response, fileServerSettings));
            fileServer.listen(0, () => {
                // eslint-disable-next-line no-console
                console.info(`[ct.debugger] Running dev server at http://localhost:${fileServer.address().port}`);
            });
        });

        this.runProject = () => {
            document.body.style.cursor = 'progress';
            this.exportingProject = true;
            this.update();
            const runCtExport = require('./data/node_requires/exporter');
            runCtExport(global.currentProject, global.projdir)
            .then(() => {
                if (localStorage.disableBuiltInDebugger === 'yes') {
                    // Open in default browser
                    nw.Shell.openExternal(`http://localhost:${fileServer.address().port}/`);
                } else if (this.tab === 'debug') {
                    // Restart the game as we already have the tab opened
                    this.refs.debugger.restartGame();
                } else {
                    // Open the debugger as usual
                    this.tab = 'debug';
                    this.debugParams = {
                        title: global.currentProject.settings.authoring.title,
                        link: `http://localhost:${fileServer.address().port}/`
                    };
                }
            })
            .catch(e => {
                window.alertify.error(e);
                console.error(e);
            })
            .finally(() => {
                document.body.style.cursor = '';
                this.exportingProject = false;
                this.update();
            });
        };
        this.runProjectAlt = () => {
            const runCtExport = require('./data/node_requires/exporter');
            runCtExport(global.currentProject, global.projdir)
            .then(() => {
                nw.Shell.openExternal(`http://localhost:${fileServer.address().port}/`);
            });
        };
        window.hotkeys.on('Alt+F5', this.runProjectAlt);

        this.zipProject = async () => {
            try {
                const os = require('os');
                const path = require('path');
                const {getWritableDir} = require('./data/node_requires/platformUtils');

                const writable = await getWritableDir();
                const inDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctZipProject-')),
                      outName = path.join(writable, `/${sessionStorage.projname}.zip`);

                await this.saveProject();
                await fs.remove(outName);
                await fs.remove(inDir);
                await fs.copy(global.projdir + '.ict', path.join(inDir, sessionStorage.projname));
                await fs.copy(global.projdir, path.join(inDir, sessionStorage.projname.slice(0, -4)));

                const archive = archiver('zip'),
                      output = fs.createWriteStream(outName);

                output.on('close', () => {
                    nw.Shell.showItemInFolder(outName);
                    alertify.success(this.voc.successZipProject.replace('{0}', outName));
                    fs.remove(inDir);
                });

                archive.pipe(output);
                archive.directory(inDir, false);
                archive.finalize();
            } catch (e) {
                alertify.error(e);
            }
        };
        this.zipExport = async () => {
            const {getBuildDir, getExportDir} = require('./data/node_requires/platformUtils');
            const buildFolder = await getBuildDir();
            const runCtExport = require('./data/node_requires/exporter');
            const exportFile = path.join(
                buildFolder,
                `${global.currentProject.settings.authoring.title || 'ct.js game'}.zip`
            );
            const inDir = await getExportDir();
            await fs.remove(exportFile);
            runCtExport(global.currentProject, global.projdir)
            .then(() => {
                const archive = archiver('zip'),
                      output = fs.createWriteStream(exportFile);
                output.on('close', () => {
                    nw.Shell.showItemInFolder(exportFile);
                    alertify.success(this.voc.successZipExport.replace('{0}', exportFile));
                });
                archive.pipe(output);
                archive.directory(inDir, false);
                archive.finalize();
            })
            .catch(alertify.error);
        };
        localStorage.UItheme = localStorage.UItheme || 'Day';
        this.switchTheme = theme => {
            localStorage.UItheme = theme;
            document.getElementById('themeCSS').href = `./data/theme${theme}.css`;
            window.signals.trigger('UIThemeChanged', theme);
        };

        const troubleshootingSubmenu = {
            items: [{
                label: window.languageJSON.menu.toggleDevTools,
                icon: 'terminal',
                hotkeyLabel: 'Ctrl+Shift+C',
                click: () => {
                    const win = nw.Window.get();
                    win.showDevTools();
                }
            }, {
                label: window.languageJSON.menu.copySystemInfo,
                icon: 'file-text',
                click: () => {
                    const os = require('os'),
                          path = require('path');
                    const packaged = path.basename(process.execPath, path.extname(process.execPath)) !== 'nw';
                    const report = `Ct.js v${process.versions.ctjs} 😽 ${packaged ? '(packaged)' : '(runs from sources)'}\n\n` +
                          `NW.JS v${process.versions.nw}\n` +
                          `Chromium v${process.versions.chromium}\n` +
                          `Node.js v${process.versions.node}\n` +
                          `Pixi.js v${PIXI.VERSION}\n\n` +
                          `OS ${process.platform} ${process.arch} // ${os.type()} ${os.release()}`;
                    nw.Clipboard.get().set(report, 'text');
                }
            }, {
                label: window.languageJSON.menu.disableBuiltInDebugger,
                type: 'checkbox',
                checked: () => localStorage.disableBuiltInDebugger === 'yes',
                click: () => {
                    if (localStorage.disableBuiltInDebugger === 'yes') {
                        localStorage.disableBuiltInDebugger = 'no';
                    } else {
                        localStorage.disableBuiltInDebugger = 'yes';
                    }
                }
            }, {
                type: 'separator'
            }, {
                label: window.languageJSON.menu.openIconList,
                click: () => {
                    this.tab = 'icons';
                    this.update();
                }
            }, {
                type: 'separator'
            }, {
                icon: 'discord',
                iconClass: 'icon',
                label: window.languageJSON.menu.visitDiscordForGamedevSupport,
                click: () => {
                    nw.Shell.openExternal('https://discord.gg/3f7TsRC');
                }
            }, {
                icon: 'github',
                iconClass: 'icon',
                label: window.languageJSON.menu.postAnIssue,
                click: () => {
                    nw.Shell.openExternal('https://github.com/ct-js/ct-js/issues/new/choose');
                }
            }]
        };

        const settingsSubmenu = {
            items: [{
                label: window.languageJSON.common.language,
                submenu: languageSubmenu
            }, {
                label: window.languageJSON.menu.theme,
                submenu: {
                    items: [{
                        label: window.languageJSON.menu.themeDay,
                        icon: () => localStorage.UItheme === 'Day' && 'check',
                        click: () => {
                            this.switchTheme('Day');
                        }
                    }, {
                        label: window.languageJSON.menu.themeSpringStream || 'Spring Stream',
                        icon: () => localStorage.UItheme === 'SpringStream' && 'check',
                        click: () => {
                            this.switchTheme('SpringStream');
                        }
                    }, {
                        type: 'separator'
                    }, {
                        label: window.languageJSON.menu.themeNight || 'Night',
                        icon: () => localStorage.UItheme === 'Night' && 'check',
                        click: () => {
                            this.switchTheme('Night');
                        }
                    }, {
                        label: window.languageJSON.menu.themeHorizon || 'Horizon',
                        icon: () => localStorage.UItheme === 'Horizon' && 'check',
                        click: () => {
                            this.switchTheme('Horizon');
                        }
                    }, {
                        label: window.languageJSON.menu.themeLucasDracula || 'LucasDracula',
                        icon: () => localStorage.UItheme === 'LucasDracula' && 'check',
                        click: () => {
                            this.switchTheme('LucasDracula');
                        }
                    }]
                }
            }, {
                label: window.languageJSON.menu.codeFont,
                submenu: {
                    items: [{
                        label: window.languageJSON.menu.codeFontDefault,
                        icon: () => !localStorage.fontFamily && 'check',
                        click: () => {
                            localStorage.fontFamily = '';
                            window.signals.trigger('codeFontUpdated');
                        }
                    }, {
                        label: window.languageJSON.menu.codeFontOldSchool,
                        icon: () => localStorage.fontFamily === 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace' && 'check',
                        click: () => {
                            localStorage.fontFamily = 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace';
                            window.signals.trigger('codeFontUpdated');
                        }
                    }, {
                        label: window.languageJSON.menu.codeFontSystem,
                        icon: () => localStorage.fontFamily === 'monospace' && 'check',
                        click: () => {
                            localStorage.fontFamily = 'monospace';
                            window.signals.trigger('codeFontUpdated');
                        }
                    }, {
                        label: window.languageJSON.menu.codeFontCustom,
                        click: () => {
                            alertify
                            .defaultValue(localStorage.fontFamily || '')
                            .prompt(window.languageJSON.menu.newFont)
                            .then(e => {
                                if (e.inputValue && e.buttonClicked !== 'cancel') {
                                    localStorage.fontFamily = `"${e.inputValue}", monospace`;
                                }
                                window.signals.trigger('codeFontUpdated');
                            });
                        }
                    }, {
                        type: 'separator'
                    }, {
                        label: window.languageJSON.menu.codeLigatures,
                        type: 'checkbox',
                        checked: () => localStorage.codeLigatures !== 'off',
                        click: () => {
                            localStorage.codeLigatures = localStorage.codeLigatures === 'off' ? 'on' : 'off';
                            window.signals.trigger('codeFontUpdated');
                        }
                    }, {
                        label: window.languageJSON.menu.codeDense,
                        type: 'checkbox',
                        checked: () => localStorage.codeDense === 'on',
                        click: () => {
                            localStorage.codeDense = localStorage.codeDense === 'off' ? 'on' : 'off';
                            window.signals.trigger('codeFontUpdated');
                        }
                    }]
                }
            }, {
                type: 'separator'
            }, {
                label: window.languageJSON.menu.disableSounds,
                type: 'checkbox',
                checked: () => localStorage.disableSounds === 'on',
                click: () => {
                    localStorage.disableSounds = (localStorage.disableSounds || 'off') === 'off' ? 'on' : 'off';
                }
            }, {
                type: 'separator'
            }, {
                label: window.languageJSON.common.zoomIn,
                icon: 'zoom-in',
                click: () => {
                    const win = nw.Window.get();
                    let zoom = win.zoomLevel + 0.5;
                    if (Number.isNaN(zoom) || !zoom || !Number.isFinite(zoom)) {
                        zoom = 0;
                    } else if (zoom > 5) {
                        zoom = 5;
                    }
                    win.zoomLevel = zoom;

                    localStorage.editorZooming = zoom;
                },
                hotkey: 'Control+=',
                hotkeyLabel: 'Ctrl+='
            }, {
                label: window.languageJSON.common.zoomOut,
                icon: 'zoom-out',
                click: () => {
                    const win = nw.Window.get();
                    let zoom = win.zoomLevel - 0.5;
                    if (Number.isNaN(zoom) || !zoom || !Number.isFinite(zoom)) {
                        zoom = 0;
                    } else if (zoom < -3) {
                        zoom = -3;
                    }
                    win.zoomLevel = zoom;

                    localStorage.editorZooming = zoom;
                },
                hotkey: 'Control+-',
                hotkeyLabel: 'Ctrl+-'
            }]
        };

        this.catMenu = {
            items: [{
                label: window.languageJSON.common.save,
                icon: 'save',
                click: this.saveProject,
                hotkey: 'Control+s',
                hotkeyLabel: 'Ctrl+S'
            }, {
                label: this.voc.exportDesktop,
                click: () => {
                    this.showExporter = true;
                    this.update();
                },
                icon: 'package'
            }, {
                label: this.voc.zipExport,
                click: this.zipExport,
                icon: 'upload-cloud'
            }, {
                label: this.voc.zipProject,
                click: this.zipProject
            }, {
                label: this.voc.openIncludeFolder,
                click: () => {
                    fs.ensureDir(path.join(global.projdir, '/include'))
                    .then(() => {
                        nw.Shell.openItem(path.join(global.projdir, '/include'));
                    });
                }
            }, {
                type: 'separator'
            }, {
                label: window.languageJSON.menu.openProject,
                icon: 'folder',
                click: () => {
                    alertify.confirm(window.languageJSON.common.reallyexit, () => {
                        window.showOpenDialog({
                            defaultPath: require('./data/node_requires/resources/projects').getDefaultProjectDir(),
                            title: window.languageJSON.menu.openProject,
                            filter: '.ict'
                        })
                        .then(projFile => {
                            if (!projFile) {
                                return;
                            }
                            window.signals.trigger('resetAll');
                            window.loadProject(projFile);
                        });
                    });
                }
            }, { // The same as "Open project" item, but shows an examples' folder first
                label: window.languageJSON.menu.openExample,
                click: () => {
                    alertify.confirm(window.languageJSON.common.reallyexit, () => {
                        window.showOpenDialog({
                            defaultPath: require('./data/node_requires/resources/projects').getExamplesDir(),
                            title: window.languageJSON.menu.openProject,
                            filter: '.ict'
                        })
                        .then(projFile => {
                            if (!projFile) {
                                return;
                            }
                            window.signals.trigger('resetAll');
                            window.loadProject(projFile);
                        });
                    });
                }
            }, {
                label: window.languageJSON.intro.latest,
                submenu: recentProjectsSubmenu
            }, {
                label: window.languageJSON.menu.startScreen,
                click: () => {
                    alertify.confirm(window.languageJSON.common.reallyexit, e => {
                        if (e) {
                            window.signals.trigger('resetAll');
                        }
                    });
                }
            }, {
                type: 'separator'
            }, {
                label: window.languageJSON.menu.settings,
                submenu: settingsSubmenu,
                icon: 'settings'
            }, {
                label: window.languageJSON.common.contribute,
                click: () => {
                    nw.Shell.openExternal('https://github.com/ct-js/ct-js');
                },
                icon: 'code'
            }, {
                label: window.languageJSON.common.donate,
                icon: 'heart',
                click: () => {
                    nw.Shell.openExternal('https://www.patreon.com/comigo');
                }
            }, {
                label: window.languageJSON.menu.troubleshooting,
                icon: 'alert-circle',
                submenu: troubleshootingSubmenu
            }, {
                label: window.languageJSON.common.ctsite,
                click: () => {
                    nw.Shell.openExternal('https://ctjs.rocks/');
                }
            }, {
                label: window.languageJSON.menu.license,
                click: () => {
                    this.showLicense = true;
                    this.update();
                }
            }]
        };
        this.switchLanguage = filename => {
            const i18n = require('./data/node_requires/i18n.js');
            const {extend} = require('./data/node_requires/objectUtils');
            try {
                window.languageJSON = i18n.loadLanguage(filename);
                localStorage.appLanguage = filename;
                window.signals.trigger('updateLocales');
                window.riot.update();
                console.log('Applied a new language file.');
            } catch (e) {
                alertify.alert('Could not open a language file: ' + e);
            }
        };
        var {switchLanguage} = this;

        fs.readdir('./data/i18n/')
        .then(files => {
            files.forEach(filename => {
                if (path.extname(filename) !== '.json') {
                    return;
                }
                var file = filename.slice(0, -5);
                if (file === 'Comments') {
                    return;
                }
                languageSubmenu.items.push({
                    label: file,
                    icon: () => localStorage.appLanguage === file && 'check',
                    click: () => {
                        switchLanguage(file);
                    }
                });
            });
            languageSubmenu.items.push({
                type: 'separator'
            });
            languageSubmenu.items.push({
                label: window.languageJSON.common.translateToYourLanguage,
                click: () => {
                    nw.Shell.openExternal('https://github.com/ct-js/ct-js/tree/develop/app/data/i18n');
                }
            });
        })
        .catch(e => {
            alertify.alert('Could not get i18n files: ' + e);
        });
