app-view.flexcol
    nav.nogrow.flexrow
        // Smaller control buttons
        ul.nav.tabs.nogrow.app-view-aDefaultTabGroup
            li.it30#ctlogo(onclick="{changeTab('menu')}" title="{voc.ctIDE}" class="{active: tab === 'menu'}")
                svg.feather.nmr
                    use(xlink:href="data/icons.svg#menu")
            li.it30(onclick="{changeTab('patrons')}" title="{voc.patrons}" class="{active: tab === 'patrons'}")
                svg.feather
                    use(xlink:href="data/icons.svg#heart")
            li.it30.nbr(onclick="{saveProject}" title="{vocGlob.save} (Control+S)" data-hotkey="Control+s")
                svg.feather
                    use(xlink:href="data/icons.svg#save")
            li.nbl.it30(onclick="{runProject}" class="{active: tab === 'debug'}" title="{voc.launch} {voc.launchHotkeys}" data-hotkey="F5")
                svg.feather.rotateccw(show="{exportingProject}")
                    use(xlink:href="data/icons.svg#refresh-ccw")
                svg.feather(hide="{exportingProject}")
                    use(xlink:href="data/icons.svg#play")
                span(if="{tab !== 'debug'}") {voc.launch}
                span(if="{tab === 'debug'}") {voc.restart}

            // Persistent tabs for project settings and assets
            li(onclick="{changeTab('project')}" class="{active: tab === 'project'}" data-hotkey="Control+1" title="Control+1")
                svg.feather
                    use(xlink:href="data/icons.svg#sliders")
                span {voc.project}
            li(onclick="{changeTab('assets')}" class="{active: tab === 'assets'}" data-hotkey="Control+2" title="Control+2")
                svg.feather
                    use(xlink:href="data/icons.svg#folder")
                span {voc.assets}
        ul.nav.tabs.app-view-aHorizontalScrollPortion
            // Opened assets
            virtual(each="{asset, i in openedAssets}")
                li(onclick="{openAsset(asset)}" class="{active: tab === asset}" data-hotkey="Control+{i + 3}" title="{i + 3 < 10 ? 'Control+' + (i+3) : ''}")
                    svg.feather
                        use(xlink:href="data/icons.svg#texture")
                    span {voc.texture}
        // TODO: implement long-press animation and deletion event
        svg.feather.anActionableIcon(onclick="{closeTabs}" if="{openedAssets && openedAssets.length}")
            use(xlink:href="data/icons.svg#x")
    div.flexitem.relative
        // Persistent views
        main-menu(show="{tab === 'menu'}")
        debugger-screen-embedded(if="{tab === 'debug'}" params="{debugParams}" data-hotkey-scope="play" ref="debugger")
        project-settings(show="{tab === 'project'}" data-hotkey-scope="project")
        asset-browser(show="{tab === 'assets'}" data-hotkey-scope="assets")
        patreon-screen(if="{tab === 'patrons'}" data-hotkey-scope="patrons")
        // Dynamic tabs' editors
    new-project-onboarding(if="{sessionStorage.showOnboarding && localStorage.showOnboarding !== 'off'}")
    script.
        const fs = require('fs-extra');

        this.namespace = 'appView';
        this.mixin(window.riotVoc);

        this.tab = 'project';
        this.changeTab = tab => () => {
            this.tab = tab;
            window.hotkeys.cleanScope();
            window.hotkeys.push(tab);
            window.signals.trigger('globalTabChanged', tab);
            window.signals.trigger(`${tab}Focus`);
        };
        this.changeTab(this.tab)();

        const assetListener = asset => {
            const [assetType] = asset.split('/');
            this.changeTab(assetType)();
            this.update();
        };
        window.orders.on('openAsset', assetListener);
        this.on('unmount', () => {
            window.orders.off('openAsset', assetListener);
        });

        this.saveProject = async () => {
            const {saveProject} = require('./data/node_requires/resources/projects');
            try {
                await saveProject();
                alertify.success(window.languageJSON.common.savedcomm, 'success', 3000);
            } catch (e) {
                alertify.error(e);
            }
        };
        this.saveRecovery = () => {
            const {saveProject, getProjectPath, getProject} = require('./data/node_requires/resources/projects');
            saveProject(getProject(), getProjectPath());
            this.saveRecoveryDebounce();
        };

        const debounce = require('./data/node_requires/utils/debounce').default;
        this.saveRecoveryDebounce = debounce(this.saveRecovery, 1000 * 60 * 5);
        window.signals.on('saveProject', this.saveProject);
        this.on('unmount', () => {
            window.signals.off('saveProject', this.saveProject);
        });
        this.saveRecoveryDebounce();

        const {getExportDir} = require('./data/node_requires/platformUtils');
        // Run a local server for ct.js games
        let fileServer;
        if (!this.debugServerStarted) {
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
                this.debugServerStarted = true;
            });
        }

        this.runProject = () => {
            const {getProject} = require('./data/node_requires/resources/projects');
            document.body.style.cursor = 'progress';
            this.exportingProject = true;
            this.update();
            const runCtExport = require('./data/node_requires/exporter');
            runCtExport(getProject(), global.projdir)
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
                        title: getProject().settings.authoring.title,
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
            const {getProject} = require('./data/node_requires/resources/projects');
            const runCtExport = require('./data/node_requires/exporter');
            runCtExport(getProject(), global.projdir)
            .then(() => {
                nw.Shell.openExternal(`http://localhost:${fileServer.address().port}/`);
            });
        };
        window.hotkeys.on('Alt+F5', this.runProjectAlt);
        this.on('unmount', () => {
            window.hotkeys.off('Alt+F5', this.runProjectAlt);
        });

        this.toggleFullscreen = function toggleFullscreen() {
            nw.Window.get().toggleFullscreen();
        };
        window.hotkeys.on('F11', this.toggleFullscreen);
        this.on('unmount', () => {
            window.hotkeys.off('F11', this.toggleFullscreen);
        });
